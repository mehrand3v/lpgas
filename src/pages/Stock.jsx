import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

function Stock() {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Assuming stock is stored in a single document with ID 'current'
        const stockDocRef = doc(db, "stock", "current");
        const stockDocSnap = await getDoc(stockDocRef);

        if (stockDocSnap.exists()) {
          setStockData(stockDocSnap.data());
        } else {
          console.log("No stock data found!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stock data: ", error);
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  if (loading) return <div>Loading stock information...</div>;
  if (!stockData) return <div>No stock data available</div>;

  return (
    <div>
      <h1>Stock Information</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <h2>Total Stock</h2>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stockData.totalStock}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <h2>Available Stock</h2>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stockData.available}
          </p>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Metric</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Quantity
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              Total Stock
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              {stockData.totalStock}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              Available
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              {stockData.available}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              With Customers
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              {stockData.withCustomers}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              Empty Cylinders
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              {stockData.empty}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: "16px", color: "#666" }}>
        Last Updated:{" "}
        {new Date(stockData.lastUpdated.seconds * 1000).toLocaleString()}
      </p>
    </div>
  );
}

export default Stock;
