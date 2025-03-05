import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { CustomerService } from "./CustomerService";

// Utility to format transaction data
const formatTransactionData = (transactionData) => ({
  date: transactionData.date || serverTimestamp(),
  customerId: transactionData.customerId,
  customerName: transactionData.customerName,
  paymentType: transactionData.paymentType,
  gasDetails: {
    type: transactionData.gasDetails.type,
    ...(transactionData.gasDetails.type === "cylinder"
      ? {
          cylinderDetails: {
            cylindersSold:
              Number(
                transactionData.gasDetails.cylinderDetails.cylindersSold
              ) || 0,
            cylinderRate:
              Number(transactionData.gasDetails.cylinderDetails.cylinderRate) ||
              0,
            emptyCylindersReturned:
              Number(
                transactionData.gasDetails.cylinderDetails
                  .emptyCylindersReturned
              ) || 0,
          },
        }
      : {
          weightDetails: {
            gasWeight:
              Number(transactionData.gasDetails.weightDetails.gasWeight) || 0,
            gasRate:
              Number(transactionData.gasDetails.weightDetails.gasRate) || 0,
            cylinderNumber:
              Number(transactionData.gasDetails.weightDetails.cylinderNumber) ||
              0,
            vehicleRef:
              transactionData.gasDetails.weightDetails.vehicleRef || null,
          },
        }),
  },
  totalAmount: Number(transactionData.totalAmount) || 0,
  amountReceived: Number(transactionData.amountReceived) || 0,
  previousUnpaidAmount: Number(transactionData.previousUnpaidAmount) || 0,
  remainingAmount: Number(transactionData.remainingAmount) || 0,
  notes: transactionData.notes || "",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const TransactionService = {
  // Create a new transaction
  async createTransaction(transactionData) {
    try {
      // Fetch customer details for name
      const customer = await CustomerService.getCustomerById(
        transactionData.customerId
      );

      // Format transaction data
      const formattedData = formatTransactionData({
        ...transactionData,
        customerName: customer.name,
      });

      // Calculate transaction details
      const calculatedDetails = this.calculateTransactionDetails(formattedData);

      // Add transaction
      const docRef = await addDoc(
        collection(db, "transactions"),
        calculatedDetails
      );

      // Update customer balance and cylinders
      await this.updateCustomerAfterTransaction(
        transactionData.customerId,
        calculatedDetails
      );

      return {
        id: docRef.id,
        ...calculatedDetails,
      };
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  // Calculate transaction details
  calculateTransactionDetails(transactionData) {
    let totalAmount = 0;

    // Calculate total amount based on transaction type
    if (transactionData.gasDetails.type === "cylinder") {
      const { cylindersSold, cylinderRate, emptyCylindersReturned } =
        transactionData.gasDetails.cylinderDetails;
      totalAmount =
        cylindersSold * cylinderRate - emptyCylindersReturned * cylinderRate;
    } else {
      const { gasWeight, gasRate } = transactionData.gasDetails.weightDetails;
      totalAmount = gasWeight * gasRate;
    }

    // Calculate remaining amount based on payment type
    const amountReceived = transactionData.amountReceived || 0;
    const previousUnpaidAmount = transactionData.previousUnpaidAmount || 0;
    const totalOwedAmount = previousUnpaidAmount + totalAmount;
    const remainingAmount = totalOwedAmount - amountReceived;

    return {
      ...transactionData,
      totalAmount,
      amountReceived,
      previousUnpaidAmount,
      remainingAmount,
    };
  },

  // Update customer after transaction
  async updateCustomerAfterTransaction(customerId, transactionDetails) {
    try {
      // Fetch current customer details
      const customer = await CustomerService.getCustomerById(customerId);

      // Update customer balance
      const updatedBalance =
        (customer.currentBalance || 0) + transactionDetails.remainingAmount;

      // Update cylinders out if it's a cylinder transaction
      const updatedCylinders =
        transactionDetails.gasDetails.type === "cylinder"
          ? (customer.totalCylindersOut || 0) +
            (transactionDetails.gasDetails.cylinderDetails.cylindersSold -
              transactionDetails.gasDetails.cylinderDetails
                .emptyCylindersReturned)
          : customer.totalCylindersOut;

      // Update customer
      await CustomerService.updateCustomer(customerId, {
        currentBalance: updatedBalance,
        totalCylindersOut: updatedCylinders,
        lastTransactionDate: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating customer after transaction:", error);
      throw error;
    }
  },

  // Get transactions for a specific customer
  async getCustomerTransactions(customerId) {
    try {
      const q = query(
        collection(db, "transactions"),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching customer transactions:", error);
      throw error;
    }
  },

  // Get all transactions
  async getAllTransactions() {
    try {
      const q = query(
        collection(db, "transactions"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
};

// Validation utility
export const validateTransactionForm = (transactionData) => {
  const errors = {};

  // Customer validation
  if (!transactionData.customerId) {
    errors.customerId = "Customer is required";
  }

  // Payment type validation
  if (!transactionData.paymentType) {
    errors.paymentType = "Payment type is required";
  }

  // Gas details validation
  if (!transactionData.gasDetails || !transactionData.gasDetails.type) {
    errors.gasDetailsType = "Transaction type is required";
  }

  // Specific validations based on transaction type
  if (transactionData.gasDetails.type === "cylinder") {
    const cylinderDetails = transactionData.gasDetails.cylinderDetails;
    if (cylinderDetails.cylindersSold <= 0) {
      errors.cylindersSold = "Cylinders sold must be greater than 0";
    }
    if (cylinderDetails.cylinderRate <= 0) {
      errors.cylinderRate = "Cylinder rate must be greater than 0";
    }
  } else if (transactionData.gasDetails.type === "weight") {
    const weightDetails = transactionData.gasDetails.weightDetails;
    if (weightDetails.gasWeight <= 0) {
      errors.gasWeight = "Gas weight must be greater than 0";
    }
    if (weightDetails.gasRate <= 0) {
      errors.gasRate = "Gas rate must be greater than 0";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
