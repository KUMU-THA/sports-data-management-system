// routes/student-records.routes.js
// Mount in app.js: app.use("/staff", require("./routes/student-records.routes"));
// (or add these routes to your existing staff.routes.js)

const express = require("express");
const pool    = require("../db/db");
const auth    = require("../middleware/auth.middleware");
const router  = express.Router();

// ── same staffOnly guard as staff.routes.js ────────────────────
const staffOnly = (req, res, next) => {
  const r = (req.user.role || "").toLowerCase();
  if (r === "admin" || r === "staff" || r === "director") return next();
  return res.status(403).json({ message: "Staff access required" });
};

// ================================================================
//  HELPER — date-range SQL from ?filter=day|month|year|custom
//  Also accepts ?from=YYYY-MM-DD&to=YYYY-MM-DD for custom range
// ================================================================
function buildDateRange(filter, from, to) {
  const now = new Date();
  switch (filter) {
    case "day":
      return { start: now.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
    case "week": {
      const day = now.getDay(); // 0=Sun
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(now.setDate(diff));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return { start: mon.toISOString().slice(0, 10), end: sun.toISOString().slice(0, 10) };
    }
    case "month":
      return {
        start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
        end:   new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
      };
    case "year":
      return { start: `${now.getFullYear()}-01-01`, end: `${now.getFullYear()}-12-31` };
    case "custom":
      return { start: from || "2000-01-01", end: to || now.toISOString().slice(0, 10) };
    default:
      return { start: "2000-01-01", end: now.toISOString().slice(0, 10) };
  }
}

// ================================================================
//  GET /staff/students/:id/records
//  Unified activity timeline for one student
//  Query params:
//    filter  = day | week | month | year | custom | all  (default: all)
//    from    = YYYY-MM-DD   (only for custom)
//    to      = YYYY-MM-DD   (only for custom)
// ================================================================
router.get("/students/:id/records", auth, staffOnly, async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { filter = "all", from, to } = req.query;

  const range = filter === "all"
    ? { start: "2000-01-01", end: "2099-12-31" }
    : buildDateRange(filter, from, to);

  try {
    // ── 1. Student profile ──────────────────────────────────────
    const profileQ = await pool.query(
      `SELECT id, username, name, rollno, reg_number, department, batch,
              batch_year, email, phone, gender, dob, blood_group, address,
              status, created_at
       FROM users WHERE id = $1 AND role = 'student'`,
      [studentId]
    );
    if (!profileQ.rows.length)
      return res.status(404).json({ message: "Student not found" });
    const student = profileQ.rows[0];

    // ── 2. Attendance records ───────────────────────────────────
    const attQ = await pool.query(
      `SELECT a.present, a.remarks,
              ts.session_date AS date, ts.start_time, ts.end_time, ts.location,
              tp.title AS program_title,
              e.title  AS event_title
       FROM attendance a
       JOIN training_sessions ts  ON a.session_id  = ts.id
       JOIN training_programs tp  ON ts.program_id = tp.id
       JOIN events            e   ON tp.event_id   = e.id
       WHERE a.student_id = $1
         AND ts.session_date BETWEEN $2 AND $3
       ORDER BY ts.session_date DESC`,
      [studentId, range.start, range.end]
    );

    // ── 3. Performance records ──────────────────────────────────
    const perfQ = await pool.query(
      `SELECT p.metric_value, p.metric_unit, p.performance_text, p.rating,
              p.created_at,
              ts.session_date AS date,
              tp.title AS program_title,
              e.title  AS event_title
       FROM performance p
       JOIN training_sessions ts  ON p.session_id  = ts.id
       JOIN training_programs tp  ON ts.program_id = tp.id
       JOIN events            e   ON tp.event_id   = e.id
       WHERE p.student_id = $1
         AND ts.session_date BETWEEN $2 AND $3
       ORDER BY ts.session_date DESC`,
      [studentId, range.start, range.end]
    );

    // ── 4. Event registrations ──────────────────────────────────
    const evtQ = await pool.query(
      `SELECT e.title, e.event_type, e.event_date AS date,
              er.registered_at
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.student_id = $1
         AND e.event_date BETWEEN $2 AND $3
       ORDER BY e.event_date DESC`,
      [studentId, range.start, range.end]
    );

    // ── 5. Achievements ─────────────────────────────────────────
    const achQ = await pool.query(
      `SELECT a.id, a.eventname, a.sport, a.level, a.type,
              a.position, a.achievementdate AS date,
              a.venue, a.description, a.cashprize, a.certificate,
              a.achievement_type, a.team_name, a.status,
              a.academic_year
       FROM achievements a
       WHERE a.student_id = $1
         AND a.achievementdate BETWEEN $2 AND $3
       ORDER BY a.achievementdate DESC`,
      [studentId, range.start, range.end]
    );

    // ── 6. Attendance summary stats ─────────────────────────────
    const attStats = attQ.rows.reduce(
      (acc, r) => {
        acc.total++;
        r.present ? acc.present++ : acc.absent++;
        return acc;
      },
      { total: 0, present: 0, absent: 0 }
    );
    attStats.percentage =
      attStats.total > 0
        ? ((attStats.present / attStats.total) * 100).toFixed(1)
        : "0.0";

    // ── 7. Performance summary stats ────────────────────────────
    const ratings = perfQ.rows.filter(p => p.rating).map(p => parseFloat(p.rating));
    const avgRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
      : null;

    // ── 8. Build unified timeline ───────────────────────────────
    const timeline = [
      ...attQ.rows.map(r => ({ type: "attendance", date: r.date, data: r })),
      ...perfQ.rows.map(r => ({ type: "performance", date: r.date, data: r })),
      ...evtQ.rows.map(r => ({ type: "event", date: r.date, data: r })),
      ...achQ.rows.map(r => ({ type: "achievement", date: r.date, data: r })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      student,
      filter,
      range,
      summary: {
        attendance: attStats,
        avg_rating: avgRating,
        total_events:       evtQ.rows.length,
        total_achievements: achQ.rows.length,
        total_sessions:     attStats.total,
      },
      attendance:   attQ.rows,
      performance:  perfQ.rows,
      events:       evtQ.rows,
      achievements: achQ.rows,
      timeline,
    });
  } catch (err) {
    console.error("Student records:", err.message);
    res.status(500).json({ message: "Error fetching student records" });
  }
});

// ================================================================
//  GET /staff/students/:id/records/summary
//  Quick stats card — for dashboard widgets
// ================================================================
router.get("/students/:id/records/summary", auth, staffOnly, async (req, res) => {
  const studentId = parseInt(req.params.id);
  try {
    const [att, perf, ach, evts] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE present=TRUE) AS present
         FROM attendance WHERE student_id = $1`, [studentId]
      ),
      pool.query(
        `SELECT ROUND(AVG(rating),2) AS avg_rating,
                COUNT(*) AS sessions
         FROM performance WHERE student_id = $1 AND rating IS NOT NULL`, [studentId]
      ),
      pool.query(`SELECT COUNT(*) FROM achievements WHERE student_id=$1 AND status='approved'`, [studentId]),
      pool.query(`SELECT COUNT(*) FROM event_registrations WHERE student_id=$1`, [studentId]),
    ]);
    const total   = parseInt(att.rows[0].total);
    const present = parseInt(att.rows[0].present);
    res.json({
      attendance_percentage: total ? ((present / total) * 100).toFixed(1) : "0.0",
      total_sessions:        total,
      avg_rating:            perf.rows[0].avg_rating,
      total_achievements:    parseInt(ach.rows[0].count),
      total_events:          parseInt(evts.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;