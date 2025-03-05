import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

function Analytics() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    topCustomers: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("thisMonth");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Determine date range based on filter
        let startDate, endDate;
        const now = new Date();
        switch (dateFilter) {
          case "thisWeek":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - now.getDay()
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() + (6 - now.getDay())
            );
            break;
          case "thisMonth":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case "lastMonth":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
          default:
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }

        // Fetch Transactions
        const transactionsQuery = query(
          collection(db, "transactions"),
          where("date", ">=", startDate),
          where("date", "<=", endDate),
          orderBy("date", "desc")
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactions = transactionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch Expenses
        const expensesQuery = query(
          collection(db, "expenses"),
          where("date", ">=", startDate),
          where("date", "<=", endDate)
        );
        const expensesSnapshot = await getDocs(expensesQuery);
        const expenses = expensesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate total revenue and expenses
        const totalRevenue = transactions.reduce(
          (sum, transaction) => sum + (transaction.totalAmount || 0),
          0
        );
        const totalExpenses = expenses.reduce(
          (sum, expense) => sum + (expense.amount || 0),
          0
        );
        const netProfit = totalRevenue - totalExpenses;

        // Get top customers
        const customerRevenue = transactions.reduce((acc, transaction) => {
          if (transaction.customerName) {
            acc[transaction.customerName] =
              (acc[transaction.customerName] || 0) +
              (transaction.totalAmount || 0);
          }
          return acc;
        }, {});

        const topCustomers = Object.entries(customerRevenue)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, revenue]) => ({ name, revenue }));

        setSummary({
          totalRevenue,
          totalExpenses,
          netProfit,
          topCustomers,
          recentTransactions: transactions.slice(0, 10),
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics: ", error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateFilter]);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div>
      <h1>Business Analytics</h1>

      <div
        style={{
          display: "flex",
          marginBottom: "16px",
          justifyContent: "space-between",
        }}
      >
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
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
          <h2>Total Revenue</h2>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "green" }}>
            ${summary.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <h2>Total Expenses</h2>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "red" }}>
            ${summary.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <h2>Net Profit</h2>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: summary.netProfit >= 0 ? "green" : "red",
            }}
          >
            ${summary.netProfit.toFixed(2)}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <h2>Top Customers</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Name
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.topCustomers.map((customer, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {customer.name}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    ${customer.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Recent Transactions</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Date
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Customer
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {transaction.date &&
                      new Date(
                        transaction.date.seconds * 1000
                      ).toLocaleDateString()}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {transaction.customerName}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    ${transaction.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
