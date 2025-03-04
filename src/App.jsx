
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Expenses from "./pages/Expenses";
import Stock from "./pages/Stock";
import Sales from "./pages/Sales";
import Analytics from "./pages/Analytics";

function App() {
  const menuItems = [
    { path: "/sales", label: "Sales" },
    { path: "/customers", label: "Customers" },
    { path: "/suppliers", label: "Suppliers" },
    { path: "/expenses", label: "Expenses" },
    { path: "/stock", label: "Stock" },
    { path: "/analytics", label: "Analytics" },
  ];

  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "200px",
            backgroundColor: "#f0f0f0",
            padding: "20px",
            borderRight: "1px solid #ddd",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Gas Business</h2>
          <nav>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "block",
                  padding: "10px",
                  textDecoration: "none",
                  color: "black",
                  marginBottom: "10px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "5px",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            backgroundColor: "white",
          }}
        >
          <Routes>
            <Route path="/sales" element={<Sales />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/" element={<Sales />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
