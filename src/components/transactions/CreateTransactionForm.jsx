import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// import { CustomerService } from "@/services/CustomerService";
// import { TransactionService } from "@/services/TransactionService";
// import { TransactionService } from "../services/TransactionService";
import {
  TransactionService,
  validateTransactionForm,
} from "../services/TransactionService";

import { CustomerService } from "../services/CustomerService";


const CreateTransactionForm = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    paymentType: "partial",
    gasDetails: {
      type: "cylinder",
      cylinderDetails: {
        cylindersSold: "",
        cylinderRate: "",
        emptyCylindersReturned: "",
      },
      weightDetails: {
        gasWeight: "",
        gasRate: "",
        cylinderNumber: "",
        vehicleRef: "",
      },
    },
    amountReceived: "",
    previousUnpaidAmount: 0,
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerList = await CustomerService.getAllCustomers();
        setCustomers(customerList);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };
    fetchCustomers();
  }, []);

  // Handle customer selection to get previous unpaid amount
  const handleCustomerSelect = async (customerId) => {
    try {
      const customer = await CustomerService.getCustomerById(customerId);
      setSelectedCustomer(customer);
      setFormData((prev) => ({
        ...prev,
        customerId,
        previousUnpaidAmount: customer.currentBalance || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch customer details", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested form data
    const updateNestedState = (prevState, path, newValue) => {
      const [first, ...rest] = path.split(".");
      return {
        ...prevState,
        [first]: rest.length
          ? updateNestedState(prevState[first], rest.join("."), newValue)
          : newValue,
      };
    };

    setFormData((prevState) => updateNestedState(prevState, name, value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationResult = validateTransactionForm(formData);


    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const newTransaction = await TransactionService.createTransaction(
        formData
      );
      // Redirect to transactions list or customer detail
      navigate("/sales");
    } catch (error) {
      setErrors({ submit: "Failed to create transaction. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculation methods
  const calculateTotalAmount = () => {
    if (formData.gasDetails.type === "cylinder") {
      const { cylindersSold, cylinderRate } =
        formData.gasDetails.cylinderDetails;
      return cylindersSold * cylinderRate;
    } else {
      const { gasWeight, gasRate } = formData.gasDetails.weightDetails;
      return gasWeight * gasRate;
    }
  };

  const calculateRemainingAmount = () => {
    const totalAmount = calculateTotalAmount();
    const previousUnpaid = formData.previousUnpaidAmount || 0;
    const amountReceived = formData.amountReceived || 0;
    return totalAmount + previousUnpaid - amountReceived;
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Transaction</h2>

      <form onSubmit={handleSubmit}>
        {/* Customer Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select Customer *
          </label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={(e) => {
              handleChange(e);
              handleCustomerSelect(e.target.value);
            }}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.customerId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>
          )}
        </div>

        {/* Previous Unpaid Amount */}
        {selectedCustomer && (
          <div className="mb-4 bg-yellow-100 p-3 rounded">
            <p>
              Previous Unpaid Balance: ₹
              {selectedCustomer.currentBalance.toFixed(2)}
            </p>
          </div>
        )}

        {/* Payment Type */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Payment Type *
          </label>
          <select
            name="paymentType"
            value={formData.paymentType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Transaction Type *
          </label>
          <select
            name="gasDetails.type"
            value={formData.gasDetails.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="cylinder">Cylinder</option>
            <option value="weight">Weight</option>
          </select>
        </div>

        {/* Cylinder Details */}
        {formData.gasDetails.type === "cylinder" && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Cylinders Sold *
              </label>
              <input
                type="number"
                name="gasDetails.cylinderDetails.cylindersSold"
                value={formData.gasDetails.cylinderDetails.cylindersSold}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.cylindersSold ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Number of cylinders sold"
              />
              {errors.cylindersSold && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.cylindersSold}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Cylinder Rate *
              </label>
              <input
                type="number"
                name="gasDetails.cylinderDetails.cylinderRate"
                value={formData.gasDetails.cylinderDetails.cylinderRate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.cylinderRate ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Rate per cylinder"
              />
              {errors.cylinderRate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.cylinderRate}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Empty Cylinders Returned
              </label>
              <input
                type="number"
                name="gasDetails.cylinderDetails.emptyCylindersReturned"
                value={
                  formData.gasDetails.cylinderDetails.emptyCylindersReturned
                }
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Number of empty cylinders returned"
              />
            </div>
          </div>
        )}

        {/* Weight Details */}
        {formData.gasDetails.type === "weight" && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Gas Weight (kg) *
              </label>
              <input
                type="number"
                name="gasDetails.weightDetails.gasWeight"
                value={formData.gasDetails.weightDetails.gasWeight}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.gasWeight ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Gas weight in kg"
              />
              {errors.gasWeight && (
                <p className="text-red-500 text-xs mt-1">{errors.gasWeight}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Gas Rate (per kg) *
              </label>
              <input
                type="number"
                name="gasDetails.weightDetails.gasRate"
                value={formData.gasDetails.weightDetails.gasRate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.gasRate ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Rate per kg"
              />
              {errors.gasRate && (
                <p className="text-red-500 text-xs mt-1">{errors.gasRate}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Cylinder Number
              </label>
              <input
                type="text"
                name="gasDetails.weightDetails.cylinderNumber"
                value={formData.gasDetails.weightDetails.cylinderNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Cylinder number (optional)"
              />
            </div>
          </div>
        )}

        {/* Amount Received */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount Received
          </label>
          <input
            type="number"
            name="amountReceived"
            value={formData.amountReceived}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Amount received (optional)"
          />
        </div>

        {/* Transaction Summary */}
        <div className="mb-4 bg-gray-100 p-3 rounded">
          <p>Total Amount: ₹{calculateTotalAmount().toFixed(2)}</p>
          <p>
            Previous Unpaid: ₹{(formData.previousUnpaidAmount || 0).toFixed(2)}
          </p>
          <p>Remaining Amount: ₹{calculateRemainingAmount().toFixed(2)}</p>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Additional notes"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Transaction"}
          </button>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mt-4 text-red-500 text-center">{errors.submit}</div>
        )}
      </form>
    </div>
  );
};

export default CreateTransactionForm;
