// routes/kit.routes.js
// Mount in app.js:  app.use("/staff/kits", require("./routes/kit.routes"));
//                   app.use("/student/kits", require("./routes/kit.student.routes"));

const express  = require("express");
const pool     = require("../db/db");
const auth     = require("../middleware/auth.middleware");
const logAudit = require("../utils/auditLogger");
const router   = express.Router();

const uid = req => req.user.id;

// ── Staff-only guard (same pattern as staff.routes.js) ──────────
const staffOnly = (req, res, next) => {
  const realRole = (req.user.role || "").toLowerCase();
  if (["admin", "staff", "director"].includes(realRole)) return next();
  return res.status(403).json({ message: "Staff access required" });
};

// ── Auto-mark overdue helper (call before listing) ───────────────
const markOverdue = async () => {
  await pool.query(
    `UPDATE kit_assignments SET status='overdue'
     WHERE status='issued' AND return_deadline < CURRENT_DATE`
  );
};

// ================================================================
//  KIT ITEMS CRUD
// ================================================================

// GET /staff/kits/items
router.get("/items", auth, staffOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ki.*,
              COUNT(ka.id) FILTER (WHERE ka.status IN ('issued','overdue')) AS issued_count,
              COUNT(ka.id) FILTER (WHERE ka.status = 'overdue')             AS overdue_count
       FROM kit_items ki
       LEFT JOIN kit_assignments ka ON ka.kit_item_id = ki.id
       WHERE ki.is_active = TRUE
       GROUP BY ki.id
       ORDER BY ki.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get kit items:", err.message);
    res.status(500).json({ message: "Error fetching kit items" });
  }
});

