import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Main Sales Transaction Component
const Sales = () => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    customerId: "",
    customerName: "",
    paymentType: "cash",
    gasDetails: {
      type: "cylinder",
      cylinderDetails: {
        cylindersSold: 0,
        cylinderRate: 0,
        emptyCylindersReturned: 0,
      },
      weightDetails: {
        gasWeight: 0,
        gasRate: 0,
        cylinderNumber: 0,
      },
    },
    totalAmount: 0,
    amountReceived: 0,
    previousUnpaidAmount: 0,
    remainingAmount: 0,
    notes: "",
  });

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const q = query(
        collection(db, "transactions"),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const fetchedTransactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Add new transaction
  const handleAddTransaction = async () => {
    try {
      // Calculate total amount and remaining amount
      const totalAmount =
        newTransaction.gasDetails.type === "cylinder"
          ? newTransaction.gasDetails.cylinderDetails.cylindersSold *
            newTransaction.gasDetails.cylinderDetails.cylinderRate
          : newTransaction.gasDetails.weightDetails.gasWeight *
            newTransaction.gasDetails.weightDetails.gasRate;

      const remainingAmount =
        totalAmount -
        newTransaction.amountReceived +
        newTransaction.previousUnpaidAmount;

      const transactionToAdd = {
        ...newTransaction,
        totalAmount,
        remainingAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "transactions"), transactionToAdd);

      // Reset form and refresh transactions
      setNewTransaction({
        customerId: "",
        customerName: "",
        paymentType: "cash",
        gasDetails: {
          type: "cylinder",
          cylinderDetails: {
            cylindersSold: 0,
            cylinderRate: 0,
            emptyCylindersReturned: 0,
          },
          weightDetails: {
            gasWeight: 0,
            gasRate: 0,
            cylinderNumber: 0,
          },
        },
        totalAmount: 0,
        amountReceived: 0,
        previousUnpaidAmount: 0,
        remainingAmount: 0,
        notes: "",
      });

      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Effect to fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gas Sales Transactions</h1>

      {/* Transaction Entry Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer ID</Label>
                <Input
                  value={newTransaction.customerId}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      customerId: e.target.value,
                    }))
                  }
                  placeholder="Customer ID"
                />
              </div>
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={newTransaction.customerName}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="Customer Name"
                />
              </div>
            </div>

            {/* Payment Type */}
            <div>
              <Label>Payment Type</Label>
              <Select
                value={newTransaction.paymentType}
                onValueChange={(value) =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    paymentType: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gas Sale Type */}
            <div>
              <Label>Sale Type</Label>
              <Select
                value={newTransaction.gasDetails.type}
                onValueChange={(value) =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    gasDetails: {
                      ...prev.gasDetails,
                      type: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sale Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cylinder">Cylinder</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cylinder or Weight Details */}
            {newTransaction.gasDetails.type === "cylinder" ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Cylinders Sold</Label>
                  <Input
                    type="number"
                    value={
                      newTransaction.gasDetails.cylinderDetails.cylindersSold
                    }
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        gasDetails: {
                          ...prev.gasDetails,
                          cylinderDetails: {
                            ...prev.gasDetails.cylinderDetails,
                            cylindersSold: Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Cylinder Rate</Label>
                  <Input
                    type="number"
                    value={
                      newTransaction.gasDetails.cylinderDetails.cylinderRate
                    }
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        gasDetails: {
                          ...prev.gasDetails,
                          cylinderDetails: {
                            ...prev.gasDetails.cylinderDetails,
                            cylinderRate: Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Empty Cylinders Returned</Label>
                  <Input
                    type="number"
                    value={
                      newTransaction.gasDetails.cylinderDetails
                        .emptyCylindersReturned
                    }
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        gasDetails: {
                          ...prev.gasDetails,
                          cylinderDetails: {
                            ...prev.gasDetails.cylinderDetails,
                            emptyCylindersReturned: Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Gas Weight (kg)</Label>
                  <Input
                    type="number"
                    value={newTransaction.gasDetails.weightDetails.gasWeight}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        gasDetails: {
                          ...prev.gasDetails,
                          weightDetails: {
                            ...prev.gasDetails.weightDetails,
                            gasWeight: Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Gas Rate (per kg)</Label>
                  <Input
                    type="number"
                    value={newTransaction.gasDetails.weightDetails.gasRate}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        gasDetails: {
                          ...prev.gasDetails,
                          weightDetails: {
                            ...prev.gasDetails.weightDetails,
                            gasRate: Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Cylinder Number</Label>
                  <Input
                    type="number"
                    value={
                      newTransaction.gasDetails.weightDetails.cylinderNumber
                    }
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        gasDetails: {
                          ...prev.gasDetails,
                          weightDetails: {
                            ...prev.gasDetails.weightDetails,
                            cylinderNumber: Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Financial Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Amount Received</Label>
                <Input
                  type="number"
                  value={newTransaction.amountReceived}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      amountReceived: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Previous Unpaid Amount</Label>
                <Input
                  type="number"
                  value={newTransaction.previousUnpaidAmount}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      previousUnpaidAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  value={newTransaction.notes}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Additional notes"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddTransaction}>Add Transaction</Button>
        </CardFooter>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Customer</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-right">Total Amount</th>
                  <th className="p-2 text-right">Received</th>
                  <th className="p-2 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="p-2">{transaction.customerName}</td>
                    <td className="p-2">
                      {transaction.gasDetails.type === "cylinder"
                        ? "Cylinder"
                        : "Weight-based"}
                    </td>
                    <td className="p-2 text-right">
                      {transaction.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      {transaction.amountReceived.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      {transaction.remainingAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
