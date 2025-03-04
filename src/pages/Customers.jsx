import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    currentBalance: 0,
    totalCylindersOut: 0,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        let q = collection(db, "customers");

        // If there's a filter, create a query that matches name or phone
        if (filter) {
          q = query(
            collection(db, "customers"),
            where("name", ">=", filter),
            where("name", "<=", filter + "\uf8ff")
          );
        }

        const querySnapshot = await getDocs(q);
        const customersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customersList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers: ", error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]:
        name === "currentBalance" || name === "totalCylindersOut"
          ? Number(value)
          : value,
    }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      // Add new customer to Firestore
      const docRef = await addDoc(collection(db, "customers"), {
        ...newCustomer,
        createdAt: new Date(),
      });

      // Update local state
      setCustomers((prev) => [{ id: docRef.id, ...newCustomer }, ...prev]);

      // Reset form and close modal
      setNewCustomer({
        name: "",
        phone: "",
        address: "",
        currentBalance: 0,
        totalCylindersOut: 0,
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding customer: ", error);
      alert("Failed to add customer. Please try again.");
    }
  };

  const renderAddCustomerModal = () => {
    if (!showModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            width: "400px",
            maxHeight: "80%",
            overflowY: "auto",
          }}
        >
          <h2>Add New Customer</h2>
          <form onSubmit={handleAddCustomer}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Name
                <input
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Address
                <textarea
                  name="address"
                  value={newCustomer.address}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                    minHeight: "100px",
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Current Balance
                <input
                  type="number"
                  name="currentBalance"
                  value={newCustomer.currentBalance}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Total Cylinders Out
                <input
                  type="number"
                  name="totalCylindersOut"
                  value={newCustomer.totalCylindersOut}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </label>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading customers...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h1>Customers</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Add Customer
        </button>
      </div>

      <input
        type="text"
        placeholder="Search customers"
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
              Current Balance
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Cylinders Out
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {customer.name}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {customer.phone}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {customer.address}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {customer.currentBalance}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {customer.totalCylindersOut}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderAddCustomerModal()}
    </div>
  );
}

export default Customers;