// POST /staff/kits/items
router.post("/items", auth, staffOnly, async (req, res) => {
  const { name, description, category, total_stock, sizes } = req.body;
  if (!name || !total_stock)
    return res.status(400).json({ message: "name and total_stock are required" });
  try {
    const result = await pool.query(
      `INSERT INTO kit_items (name, description, category, total_stock, available_stock, sizes, created_by)
       VALUES ($1,$2,$3,$4,$4,$5,$6) RETURNING *`,
      [name, description || null, category || null, parseInt(total_stock),
       sizes || ["S","M","L","XL","XXL"], uid(req)]
    );
    await logAudit({
      actorId: uid(req), actorRole: req.user.role,
      action: "CREATE", targetRole: "kit",
      description: `Created kit item: ${name} (stock: ${total_stock})`
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create kit item:", err.message);
    res.status(500).json({ message: "Error creating kit item" });
  }
});

// PUT /staff/kits/items/:id
router.put("/items/:id", auth, staffOnly, async (req, res) => {
  const { name, description, category, total_stock, available_stock, sizes, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE kit_items
       SET name=$1, description=$2, category=$3, total_stock=$4,
           available_stock=$5, sizes=$6, is_active=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [name, description || null, category || null,
       parseInt(total_stock), parseInt(available_stock),
       sizes || ["S","M","L","XL","XXL"],
       is_active !== undefined ? is_active : true,
       req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Kit item not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update kit item:", err.message);
    res.status(500).json({ message: "Error updating kit item" });
  }
});

// DELETE /staff/kits/items/:id  (soft delete)
router.delete("/items/:id", auth, staffOnly, async (req, res) => {
  try {
    await pool.query(
      "UPDATE kit_items SET is_active=FALSE, updated_at=NOW() WHERE id=$1",
      [req.params.id]
    );
    res.json({ message: "Kit item deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting kit item" });
  }
});

// ================================================================
//  KIT ASSIGNMENTS — Issue kits to students
// ================================================================

// GET /staff/kits/assignments  (all assignments, with filters)
router.get("/assignments", auth, staffOnly, async (req, res) => {
  await markOverdue();
  try {
    const { status, student_id, kit_item_id, overdue_only } = req.query;
    const params = [];
    const where  = [];

    if (status)      { params.push(status);      where.push(`ka.status = $${params.length}`); }
    if (student_id)  { params.push(student_id);  where.push(`ka.student_id = $${params.length}`); }
    if (kit_item_id) { params.push(kit_item_id); where.push(`ka.kit_item_id = $${params.length}`); }
    if (overdue_only === "true") { where.push(`ka.return_deadline < CURRENT_DATE AND ka.status NOT IN ('returned','lost')`); }

    const result = await pool.query(
      `SELECT ka.*,
              ki.name         AS kit_name,
              ki.category     AS kit_category,
              u.name          AS student_name,
              u.username      AS student_username,
              u.rollno        AS student_rollno,
              u.department    AS student_dept,
              u.batch         AS student_batch,
              u.phone         AS student_phone,
              e.title         AS event_title,
              ib.name         AS issued_by_name,
              (SELECT COUNT(*) FROM kit_return_requests rr
               WHERE rr.assignment_id = ka.id AND rr.status = 'pending') AS pending_returns
       FROM kit_assignments ka
       JOIN kit_items ki ON ka.kit_item_id = ki.id
       JOIN users     u  ON ka.student_id  = u.id
       LEFT JOIN events e   ON ka.event_id    = e.id
       LEFT JOIN users  ib  ON ka.issued_by   = ib.id
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY ka.created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get assignments:", err.message);
    res.status(500).json({ message: "Error fetching assignments" });
  }
});

// POST /staff/kits/assignments  — issue kit to student
router.post("/assignments", auth, staffOnly, async (req, res) => {
  const { kit_item_id, student_id, event_id, size, quantity,
          return_deadline, condition_issued, notes } = req.body;

  if (!kit_item_id || !student_id || !return_deadline)
    return res.status(400).json({ message: "kit_item_id, student_id, return_deadline required" });

  const qty = parseInt(quantity) || 1;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check stock
    const kitRow = await client.query(
      "SELECT * FROM kit_items WHERE id=$1 AND is_active=TRUE FOR UPDATE",
      [kit_item_id]
    );
    if (!kitRow.rows.length)
      return res.status(404).json({ message: "Kit item not found" });

    const kit = kitRow.rows[0];
    if (kit.available_stock < qty)
      return res.status(400).json({
        message: `Insufficient stock. Available: ${kit.available_stock}, Requested: ${qty}`
      });

    // Check duplicate active assignment
    const dup = await client.query(
      `SELECT id FROM kit_assignments
       WHERE kit_item_id=$1 AND student_id=$2 AND status IN ('issued','overdue')`,
      [kit_item_id, student_id]
    );
    if (dup.rows.length)
      return res.status(409).json({ message: "Student already has this kit item (not yet returned)" });

    // Deduct stock
    await client.query(
      "UPDATE kit_items SET available_stock = available_stock - $1, updated_at=NOW() WHERE id=$2",
      [qty, kit_item_id]
    );

    // Create assignment
    const result = await client.query(
      `INSERT INTO kit_assignments
         (kit_item_id, student_id, event_id, size, quantity,
          return_deadline, condition_issued, notes, issued_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [kit_item_id, student_id, event_id || null, size || null, qty,
       return_deadline, condition_issued || "good", notes || null, uid(req)]
    );

    await client.query("COMMIT");

    await logAudit({
      actorId: uid(req), actorRole: req.user.role,
      action: "CREATE", targetRole: "kit",
      description: `Issued "${kit.name}" (x${qty}) to student_id=${student_id}, deadline=${return_deadline}`
    });

    res.status(201).json({
      message: "Kit issued successfully",
      assignment: result.rows[0]
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Issue kit:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// PUT /staff/kits/assignments/:id  — update assignment (e.g. extend deadline, add notes)
router.put("/assignments/:id", auth, staffOnly, async (req, res) => {
  const { return_deadline, notes, size, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE kit_assignments
       SET return_deadline=$1, notes=$2, size=$3, status=COALESCE($4,status), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [return_deadline, notes || null, size || null, status || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Assignment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================================================================
//  RETURN MANAGEMENT
// ================================================================

// GET /staff/kits/returns  — pending return requests
router.get("/returns", auth, staffOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rr.*,
              ka.issued_date, ka.return_deadline, ka.size, ka.quantity,
              ki.name         AS kit_name,
              u.name          AS student_name,
              u.username      AS student_username,
              u.rollno        AS student_rollno,
              u.department    AS student_dept,
              u.phone         AS student_phone
       FROM kit_return_requests rr
       JOIN kit_assignments ka ON rr.assignment_id = ka.id
       JOIN kit_items       ki ON ka.kit_item_id   = ki.id
       JOIN users            u ON rr.student_id    = u.id
       WHERE rr.status = 'pending'
       ORDER BY rr.requested_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /staff/kits/returns/:requestId/confirm  — confirm return
router.post("/returns/:requestId/confirm", auth, staffOnly, async (req, res) => {
  const { condition_returned, staff_notes } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get request
    const reqRow = await client.query(
      "SELECT * FROM kit_return_requests WHERE id=$1 AND status='pending'",
      [req.params.requestId]
    );
    if (!reqRow.rows.length)
      return res.status(404).json({ message: "Return request not found or already processed" });

    const rr = reqRow.rows[0];

    // Update assignment → returned
    const assignRow = await client.query(
      `UPDATE kit_assignments
       SET status='returned', returned_date=CURRENT_DATE,
           condition_returned=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [condition_returned || rr.condition_report || "good", rr.assignment_id]
    );

    const assignment = assignRow.rows[0];

    // Restore stock
    await client.query(
      "UPDATE kit_items SET available_stock = available_stock + $1, updated_at=NOW() WHERE id=$2",
      [assignment.quantity, assignment.kit_item_id]
    );

    // Update request
    await client.query(
      `UPDATE kit_return_requests
       SET status='confirmed', reviewed_by=$1, reviewed_at=NOW(), staff_notes=$2
       WHERE id=$3`,
      [uid(req), staff_notes || null, req.params.requestId]
    );

    await client.query("COMMIT");

    await logAudit({
      actorId: uid(req), actorRole: req.user.role,
      action: "UPDATE", targetRole: "kit",
      description: `Confirmed return for assignment_id=${rr.assignment_id}`
    });

    res.json({ message: "Return confirmed successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// POST /staff/kits/returns/:requestId/reject
router.post("/returns/:requestId/reject", auth, staffOnly, async (req, res) => {
  const { staff_notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE kit_return_requests
       SET status='rejected', reviewed_by=$1, reviewed_at=NOW(), staff_notes=$2
       WHERE id=$3 AND status='pending' RETURNING *`,
      [uid(req), staff_notes || null, req.params.requestId]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Request not found or already processed" });
    res.json({ message: "Return request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================================================================
//  DASHBOARD STATS
// ================================================================
router.get("/stats", auth, staffOnly, async (req, res) => {
  await markOverdue();
  try {
    const [items, assignments, returns, overdue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM kit_items WHERE is_active=TRUE"),
      pool.query("SELECT COUNT(*) FROM kit_assignments WHERE status IN ('issued','overdue')"),
      pool.query("SELECT COUNT(*) FROM kit_return_requests WHERE status='pending'"),
      pool.query("SELECT COUNT(*) FROM kit_assignments WHERE status='overdue'"),
    ]);
    res.json({
      total_kit_types:    parseInt(items.rows[0].count),
      currently_issued:   parseInt(assignments.rows[0].count),
      pending_returns:    parseInt(returns.rows[0].count),
      overdue_count:      parseInt(overdue.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;