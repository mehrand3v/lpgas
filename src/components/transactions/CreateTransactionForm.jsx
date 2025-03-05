import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerService } from '../../services/CustomerService';
import { TransactionService, validateTransactionForm } from '../../services/TransactionService';

const CreateTransactionForm = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    paymentType: 'partial',
    gasDetails: {
      type: 'cylinder',
      cylinderDetails: {
        cylindersSold: '',
        cylinderRate: '',
        emptyCylindersReturned: ''
      },
      weightDetails: {
        gasWeight: '',
        gasRate: '',
        cylinderNumber: '',
        vehicleRef: ''
      }
    },
    amountReceived: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerList = await CustomerService.getAllCustomers();
        setCustomers(customerList);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested form data
    const updateNestedState = (prevState, path, newValue) => {
      const [first, ...rest] = path.split('.');
      return {
        ...prevState,
        [first]: rest.length
          ? updateNestedState(prevState[first], rest.join('.'), newValue)
          : newValue
      };
    };

    setFormData(prevState =>
      updateNestedState(prevState, name, value)
    );
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
      const newTransaction = await TransactionService.createTransaction(formData);
      // Redirect to transaction list or customer detail
      navigate(`/customers/${formData.customerId}`);
    } catch (error) {
      setErrors({ submit: 'Failed to create transaction. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.customerId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select a Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
        </div>

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
        {formData.gasDetails.type === 'cylinder' && (
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
                className={`w-full px-3 py-2 border rounded-md ${errors.cylindersSold ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Number of cylinders sold"
              />
              {errors.cylindersSold && <p className="text-red-500 text-xs mt-1">{errors.cylindersSold}</p>}
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
                className={`w-full px-3 py-2 border rounded-md ${errors.cylinderRate ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Rate per cylinder"
              />
              {errors.cylinderRate && <p className="text-red-500 text-xs mt-1">{errors.cylinderRate}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Empty Cylinders Returned
              </label>
              <input
                type="number"
                name="gasDetails.cylinderDetails.emptyCylindersReturned"
                value={formData.gasDetails.cylinderDetails.emptyCylindersReturned}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Number of empty cylinders returned"
              />
            </div>
          </div>
        )}

        {/* Weight Details */}
        {formData.gasDetails.type === 'weight' && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2"></label>