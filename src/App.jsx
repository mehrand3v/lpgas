import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerList from "./components/customers/CustomerList";
import AddCustomerForm from "./components/customers/AddCustomerForm";
import CustomerDetail from "./components/customers/CustomerDetail";
import Suppliers from "./pages/Suppliers";
import Expenses from "./pages/Expenses";
import Stock from "./pages/Stock";
import Sales from "./pages/Sales";
import CreateTransactionForm from "./components/transactions/CreateTransactionForm";
import TransactionList from "./components/transactions/TransactionList";
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
            {/* Sales Routes */}
            <Route path="/sales" element={<Sales />} />
            <Route
              path="/transactions/new"
              element={<CreateTransactionForm />}
            />
            <Route path="/transactions" element={<TransactionList />} />

            {/* Customer Routes */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<AddCustomerForm />} />
            <Route path="/customers/:customerId" element={<CustomerDetail />} />

            {/* Other Routes */}
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
