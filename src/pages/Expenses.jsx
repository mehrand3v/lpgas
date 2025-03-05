import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        let q = query(collection(db, "expenses"), orderBy("date", "desc"));

        // If there's a category filter, modify the query
        if (categoryFilter) {
          q = query(
            collection(db, "expenses"),
            where("category", "==", categoryFilter),
            orderBy("date", "desc")
          );
        }

        const querySnapshot = await getDocs(q);
        const expensesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(expensesList.map((e) => e.category)),
        ];

        setExpenses(expensesList);
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching expenses: ", error);
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [categoryFilter]);

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  if (loading) return <div>Loading expenses...</div>;

  return (
    <div>
      <h1>Expenses</h1>

      <div style={{ display: "flex", marginBottom: "16px" }}>
        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Category
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Description
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Amount</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Payment Method
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {expense.date &&
                  new Date(expense.date.seconds * 1000).toLocaleDateString()}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {expense.category}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {expense.description}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {expense.amount}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {expense.paymentMethod}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Expenses;
