// routes/kit.student.routes.js
// Mount in app.js:  app.use("/student/kits", require("./routes/kit.student.routes"));

const express = require("express");
const pool    = require("../db/db");
const auth    = require("../middleware/auth.middleware");
const router  = express.Router();

const uid = req => req.user.id;

// Student-only guard
const studentOnly = (req, res, next) => {
  const role       = (req.user.role       || "").toLowerCase();
  const activeRole = (req.user.activeRole || "").toLowerCase();
  if (role === "student" || activeRole === "student") return next();
  return res.status(403).json({ message: "Student access required" });
};

// ── Auto-mark overdue ─────────────────────────────────────────────
const markOverdue = async () => {
  await pool.query(
    `UPDATE kit_assignments SET status='overdue'
     WHERE status='issued' AND return_deadline < CURRENT_DATE`
  );
};

// GET /student/kits/my  — student's own kit assignments
router.get("/my", auth, studentOnly, async (req, res) => {
  await markOverdue();
  try {
    const result = await pool.query(
      `SELECT ka.*,
              ki.name        AS kit_name,
              ki.category    AS kit_category,
              e.title        AS event_title,
              ib.name        AS issued_by_name,
              (SELECT rr.status FROM kit_return_requests rr
               WHERE rr.assignment_id = ka.id
               ORDER BY rr.requested_at DESC LIMIT 1) AS return_request_status
       FROM kit_assignments ka
       JOIN kit_items ki ON ka.kit_item_id = ki.id
       LEFT JOIN events e  ON ka.event_id    = e.id
       LEFT JOIN users  ib ON ka.issued_by   = ib.id
       WHERE ka.student_id = $1
       ORDER BY ka.created_at DESC`,
      [uid(req)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Student my kits:", err.message);
    res.status(500).json({ message: "Error fetching your kits" });
  }
});

// POST /student/kits/return/:assignmentId  — request return
router.post("/return/:assignmentId", auth, studentOnly, async (req, res) => {
  const { condition_report, student_notes } = req.body;

  try {
    // Verify this assignment belongs to this student
    const assignRow = await pool.query(
      `SELECT * FROM kit_assignments
       WHERE id=$1 AND student_id=$2 AND status IN ('issued','overdue')`,
      [req.params.assignmentId, uid(req)]
    );
    if (!assignRow.rows.length)
      return res.status(404).json({
        message: "Assignment not found or already returned"
      });

    // Check no pending return request already
    const existing = await pool.query(
      `SELECT id FROM kit_return_requests
       WHERE assignment_id=$1 AND status='pending'`,
      [req.params.assignmentId]
    );
    if (existing.rows.length)
      return res.status(409).json({ message: "Return request already pending staff review" });

    const result = await pool.query(
      `INSERT INTO kit_return_requests
         (assignment_id, student_id, condition_report, student_notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.assignmentId, uid(req),
       condition_report || "good", student_notes || null]
    );

    res.status(201).json({
      message: "Return request submitted. Staff will confirm pickup.",
      request: result.rows[0]
    });
  } catch (err) {
    console.error("Student return request:", err.message);
    res.status(500).json({ message: "Error submitting return request" });
  }
});

// GET /student/kits/stats  — quick summary for student
router.get("/stats", auth, studentOnly, async (req, res) => {
  await markOverdue();
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('issued','overdue')) AS active_kits,
         COUNT(*) FILTER (WHERE status = 'overdue')            AS overdue_kits,
         COUNT(*) FILTER (WHERE status = 'returned')           AS returned_kits,
         COUNT(*) AS total_kits
       FROM kit_assignments WHERE student_id=$1`,
      [uid(req)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;