const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const directorRoutes = require("./routes/director.routes");
const staffRoutes = require("./routes/staff.routes");
const studentRoutes = require("./routes/student.routes");
const achievementRoutes = require("./routes/achievement.routes");
const attendanceRoutes = require("./routes/attendance");
const trainingProgramsRouter = require('./routes/trainingPrograms');
const kitRoutes             = require("./routes/kit.routes");
const kitStudentRoutes      = require("./routes/kit.student.routes");
const path = require("path");
const app = express();


app.use(cors({
  origin: "https://drsacoesdm.netlify.app",
  credentials: true
}));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/director", directorRoutes);
app.use("/staff/kits",kitRoutes);
app.use("/student/kits",kitStudentRoutes);
app.use("/staff", staffRoutes);
app.use("/student", studentRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/api/achievements", require("./routes/achievement.routes"));
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.use('/training-programs', trainingProgramsRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/staff", require("./routes/Student-records.routes"));
module.exports = app;

