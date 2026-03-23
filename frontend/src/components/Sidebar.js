function Sidebar({ menu, onSelect }) {
  return (
    <div style={{
      width: "220px",
      background: "#1e293b",
      color: "white",
      height: "100vh",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <h3>Dashboard</h3>
      <hr />

      {menu.map((item) => (
        <p
          key={item.key}
          onClick={() => onSelect(item.key)}
          style={{
            cursor: "pointer",
            padding: "8px",
            margin: "5px 0",
            background: "#334155"
          }}
        >
          {item.label}
        </p>
      ))}
    </div>
  );
}

export default Sidebar;
