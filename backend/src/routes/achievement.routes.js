// ─────────────────────────────────────────────────────────────────────────────
// routes/achievement.routes.js   —   ALL SQL BUGS FIXED
//
// Fix 1: GROUP BY a.id, u.id, cb.id  →  cb.* columns are now functionally
//         dependent on cb.id so PostgreSQL won't throw 42803 anymore.
// Fix 2: Student search no longer references u.fname / u.lname.
//         Uses COALESCE(u.name, u.username) only.
// Fix 3: achSelect() helper is a plain string — no dangling JOINs in the
//         GROUP BY clause itself; each caller appends its own WHERE + GROUP BY.
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const pool    = require("../db/db");
const auth    = require("../middleware/auth.middleware");
const role    = require("../middleware/role.middleware");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const router = express.Router();

// ── constants ──────────────────────────────────────────────────────────────────
const VALID_TYPES    = ["internal", "external"];
const VALID_LEVELS   = [
  "Inter-Department","Inter-College","College",
  "District","Zonal","State","National","International",
];
const VALID_STATUSES = ["pending", "approved", "rejected"];
const VALID_POSITIONS = [
  "Gold","Silver","Bronze",
  "1st Place","2nd Place","3rd Place",
  "Winner","Runner-up","Participant",
];

// ── helpers ────────────────────────────────────────────────────────────────────
const isStaff = (req) =>
  req.user &&
  (req.user.role === "admin" ||
   ["director","staff"].includes(req.user.activeRole || "") ||
   ["director","staff"].includes(req.user.role || ""));

/** Attach JWT to req.user if present; never block the request. */
const optionalAuth = (req, _res, next) => {
  const hdr = req.headers.authorization || "";
  if (!hdr.startsWith("Bearer ")) return next();
  try {
    const jwt = require("jsonwebtoken");
    req.user  = jwt.verify(hdr.split(" ")[1], process.env.JWT_SECRET);
  } catch { /* expired / invalid — treat as unauthenticated */ }
  next();
};

// ── multer ─────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads/achievements");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_q, _f, cb) => cb(null, uploadDir),
  filename:    (_q, file, cb) =>
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  fileFilter: (_q, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    /^(jpe?g|png|gif|webp|mp4|mov|avi|mkv|webm|pdf)$/.test(ext)
      ? cb(null, true) : cb(new Error(`File type .${ext} not allowed`), false);
  },
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024 },
});

// ── shared SQL fragments ───────────────────────────────────────────────────────
//
// KEY FIX: GROUP BY a.id, u.id, cb.id
//   • a.id    → all a.* are functionally dependent → no need to list them
//   • u.id    → all u.* are functionally dependent → no need to list them
//   • cb.id   → all cb.* (cb.name, cb.username …) are functionally dependent
//               → FIXES the "cb.username must appear in GROUP BY" 42803 error
//
// We keep the SELECT fragment as a function so we can toggle private-field masking.
const ACH_JOINS = `
  FROM achievements a
  JOIN  users u  ON a.student_id = u.id
  LEFT  JOIN users cb ON a.createdby = cb.id
  LEFT  JOIN achievement_media m ON m.achievement_id = a.id
`;

const ACH_GROUP_BY = `
  GROUP BY a.id, u.id, cb.id
`;

