import TransactionList from "../components/transactions/TransactionList";
import CreateTransactionForm from "../components/transactions/CreateTransactionForm";

const Sales = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sales Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create Transaction</h2>
          <CreateTransactionForm />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
          <TransactionList />
        </div>
      </div>
    </div>
  );
};

export default Sales;
