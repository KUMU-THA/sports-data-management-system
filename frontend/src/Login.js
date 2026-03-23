import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";


const injectCSS = () => {
  if (document.getElementById("login-anim-styles")) return;
  const el = document.createElement("style");
  el.id = "login-anim-styles";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Keyframes ── */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(36px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes blobFloat {
      0%, 100% { transform: scale(1) translateY(0);   opacity: 0.08; }
      50%       { transform: scale(1.1) translateY(-8px); opacity: 0.14; }
    }
    @keyframes logoPop {
      0%   { transform: scale(0.7) rotate(-8deg); opacity: 0; }
      70%  { transform: scale(1.05) rotate(2deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes successPop {
      0%   { transform: scale(0.4); opacity: 0; }
      60%  { transform: scale(1.12); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes overlayIn  { from { opacity:0; } to { opacity:1; } }
    @keyframes overlayOut { from { opacity:1; } to { opacity:0; } }

    /* ── Page ── */
    .lp-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #dde6ff 0%, #f0f4ff 50%, #dce6ff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', 'Segoe UI', sans-serif;
      padding: 20px;
    }

    /* ── Card ── */
    .lp-card {
      display: flex;
      width: 920px;
      max-width: 100%;
      border-radius: 26px;
      overflow: hidden;
      box-shadow:
        0 32px 80px rgba(18, 44, 200, 0.20),
        0 8px 24px rgba(0,0,0,0.08);
      background: #fff;
      animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
    }

    /* ════════════════════════════════
       LEFT PANEL
    ════════════════════════════════ */
    .lp-left {
      background: linear-gradient(160deg, #102fa0 0%, #1a42d4 45%, #2255f0 75%, #1837be 100%);
      width: 44%;
      padding: 36px 32px 28px;
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      overflow: hidden;
    }

    /* Animated background blobs */
    .lp-blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.09);
      pointer-events: none;
    }
    .lp-blob-1 { width:260px; height:260px; top:-90px;  right:-80px;  animation: blobFloat 5s ease-in-out infinite 0s;   }
    .lp-blob-2 { width:200px; height:200px; bottom:-70px; left:-60px; animation: blobFloat 6s ease-in-out infinite 1.5s; }
    .lp-blob-3 { width:120px; height:120px; top:42%; right:8%;        animation: blobFloat 4s ease-in-out infinite 0.8s; }
    .lp-blob-4 { width:70px;  height:70px;  top:20%; left:15%;        animation: blobFloat 7s ease-in-out infinite 2.2s; }

    /* ── College Header Row: Logo + Name ── */
    .lp-college-header {
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      z-index: 2;
      margin-bottom: 16px;
    }

    .lp-logo-wrap {
      flex-shrink: 0;
      width: 72px;
      height: 72px;
      background: #fff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 22px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12);
      animation: logoPop 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) both;
      padding: 6px;
      overflow: hidden;
    }

    .lp-logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 10px;
    }

    .lp-college-info {
      flex: 1;
    }

    .lp-college-name {
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.2px;
    }

    .lp-dept-name {
      color: rgba(255,255,255,0.88);
      font-size: 12.5px;
      font-weight: 600;
      margin-top: 4px;
    }

    .lp-system-tag {
      display: inline-block;
      margin-top: 5px;
      color: rgba(255,255,255,0.6);
      font-size: 9px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.25);
      padding: 2px 8px;
      border-radius: 20px;
    }

    /* Thin separator */
    .lp-sep {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.18);
      margin: 0 0 16px;
      position: relative;
      z-index: 2;
    }

    /* ── Ground / Sports Image ── */
    .lp-ground-wrap {
      position: relative;
      z-index: 2;
      border-radius: 16px;
      overflow: hidden;
      flex: 1;
      min-height: 200px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }

    /* Real sports ground image */
    .lp-ground-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      filter: brightness(0.88) saturate(1.1);
    }

    /* Overlay gradient on image for text below */
    .lp-ground-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 40%,
        rgba(10, 30, 120, 0.75) 100%
      );
    }

    /* Floating label on ground image */
    .lp-ground-label {
      position: absolute;
      bottom: 14px;
      left: 16px;
      right: 16px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .lp-ground-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 6px #4ade80;
      flex-shrink: 0;
    }

    /* Fallback SVG court (shows if image fails) */
    .lp-ground-svg {
      width: 100%;
      height: 100%;
    }

    /* ── Footer ── */
    .lp-footer {
      position: relative;
      z-index: 2;
      margin-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.15);
      padding-top: 12px;
    }

    .lp-footer-text {
      color: rgba(255,255,255,0.5);
      font-size: 10.5px;
      line-height: 1.7;
    }

    /* ════════════════════════════════
       RIGHT PANEL
    ════════════════════════════════ */
    .lp-right {
      flex: 1;
      padding: 52px 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .lp-right-title {
      font-size: 30px;
      font-weight: 800;
      color: #0f172a;
      text-align: center;
      margin-bottom: 6px;
      animation: fadeSlideUp 0.5s 0.1s both;
    }

    .lp-right-sub {
      color: #94a3b8;
      font-size: 13px;
      text-align: center;
      margin-bottom: 28px;
      animation: fadeSlideUp 0.5s 0.2s both;
    }

    /* Role badges */
    .lp-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 28px;
      animation: fadeSlideUp 0.5s 0.25s both;
    }

    .lp-badge {
      padding: 4px 13px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.4px;
    }
    .badge-admin    { background: #fee2e2; color: #991b1b; }
    .badge-staff    { background: #dbeafe; color: #1e40af; }
    .badge-student  { background: #d1fae5; color: #065f46; }
    .badge-director { background: #ede9fe; color: #4c1d95; }

    /* Field labels */
    .lp-label {
      display: flex;
      align-items: center;
      gap: 7px;
      font-weight: 600;
      font-size: 13px;
      color: #374151;
      margin-bottom: 8px;
    }

    /* Input */
    .lp-input-wrap {
      margin-bottom: 20px;
      animation: fadeSlideUp 0.5s 0.3s both;
    }

    .lp-input {
      width: 100%;
      padding: 13px 16px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      background: #f8faff;
      color: #111;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }

    .lp-input:focus {
      border-color: #2152e8;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(33,82,232,0.10);
    }

    /* Remember row */
    .lp-row {
      display: flex;
      align-items: center;
      margin-bottom: 26px;
      animation: fadeSlideUp 0.5s 0.35s both;
    }

    .lp-check-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #4b5563;
      cursor: pointer;
    }

    .lp-check-label input[type="checkbox"] {
      accent-color: #2152e8;
      width: 15px;
      height: 15px;
    }

    /* Login button */
    .lp-btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(130deg, #1430a8 0%, #2152e8 60%, #1e4de0 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: 0.3px;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 8px 24px rgba(33,82,232,0.38);
      animation: fadeSlideUp 0.5s 0.4s both;
      position: relative;
      overflow: hidden;
    }

    .lp-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255,255,255,0.15) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: shimmer 2.5s infinite;
    }

    .lp-btn:hover:not(:disabled) {
      opacity: 0.92;
      transform: translateY(-2px);
      box-shadow: 0 14px 32px rgba(33,82,232,0.42);
    }

    .lp-btn:active:not(:disabled) { transform: scale(0.985); }
    .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Warning box */
    .lp-warning {
      margin-top: 18px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 12px;
      color: #92400e;
      text-align: center;
      line-height: 1.6;
      animation: fadeSlideUp 0.5s 0.45s both;
    }

    /* ── Transition Overlay ── */
    .lp-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #1025a0 0%, #1a42d4 50%, #2255f0 100%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      animation: overlayIn 0.4s ease forwards;
    }

    .lp-overlay.out { animation: overlayOut 0.5s ease 1.5s forwards; }

    @keyframes overlayIn  { from {opacity:0;} to {opacity:1;} }
    @keyframes overlayOut { from {opacity:1;} to {opacity:0;} }

    .lp-ov-icon    { font-size: 64px; animation: successPop 0.55s cubic-bezier(0.22,1,0.36,1) both; }
    .lp-ov-title   { color:#fff; font-size:24px; font-weight:800; font-family:'Poppins',sans-serif; animation: fadeSlideUp 0.5s 0.2s both; }
    .lp-ov-sub     { color:rgba(255,255,255,0.75); font-size:14px; font-family:'Poppins',sans-serif; animation: fadeSlideUp 0.5s 0.35s both; }
    .lp-spinner    { width:42px; height:42px; border:3.5px solid rgba(255,255,255,0.28); border-top:3.5px solid #fff; border-radius:50%; animation: spin 0.85s linear infinite, fadeIn 0.4s 0.5s both; }

    /* ── Responsive ── */
    @media (max-width: 680px) {
      .lp-card { flex-direction: column; border-radius: 20px; }
      .lp-left { width:100%; padding: 28px 24px 20px; }
      .lp-right { padding: 36px 28px; }
      .lp-ground-wrap { min-height: 140px; }
      .lp-college-name { font-size: 13.5px; }
    }
  `;
  document.head.appendChild(el);
};

// ── SVG Basketball Court (fallback / decorative) ──────────────────────────
const CourtSVG = () => (
  <svg
    className="lp-ground-svg"
    viewBox="0 0 400 250"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Court floor */}
    <rect width="400" height="250" fill="#c2742a" />
    {/* Court lines */}
    <rect x="20" y="20" width="360" height="210" rx="4"
      fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" />
    {/* Half-court line */}
    <line x1="200" y1="20" x2="200" y2="230"
      stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
    {/* Centre circle */}
    <circle cx="200" cy="125" r="36"
      fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
    <circle cx="200" cy="125" r="3" fill="rgba(255,255,255,0.85)" />
    {/* Left key */}
    <rect x="20" y="78" width="90" height="94"
      fill="rgba(180,90,20,0.45)" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
    <semicircle />
    <path d="M110,78 A47,47 0 0,1 110,172"
      fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
    {/* Right key */}
    <rect x="290" y="78" width="90" height="94"
      fill="rgba(180,90,20,0.45)" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
    <path d="M290,78 A47,47 0 0,0 290,172"
      fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
    {/* Left basket */}
    <circle cx="32" cy="125" r="10"
      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
    <line x1="32" y1="115" x2="32" y2="20"
      stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4,4" />
    {/* Right basket */}
    <circle cx="368" cy="125" r="10"
      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
    <line x1="368" y1="115" x2="368" y2="20"
      stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4,4" />
    {/* Three point arcs */}
    <path d="M20,50 A105,105 0 0,1 20,200"
      fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
    <path d="M380,50 A105,105 0 0,0 380,200"
      fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
    {/* Ball decoration */}
    <circle cx="200" cy="125" r="14" fill="rgba(255,120,20,0.6)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    <path d="M186,125 Q200,112 214,125 Q200,138 186,125"
      fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
    {/* Subtle vignette overlay */}
    <rect width="400" height="250" fill="url(#vig)" />
    <defs>
      <radialGradient id="vig" cx="50%" cy="50%" r="70%">
        <stop offset="0%"   stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(10,20,80,0.45)" />
      </radialGradient>
    </defs>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

function Login() {
  injectCSS();

  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMsg, setTransitionMsg] = useState("");

  const navigate = useNavigate();

  const getRoleLabel = (role) => ({
    admin:    "Administrator",
    staff:    "Staff Member",
    student:  "Student",
    director: "Director",
  }[role?.toLowerCase()] || role || "User");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      const decoded = jwtDecode(data.token);
      localStorage.setItem("role",   decoded.activeRole);
      localStorage.setItem("userId", decoded.id);

      setTransitionMsg(getRoleLabel(decoded.activeRole));
      setTransitioning(true);

      setTimeout(() => navigate("/dashboard"), 2100);
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      {/* ── PAGE TRANSITION OVERLAY ── */}
      {transitioning && (
        <div className="lp-overlay out">
          <div className="lp-ov-icon">🏆</div>
          <div className="lp-ov-title">Welcome, {transitionMsg}!</div>
          <div className="lp-ov-sub">Loading your dashboard…</div>
          <div className="lp-spinner" />
        </div>
      )}

      {/* ── MAIN PAGE ── */}
      <div className="lp-page">
        <div className="lp-card">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="lp-left">
            {/* Blobs */}
            <div className="lp-blob lp-blob-1" />
            <div className="lp-blob lp-blob-2" />
            <div className="lp-blob lp-blob-3" />
            <div className="lp-blob lp-blob-4" />

            {/* Logo + College Name in same row */}
            <div className="lp-college-header">
              <div className="lp-logo-wrap">
                <img
                  src="/assets/clg.png" 
                  alt="Dr Sivanthi Aditanar College of Engineering Logo"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML = "🏅";
                    e.target.parentNode.style.fontSize = "32px";
                  }}
                />
              </div>
              <div className="lp-college-info">
                <div className="lp-college-name">
                  Dr Sivanthi Aditanar College of Engineering
                </div>
                <div className="lp-dept-name">Sports Department</div>
                <span className="lp-system-tag">Data Management System</span>
              </div>
            </div>

            <hr className="lp-sep" />

            {/* Professional Ground / Court Image */}
            <div className="lp-ground-wrap">
              {
                <img
                  className="lp-ground-img"
                  src="/assets/volleyball.jpg"
                  alt="Sports Ground"
                />
              }
              <CourtSVG />
              <div className="lp-ground-overlay" />
            </div>

            {/* Footer */}
            <div className="lp-footer">
              <div className="lp-footer-text">
                v2.1.4 &nbsp;|&nbsp; Secure Access Only
              </div>
              <div className="lp-footer-text">
                Need help? &nbsp;drsacoe@aei.edu.in
              </div>
            </div>
          </div>

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="lp-right">
            <div className="lp-right-title">Secure Login</div>
            <div className="lp-right-sub">
              Enter your credentials to access the system
            </div>

            {/* Role badges */}
            <div className="lp-badges">
              <span className="lp-badge badge-admin">Admin</span>
              <span className="lp-badge badge-staff">Staff</span>
              <span className="lp-badge badge-student">Student</span>
              <span className="lp-badge badge-director">Director</span>
            </div>

            {/* Username */}
            <div className="lp-label">
              <span>👤</span> Username / ID
            </div>
            <div className="lp-input-wrap">
              <input
                className="lp-input"
                placeholder="Enter your username or student ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="lp-label">
              <span>🔒</span> Password
            </div>
            <div className="lp-input-wrap">
              <input
                className="lp-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="current-password"
              />
            </div>

            {/* Remember only (no forgot password) */}
            <div className="lp-row">
              <label className="lp-check-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember this device
              </label>
            </div>

            {/* Sign In Button */}
            <button
              className="lp-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In to Dashboard"}
            </button>

            {/* Security notice */}
            <div className="lp-warning">
              🔒 This system contains confidential sports performance data.
              Unauthorized access is prohibited.
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;
