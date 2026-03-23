import { useEffect, useState } from "react";

import AdminDashboard from "./AdminDashboard";
import DirectorDashboard from "./DirectorDashboard";
import StaffDashboard from "./StaffDashboard";
import StudentDashboard from "./StudentDashboard";

function Dashboard() {

  const [role, setRole] = useState(null);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    try {

      const payload = JSON.parse(atob(token.split(".")[1]));

      setRole(payload.activeRole);

    }
    catch {

      localStorage.removeItem("token");

      window.location.href = "/";

    }

  }, []);


  if (!role) return <h2>Loading...</h2>;


  if (role === "admin")
    return <AdminDashboard />;

  if (role === "director")
    return <DirectorDashboard />;

  if (role === "staff")
    return <StaffDashboard />;

  if (role === "student")
    return <StudentDashboard />;

  return <h2>Invalid role</h2>;

}

export default Dashboard;
