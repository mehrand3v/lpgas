import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CustomerService } from "../services/CustomerService";

const CustomerDetail = () => {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { customerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const customerData = await CustomerService.getCustomerById(customerId);
        setCustomer({
          ...customerData,
          // Ensure currentBalance is a number
          currentBalance: Number(customerData.currentBalance) || 0,
          // Ensure totalCylindersOut is a number
          totalCylindersOut: Number(customerData.totalCylindersOut) || 0,
        });
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch customer details");
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await CustomerService.deleteCustomer(customerId);
        navigate("/customers");
      } catch (err) {
        setError("Failed to delete customer");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading customer details...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!customer) {
    return <div className="text-center mt-10">Customer not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4py-5 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <div className="flex space-x-3">
            <Link
              to={`/customers/edit/${customerId}`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Edit Customer
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Delete Customer
            </button>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <p className="text-gray-900">
                    {customer.phone || "Not provided"}
                  </p>
                </div>
                <div className="mb-3">
                  <span className="text-gray-600 font-medium">Address:</span>
                  <p className="text-gray-900">
                    {customer.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Summary
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-3">
                  <span className="text-gray-600 font-medium">
                    Current Balance:
                  </span>
                  <p
                    className={`text-xl font-bold ${
                      (Number(customer.currentBalance) || 0) > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    ${Number(customer.currentBalance.toFixed(2))}
                  </p>
                </div>
                <div className="mb-3">
                  <span className="text-gray-600 font-medium">
                    Total Cylinders Out:
                  </span>
                  <p className="text-gray-900">
                    {Number(customer.totalCylindersOut || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">
                    Last Transaction:
                  </span>
                  <p className="text-gray-900">
                    {customer.lastTransactionDate
                      ? new Date(
                          customer.lastTransactionDate.toDate()
                        ).toLocaleDateString()
                      : "No transactions"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No recent transactions
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
