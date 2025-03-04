import { Link } from "react-router-dom";

function Navbar() {
  const menuItems = [
    { label: "Sales", path: "/sales" },
    { label: "Customers", path: "/customers" },
    { label: "Suppliers", path: "/suppliers" },
    { label: "Expenses", path: "/expenses" },
    { label: "Stock", path: "/stock" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <nav className="fixed left-0 top-0 w-64 h-full bg-gray-800 text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gas Business</h1>
      </div>
      <ul>
        {menuItems.map((item) => (
          <li key={item.path} className="mb-2">
            <Link
              to={item.path}
              className="block py-2 px-4 hover:bg-gray-700 rounded"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