function achSelect(maskPrivate = false) {
  const personal = maskPrivate
    ? `u.id                                          AS student_id,
       COALESCE(u.name, u.username)                  AS student_name,
       u.department,
       COALESCE(u.batch, u.batch_year, '')            AS batch,
       COALESCE(u.rollno, '')                         AS rollno,
       u.photo_url`
    : `u.id                                          AS student_id,
       COALESCE(u.name, u.username)                  AS student_name,
       u.department,
       COALESCE(u.batch, u.batch_year, '')            AS batch,
       COALESCE(u.rollno,     '')                     AS rollno,
       COALESCE(u.reg_number, '')                     AS reg_number,
       u.phone, u.email, u.gender, u.blood_group, u.photo_url`;

  return `
    SELECT
      a.id, a.type, a.level, a.sport, a.event_category, a.eventname,
      a.position, a.achievement_type, a.team_name,
      a.achievementdate, a.venue, a.academic_year, a.organizer,
      a.description, a.cashprize, a.certificate, a.merit_card,
      a.status, a.rejection_reason,
      a.created_at, a.updated_at, a.createdby,
      COALESCE(cb.name, cb.username, 'System')        AS createdby_name,
      ${personal},
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id',         m.id,
            'media_type', m.media_type,
            'file_name',  m.file_name,
            'caption',    m.caption,
            'url',        '/uploads/achievements/' ||
                          REGEXP_REPLACE(m.file_path, '^.*[/\\\\]', '')
          ) ORDER BY m.uploaded_at
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'::json
      )                                               AS media
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/achievements/portal-summary   — public hero stats
// ─────────────────────────────────────────────────────────────────────────────
router.get("/portal-summary", async (_req, res) => {
  try {
    const [totals, byDept, bySport, recent, trend, topStudents] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                              AS total,
          COUNT(*) FILTER (WHERE position = 'Gold')            AS gold,
          COUNT(*) FILTER (WHERE position = 'Silver')          AS silver,
          COUNT(*) FILTER (WHERE position = 'Bronze')          AS bronze,
          COUNT(DISTINCT student_id)                           AS unique_students,
          COUNT(DISTINCT sport)  FILTER (WHERE sport IS NOT NULL) AS unique_sports,
          COUNT(DISTINCT eventname)                            AS unique_events,
          COUNT(*) FILTER (WHERE type = 'external')            AS external_count,
          COUNT(*) FILTER (WHERE type = 'internal')            AS internal_count,
          COUNT(*) FILTER (WHERE achievement_type = 'team')    AS team_count,
          COALESCE(SUM(cashprize), 0)                          AS total_prize
        FROM achievements WHERE status = 'approved'
      `),
      pool.query(`
        SELECT
          u.department,
          COUNT(*)                                             AS total,
          COUNT(*) FILTER (WHERE a.position = 'Gold')         AS gold,
          COUNT(*) FILTER (WHERE a.position = 'Silver')       AS silver,
          COUNT(*) FILTER (WHERE a.position = 'Bronze')       AS bronze,
          COUNT(DISTINCT a.student_id)                        AS students
        FROM achievements a
        JOIN users u ON a.student_id = u.id
        WHERE a.status = 'approved' AND u.department IS NOT NULL
        GROUP BY u.department
        ORDER BY gold DESC, total DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT
          sport,
          COUNT(*)                                            AS total,
          COUNT(*) FILTER (WHERE position = 'Gold')          AS gold,
          COUNT(*) FILTER (WHERE position = 'Silver')        AS silver,
          COUNT(*) FILTER (WHERE position = 'Bronze')        AS bronze
        FROM achievements
        WHERE status = 'approved' AND sport IS NOT NULL
        GROUP BY sport
        ORDER BY gold DESC, total DESC
        LIMIT 12
      `),
      pool.query(`
        SELECT
          a.id, a.position, a.eventname, a.sport, a.level,
          a.achievementdate, a.type, a.achievement_type,
          COALESCE(u.name, u.username)                       AS student_name,
          u.department, u.photo_url,
          COALESCE(u.batch, u.batch_year, '')                AS batch
        FROM achievements a
        JOIN users u ON a.student_id = u.id
        WHERE a.status = 'approved'
        ORDER BY a.achievementdate DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT
          COALESCE(academic_year, EXTRACT(YEAR FROM achievementdate)::text) AS yr,
          COUNT(*)                                           AS total,
          COUNT(*) FILTER (WHERE position = 'Gold')         AS gold,
          COUNT(*) FILTER (WHERE position = 'Silver')       AS silver,
          COUNT(*) FILTER (WHERE position = 'Bronze')       AS bronze,
          COUNT(*) FILTER (WHERE type = 'external')         AS external_count,
          COALESCE(SUM(cashprize), 0)                       AS prize
        FROM achievements
        WHERE status = 'approved'
        GROUP BY 1
        ORDER BY 1
      `),
      pool.query(`
        SELECT
          u.id,
          COALESCE(u.name, u.username)                      AS student_name,
          u.department,
          COALESCE(u.batch, u.batch_year, '')               AS batch,
          u.photo_url, u.rollno,
          COUNT(*)                                          AS total,
          COUNT(*) FILTER (WHERE a.position = 'Gold')       AS gold,
          COUNT(*) FILTER (WHERE a.position = 'Silver')     AS silver,
          COUNT(*) FILTER (WHERE a.position = 'Bronze')     AS bronze,
          COALESCE(SUM(a.cashprize), 0)                     AS prize,
          ARRAY_AGG(DISTINCT a.sport)
            FILTER (WHERE a.sport IS NOT NULL)              AS sports
        FROM achievements a
        JOIN users u ON a.student_id = u.id
        WHERE a.status = 'approved'
        GROUP BY u.id
        ORDER BY
          (COUNT(*) FILTER (WHERE a.position='Gold'))   * 5 +
          (COUNT(*) FILTER (WHERE a.position='Silver')) * 3 +
          (COUNT(*) FILTER (WHERE a.position='Bronze')) * 1 DESC
        LIMIT 10
      `),
    ]);

    res.json({
      totals:      totals.rows[0],
      byDepts:     byDept.rows,
      bySports:    bySport.rows,
      recentWins:  recent.rows,
      yearTrend:   trend.rows,
      topStudents: topStudents.rows,
    });
  } catch (err) {
    console.error("GET /portal-summary error:", err.message);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/achievements   — paginated list with filters
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const staff = isStaff(req);
    const {
      type, department, level, position, sport, status,
      year, academic_year, search, achievement_type,
      page = 1, limit = 24,
    } = req.query;

    const conds  = [];
    const params = [];
    let   pi     = 1;

    if (!staff) {
      conds.push(`a.status = 'approved'`);
    } else if (status && VALID_STATUSES.includes(status)) {
      conds.push(`a.status = $${pi++}`);
      params.push(status);
    }

    if (type  && VALID_TYPES.includes(type))  { conds.push(`a.type = $${pi++}`);    params.push(type);  }
    if (level && VALID_LEVELS.includes(level)){ conds.push(`a.level = $${pi++}`);   params.push(level); }
    if (position)       { conds.push(`a.position = $${pi++}`);          params.push(position); }
    if (sport)          { conds.push(`a.sport ILIKE $${pi++}`);         params.push(`%${sport}%`); }
    if (achievement_type) { conds.push(`a.achievement_type = $${pi++}`); params.push(achievement_type); }
    if (department)     { conds.push(`u.department = $${pi++}`);        params.push(department); }
    if (year)           { conds.push(`EXTRACT(YEAR FROM a.achievementdate) = $${pi++}`); params.push(parseInt(year)); }
    if (academic_year)  { conds.push(`a.academic_year = $${pi++}`);     params.push(academic_year); }
    if (search) {
      conds.push(`(
        COALESCE(u.name, u.username, '') ILIKE $${pi}  OR
        a.eventname                      ILIKE $${pi}  OR
        COALESCE(a.sport,      '')       ILIKE $${pi}  OR
        COALESCE(u.rollno,     '')       ILIKE $${pi}  OR
        COALESCE(a.team_name,  '')       ILIKE $${pi}  OR
        COALESCE(a.venue,      '')       ILIKE $${pi}
      )`);
      params.push(`%${search}%`);
      pi++;
    }

    const WHERE  = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const offset = (Number(page) - 1) * Number(limit);

    const [rows, count] = await Promise.all([
      pool.query(
        `${achSelect(!staff)} ${ACH_JOINS} ${WHERE} ${ACH_GROUP_BY}
         ORDER BY a.achievementdate DESC
         LIMIT $${pi++} OFFSET $${pi++}`,
        [...params, Number(limit), offset]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT a.id) AS total
         FROM achievements a
         JOIN users u ON a.student_id = u.id
         ${WHERE}`,
        params
      ),
    ]);

    res.json({
      records: rows.rows,
      total:   Number(count.rows[0].total),
      page:    Number(page),
      limit:   Number(limit),
    });
  } catch (err) {
    console.error("GET /achievements error:", err.message);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/achievements/stats   — analytics (staff only)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/stats", auth, role(["director", "staff"]), async (_req, res) => {
  try {
    const [overview, byDept, byLevel, bySport, byYear, byAcYear, pending] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                                 AS total,
          COUNT(*) FILTER (WHERE status='approved')               AS approved,
          COUNT(*) FILTER (WHERE status='pending')                AS pending,
          COUNT(*) FILTER (WHERE status='rejected')               AS rejected,
          COUNT(*) FILTER (WHERE position='Gold')                 AS gold,
          COUNT(*) FILTER (WHERE position='Silver')               AS silver,
          COUNT(*) FILTER (WHERE position='Bronze')               AS bronze,
          COUNT(*) FILTER (WHERE type='external')                 AS external_count,
          COUNT(*) FILTER (WHERE type='internal')                 AS internal_count,
          COUNT(*) FILTER (WHERE achievement_type='team')         AS team_count,
          COUNT(DISTINCT student_id)                              AS unique_students,
          COALESCE(SUM(cashprize),0)                              AS total_prize
        FROM achievements
      `),
      pool.query(`
        SELECT u.department,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE a.position='Gold')   AS gold,
          COUNT(*) FILTER (WHERE a.position='Silver') AS silver,
          COUNT(*) FILTER (WHERE a.position='Bronze') AS bronze,
          COUNT(DISTINCT a.student_id)                AS students
        FROM achievements a JOIN users u ON a.student_id=u.id
        WHERE a.status='approved' AND u.department IS NOT NULL
        GROUP BY u.department ORDER BY gold DESC
      `),
      pool.query(`
        SELECT level, COUNT(*) AS total FROM achievements
        WHERE status='approved' GROUP BY level ORDER BY total DESC
      `),
      pool.query(`
        SELECT sport, COUNT(*) AS total,
          COUNT(*) FILTER (WHERE position='Gold') AS gold
        FROM achievements
        WHERE status='approved' AND sport IS NOT NULL
        GROUP BY sport ORDER BY gold DESC, total DESC
      `),
      pool.query(`
        SELECT EXTRACT(YEAR FROM achievementdate)::int AS year,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE position='Gold') AS gold
        FROM achievements WHERE status='approved' AND achievementdate IS NOT NULL
        GROUP BY 1 ORDER BY 1
      `),
      pool.query(`
        SELECT academic_year, COUNT(*) AS total,
          COUNT(*) FILTER (WHERE position='Gold') AS gold
        FROM achievements WHERE status='approved' AND academic_year IS NOT NULL
        GROUP BY academic_year ORDER BY academic_year
      `),
      pool.query(`
        SELECT a.id, a.eventname, a.position, a.sport, a.level, a.achievementdate,
               COALESCE(u.name,u.username) AS student_name, u.department, a.created_at
        FROM achievements a JOIN users u ON a.student_id=u.id
        WHERE a.status='pending' ORDER BY a.created_at DESC LIMIT 20
      `),
    ]);

    res.json({
      overview:  overview.rows[0],
      byDept:    byDept.rows,
      byLevel:   byLevel.rows,
      bySport:   bySport.rows,
      byYear:    byYear.rows,
      byAcYear:  byAcYear.rows,
      pending:   pending.rows,
    });
  } catch (err) {
    console.error("GET /achievements/stats error:", err.message);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/achievements/my   — student's own achievements
// ─────────────────────────────────────────────────────────────────────────────
router.get("/my", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `${achSelect(false)} ${ACH_JOINS}
       WHERE a.student_id = $1
       ${ACH_GROUP_BY}
       ORDER BY a.achievementdate DESC`,
      [req.user.id]
    );
    const rows = result.rows;

    // Team achievements where this student is a participant (but not the main student_id)
    const teamRows = await pool.query(
      `${achSelect(false)}
       FROM achievements a
       JOIN  users u  ON a.student_id = u.id
       LEFT  JOIN users cb ON a.createdby = cb.id
       LEFT  JOIN achievement_media m ON m.achievement_id = a.id
       JOIN  achievement_participants ap ON ap.achievement_id = a.id AND ap.student_id = $1
       WHERE a.student_id != $1 AND a.status = 'approved'
       ${ACH_GROUP_BY}
       ORDER BY a.achievementdate DESC`,
      [req.user.id]
    ).catch(() => ({ rows: [] }));

    res.json({
      stats: {
        total:       rows.length,
        gold:        rows.filter(r => r.position === "Gold").length,
        silver:      rows.filter(r => r.position === "Silver").length,
        bronze:      rows.filter(r => r.position === "Bronze").length,
        pending:     rows.filter(r => r.status   === "pending").length,
        cash_earned: rows.reduce((s, r) => s + Number(r.cashprize || 0), 0),
      },
      achievements:        rows,
      team_participations: teamRows.rows,
    });
  } catch (err) {
    console.error("GET /achievements/my error:", err.message);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/achievements/students   — student search for modal dropdown
//
// FIX: removed u.fname / u.lname — those columns do not exist in the schema.
//      Uses COALESCE(u.name, u.username) everywhere.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/students", auth, role(["director", "staff"]), async (req, res) => {
  try {
    const q     = (req.query.search || "").trim();
    const param = q === "" ? "%" : `%${q}%`;

    const result = await pool.query(`
      SELECT
        u.id,
        COALESCE(NULLIF(TRIM(u.name),''), u.username, 'Unknown') AS name,
        u.username,
        COALESCE(u.rollno,     '')  AS rollno,
        COALESCE(u.reg_number, '')  AS reg_number,
        COALESCE(u.department, '')  AS department,
        COALESCE(u.batch, u.batch_year, '') AS batch,
        COALESCE(u.gender,      '') AS gender,
        COALESCE(u.blood_group, '') AS blood_group,
        u.photo_url,
        COALESCE(u.status, 'active') AS status,
        u.email, u.phone
      FROM users u
      WHERE u.role = 'student'
        AND COALESCE(u.status, 'active') NOT IN ('suspended')
        AND (
          COALESCE(u.name,       '') ILIKE $1 OR
          COALESCE(u.username,   '') ILIKE $1 OR
          COALESCE(u.rollno,     '') ILIKE $1 OR
          COALESCE(u.reg_number, '') ILIKE $1 OR
          COALESCE(u.department, '') ILIKE $1 OR
          COALESCE(u.batch,      '') ILIKE $1 OR
          COALESCE(u.batch_year, '') ILIKE $1
        )
      ORDER BY COALESCE(u.name, u.username)
      LIMIT 80
    `, [param]);

    res.json(result.rows);
  } catch (err) {
    console.error("GET /achievements/students error:", err.message);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/achievements/:id   — single record with participants
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const staff      = isStaff(req);
    const statusCond = staff ? "" : "AND a.status = 'approved'";

    const result = await pool.query(
      `${achSelect(!staff)} ${ACH_JOINS}
       WHERE a.id = $1 ${statusCond}
       ${ACH_GROUP_BY}`,
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Achievement not found" });

    const row = result.rows[0];

    // Fetch team participants
    const parts = await pool.query(`
      SELECT
        u.id,
        COALESCE(u.name, u.username)              AS name,
        u.department,
        COALESCE(u.batch, u.batch_year, '')        AS batch,
        u.rollno, u.photo_url,
        ap.role                                    AS participant_role
      FROM achievement_participants ap
      JOIN users u ON ap.student_id = u.id
      WHERE ap.achievement_id = $1
      ORDER BY ap.role, u.name
    `, [req.params.id]);

    row.participants = parts.rows;
    res.json(row);
  } catch (err) {
    console.error("GET /achievements/:id error:", err.message);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/achievements   — create
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  auth,
  role(["director", "staff"]),
  upload.array("media", 10),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        student_id, type, level, sport, event_category, eventname, position,
        achievementdate, venue, organizer, description, cashprize,
        certificate, merit_card, status, achievement_type, team_name,
        participant_ids, participant_roles,
      } = req.body;

      // Validation
      if (!student_id)         return res.status(400).json({ message: "student_id is required" });
      if (!eventname?.trim())  return res.status(400).json({ message: "Event name is required" });
      if (!achievementdate)    return res.status(400).json({ message: "Date is required" });
      if (!position)           return res.status(400).json({ message: "Position is required" });
      if (!VALID_TYPES.includes(type))
        return res.status(400).json({ message: `type must be one of: ${VALID_TYPES.join(", ")}` });
      if (!VALID_LEVELS.includes(level))
        return res.status(400).json({ message: `level must be one of: ${VALID_LEVELS.join(", ")}` });

      const cleanStatus = VALID_STATUSES.includes(status) ? status : "approved";
      const achType     = achievement_type === "team" ? "team" : "individual";

      const stuCheck = await client.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'student'",
        [student_id]
      );
      if (!stuCheck.rows.length)
        return res.status(400).json({ message: `Student id=${student_id} not found` });

      await client.query("BEGIN");

      const ach = await client.query(`
        INSERT INTO achievements
          (student_id, type, level, sport, event_category, eventname, position,
           achievementdate, venue, organizer, description, cashprize,
           certificate, merit_card, status, achievement_type, team_name, createdby)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING id
      `, [
        student_id, type, level,
        sport?.trim()          || null,
        event_category?.trim() || null,
        eventname.trim(),
        position,
        achievementdate,
        venue?.trim()          || null,
        organizer?.trim()      || null,
        description?.trim()    || null,
        Number(cashprize)      || 0,
        certificate  === "true" || certificate  === true,
        merit_card   === "true" || merit_card   === true,
        cleanStatus, achType,
        team_name?.trim()      || null,
        req.user.id,
      ]);
      const achId = ach.rows[0].id;

      // Primary student always in participants
      await client.query(
        `INSERT INTO achievement_participants (achievement_id, student_id, role)
         VALUES ($1,$2,'winner') ON CONFLICT DO NOTHING`,
        [achId, student_id]
      );

      // Extra participants
      if (participant_ids) {
        const ids   = String(participant_ids).split(",").map(Number).filter(Boolean);
        const roles = participant_roles ? String(participant_roles).split(",") : [];
        for (let i = 0; i < ids.length; i++) {
          await client
            .query(
              `INSERT INTO achievement_participants (achievement_id, student_id, role)
               VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
              [achId, ids[i], roles[i]?.trim() || "member"]
            )
            .catch(() => {});
        }
      }

      // Media files
      for (const file of req.files || []) {
        const mt = file.mimetype.startsWith("video")       ? "video"
                 : file.mimetype === "application/pdf"     ? "document"
                 : "image";
        await client.query(
          `INSERT INTO achievement_media
             (achievement_id, media_type, file_name, file_path, mime_type, file_size, uploaded_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [achId, mt, file.originalname,
           `/uploads/achievements/${file.filename}`,
           file.mimetype, file.size, req.user.id]
        );
      }

      await client.query("COMMIT");
      console.log(`[POST /achievements] Created id=${achId} by user=${req.user.id}`);
      res.status(201).json({ message: "Achievement created", id: achId });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      (req.files || []).forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      console.error("POST /achievements error:", err.message);
      res.status(500).json({ message: "Failed to create achievement", detail: err.message });
    } finally {
      client.release();
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/achievements/:id   — update
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  "/:id",
  auth,
  role(["director", "staff"]),
  upload.array("media", 10),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        student_id, type, level, sport, event_category, eventname, position,
        achievementdate, venue, organizer, description, cashprize,
        certificate, merit_card, status, achievement_type, team_name,
        participant_ids, participant_roles, remove_media_ids,
      } = req.body;

      if (type  && !VALID_TYPES.includes(type))
        return res.status(400).json({ message: `type must be: ${VALID_TYPES.join(", ")}` });
      if (level && !VALID_LEVELS.includes(level))
        return res.status(400).json({ message: `level must be: ${VALID_LEVELS.join(", ")}` });

      const existing = await client.query("SELECT id FROM achievements WHERE id = $1", [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ message: "Achievement not found" });

      const cleanStatus = VALID_STATUSES.includes(status) ? status : "approved";
      const achType     = achievement_type === "team" ? "team" : "individual";

      await client.query("BEGIN");

      await client.query(`
        UPDATE achievements SET
          student_id=$1, type=$2, level=$3, sport=$4, event_category=$5,
          eventname=$6, position=$7, achievementdate=$8, venue=$9, organizer=$10,
          description=$11, cashprize=$12, certificate=$13, merit_card=$14,
          status=$15, achievement_type=$16, team_name=$17
        WHERE id = $18
      `, [
        student_id, type, level,
        sport?.trim()          || null,
        event_category?.trim() || null,
        eventname?.trim(), position, achievementdate,
        venue?.trim()          || null,
        organizer?.trim()      || null,
        description?.trim()    || null,
        Number(cashprize)      || 0,
        certificate  === "true" || certificate  === true,
        merit_card   === "true" || merit_card   === true,
        cleanStatus, achType,
        team_name?.trim()      || null,
        req.params.id,
      ]);

      // Sync participants
      if (participant_ids !== undefined) {
        await client.query(
          "DELETE FROM achievement_participants WHERE achievement_id = $1", [req.params.id]
        );
        await client.query(
          `INSERT INTO achievement_participants (achievement_id, student_id, role)
           VALUES ($1,$2,'winner') ON CONFLICT DO NOTHING`,
          [req.params.id, student_id]
        );
        const ids   = String(participant_ids).split(",").map(Number).filter(Boolean);
        const roles = participant_roles ? String(participant_roles).split(",") : [];
        for (let i = 0; i < ids.length; i++) {
          await client.query(
            `INSERT INTO achievement_participants (achievement_id, student_id, role)
             VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
            [req.params.id, ids[i], roles[i]?.trim() || "member"]
          ).catch(() => {});
        }
      }

      // Remove media
      if (remove_media_ids) {
        const ids = String(remove_media_ids).split(",").map(Number).filter(Boolean);
        if (ids.length) {
          const mrows = await client.query(
            "SELECT file_path FROM achievement_media WHERE id = ANY($1) AND achievement_id = $2",
            [ids, req.params.id]
          );
          mrows.rows.forEach(r => {
            try {
              const p = path.join(__dirname, "..", r.file_path.replace(/^\//, ""));
              if (fs.existsSync(p)) fs.unlinkSync(p);
            } catch {}
          });
          await client.query("DELETE FROM achievement_media WHERE id = ANY($1)", [ids]);
        }
      }

      // Add new media
      for (const file of req.files || []) {
        const mt = file.mimetype.startsWith("video")   ? "video"
                 : file.mimetype === "application/pdf" ? "document"
                 : "image";
        await client.query(
          `INSERT INTO achievement_media
             (achievement_id, media_type, file_name, file_path, mime_type, file_size, uploaded_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [req.params.id, mt, file.originalname,
           `/uploads/achievements/${file.filename}`,
           file.mimetype, file.size, req.user.id]
        );
      }

      await client.query("COMMIT");
      res.json({ message: "Achievement updated successfully" });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      (req.files || []).forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      console.error("PUT /achievements/:id error:", err.message);
      res.status(500).json({ message: "Failed to update", detail: err.message });
    } finally {
      client.release();
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/achievements/:id/status   — approve / reject (director only)
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", auth, role(["director"]), async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const r = await pool.query(
      "UPDATE achievements SET status=$1, rejection_reason=$2 WHERE id=$3 RETURNING id",
      [status, rejection_reason || null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ message: "Not found" });
    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/achievements/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", auth, role(["director", "staff"]), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const check = await client.query("SELECT id FROM achievements WHERE id=$1", [req.params.id]);
    if (!check.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Not found" });
    }
    const media = await client.query(
      "SELECT file_path FROM achievement_media WHERE achievement_id=$1", [req.params.id]
    );
    media.rows.forEach(r => {
      try {
        const p = path.join(__dirname, "..", r.file_path.replace(/^\//, ""));
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch {}
    });
    await client.query("DELETE FROM achievements WHERE id=$1", [req.params.id]);
    await client.query("COMMIT");
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ message: "Server error", detail: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;