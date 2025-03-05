import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        let q = collection(db, "suppliers");

        // If there's a filter, create a query that matches name or phone
        if (filter) {
          q = query(
            collection(db, "suppliers"),
            where("name", ">=", filter),
            where("name", "<=", filter + "\uf8ff")
          );
        }

        const querySnapshot = await getDocs(q);
        const suppliersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuppliers(suppliersList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching suppliers: ", error);
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (loading) return <div>Loading suppliers...</div>;

  return (
    <div>
      <h1>Suppliers</h1>

      <input
        type="text"
        placeholder="Search suppliers"
        value={filter}
        onChange={handleFilterChange}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "16px",
          border: "1px solid #ccc",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Phone</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Address
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Amount Paid
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Amount Payable
            </th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {supplier.name}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {supplier.phone}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {supplier.address}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {supplier.amountPaid}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {supplier.amoutnPayable}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Suppliers;
