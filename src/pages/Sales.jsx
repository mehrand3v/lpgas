import { useState } from "react";
import { db } from "../config/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Sales = () => {
  const [transactionType, setTransactionType] = useState("cylinder");
  const [paymentType, setPaymentType] = useState("cash");

  // State for cylinder details
  const [cylindersSold, setCylindersSold] = useState(0);
  const [cylinderRate, setCylinderRate] = useState(0);
  const [emptyCylindersReturned, setEmptyCylindersReturned] = useState(0);

  // State for weight-based details
  const [gasWeight, setGasWeight] = useState(0);
  const [gasRate, setGasRate] = useState(0);
  const [cylinderNumber, setCylinderNumber] = useState("");
  const [vehicleRef, setVehicleRef] = useState("");

  // Common transaction details
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [previousUnpaidAmount, setPreviousUnpaidAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const calculateTotalAmount = () => {
    let amount = 0;
    if (transactionType === "cylinder") {
      amount = cylindersSold * cylinderRate;
    } else {
      amount = gasWeight * gasRate;
    }
    setTotalAmount(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare transaction data
    const transactionData = {
      customerId,
      customerName,
      paymentType,
      gasDetails: {
        type: transactionType,
        ...(transactionType === "cylinder"
          ? {
              cylinderDetails: {
                cylindersSold,
                cylinderRate,
                emptyCylindersReturned,
              },
            }
          : {
              weightDetails: {
                gasWeight,
                gasRate,
                cylinderNumber,
                vehicleRef,
              },
            }),
      },
      totalAmount,
      amountReceived,
      previousUnpaidAmount,
      remainingAmount: totalAmount - amountReceived + previousUnpaidAmount,
      notes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      // Add transaction to Firestore
      const docRef = await addDoc(
        collection(db, "transactions"),
        transactionData
      );
      console.log("Transaction added with ID: ", docRef.id);

      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  const resetForm = () => {
    setTransactionType("cylinder");
    setPaymentType("cash");
    setCylindersSold(0);
    setCylinderRate(0);
    setEmptyCylindersReturned(0);
    setGasWeight(0);
    setGasRate(0);
    setCylinderNumber("");
    setVehicleRef("");
    setCustomerId("");
    setCustomerName("");
    setTotalAmount(0);
    setAmountReceived(0);
    setPreviousUnpaidAmount(0);
    setNotes("");
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Sales Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type Selection */}
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cylinder"
                  checked={transactionType === "cylinder"}
                  onChange={() => setTransactionType("cylinder")}
                  className="mr-2"
                />
                Cylinder Sale
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="weight"
                  checked={transactionType === "weight"}
                  onChange={() => setTransactionType("weight")}
                  className="mr-2"
                />
                Weight-based Sale
              </label>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            {/* Cylinder or Weight Details */}
            {transactionType === "cylinder" ? (
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Cylinders Sold"
                  value={cylindersSold}
                  onChange={(e) => {
                    setCylindersSold(Number(e.target.value));
                    calculateTotalAmount();
                  }}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Cylinder Rate"
                  value={cylinderRate}
                  onChange={(e) => {
                    setCylinderRate(Number(e.target.value));
                    calculateTotalAmount();
                  }}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Empty Cylinders Returned"
                  value={emptyCylindersReturned}
                  onChange={(e) =>
                    setEmptyCylindersReturned(Number(e.target.value))
                  }
                  className="border p-2 rounded"
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="Gas Weight (kg)"
                  value={gasWeight}
                  onChange={(e) => {
                    setGasWeight(Number(e.target.value));
                    calculateTotalAmount();
                  }}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Gas Rate"
                  value={gasRate}
                  onChange={(e) => {
                    setGasRate(Number(e.target.value));
                    calculateTotalAmount();
                  }}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Cylinder Number"
                  value={cylinderNumber}
                  onChange={(e) => setCylinderNumber(e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Vehicle Reference"
                  value={vehicleRef}
                  onChange={(e) => setVehicleRef(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-3 gap-4">
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="partial">Partial</option>
              </select>
              <input
                type="number"
                placeholder="Total Amount"
                value={totalAmount}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="number"
                placeholder="Amount Received"
                value={amountReceived}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                className="border p-2 rounded"
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Previous Unpaid Amount"
                value={previousUnpaidAmount}
                onChange={(e) =>
                  setPreviousUnpaidAmount(Number(e.target.value))
                }
                className="border p-2 rounded"
              />
              <textarea
                placeholder="Additional Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Submit Transaction
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
