import { useState, useEffect } from "react";
import { TransactionService } from "../services/TransactionService";
import { useNavigate } from "react-router-dom";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionList = await TransactionService.getAllTransactions();
        setTransactions(transactionList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch transactions");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const renderTransactionType = (transaction) => {
    if (transaction.gasDetails.type === "cylinder") {
      const { cylindersSold, cylinderRate, emptyCylindersReturned } =
        transaction.gasDetails.cylinderDetails;
      return `Cylinder: ${cylindersSold} @ ₹${cylinderRate} (Returned: ${emptyCylindersReturned})`;
    } else {
      const { gasWeight, gasRate } = transaction.gasDetails.weightDetails;
      return `Weight: ${gasWeight} kg @ ₹${gasRate}/kg`;
    }
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sales Transactions</h2>
        <button
          onClick={() => navigate("/transactions/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Transaction
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Transaction Type</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Amount Received</th>
            <th className="border p-2">Remaining Amount</th>
            <th className="border p-2">Payment Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-100">
              <td className="border p-2">
                {transaction.date instanceof Date
                  ? transaction.date.toLocaleDateString()
                  : new Date(
                      transaction.createdAt.seconds * 1000
                    ).toLocaleDateString()}
              </td>
              <td className="border p-2">{transaction.customerName}</td>
              <td className="border p-2">
                {renderTransactionType(transaction)}
              </td>
              <td className="border p-2">
                ₹{transaction.totalAmount.toFixed(2)}
              </td>
              <td className="border p-2">
                ₹{transaction.amountReceived.toFixed(2)}
              </td>
              <td className="border p-2">
                ₹{transaction.remainingAmount.toFixed(2)}
              </td>
              <td className="border p-2">{transaction.paymentType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
