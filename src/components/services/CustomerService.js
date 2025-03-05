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
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

// Utility to format customer data
const formatCustomerData = (customerData) => ({
  name: customerData.name,
  phone: customerData.phone,
  address: customerData.address,
  currentBalance: Number(customerData.currentBalance) || 0,
  lastTransactionDate: customerData.lastTransactionDate || null,
  totalCylindersOut: Number(customerData.totalCylindersOut) || 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const CustomerService = {
  // Create a new customer
  async createCustomer(customerData) {
    try {
      const formattedData = formatCustomerData(customerData);
      const docRef = await addDoc(collection(db, "customers"), formattedData);
      return { id: docRef.id, ...formattedData };
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  // Get all customers
  async getAllCustomers() {
    try {
      const q = query(
        collection(db, "customers"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Get customer by ID
 async getCustomerById(customerId) {
  try {
    const docRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        currentBalance: Number(data.currentBalance) || 0,
        totalCylindersOut: Number(data.totalCylindersOut) || 0
      };
    } else {
      throw new Error('No such customer exists');
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
},

  // Update customer
  async updateCustomer(customerId, updateData) {
    try {
      const docRef = doc(db, "customers", customerId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date(),
      });
      return { id: customerId, ...updateData };
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const docRef = doc(db, "customers", customerId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },
};

// Form validation utility
export const validateCustomerForm = (customerData) => {
  const errors = {};

  // Name validation
  if (!customerData.name || customerData.name.trim() === "") {
    errors.name = "Customer name is required";
  }

  // Phone validation (optional, but if provided, should be valid)
  if (customerData.phone) {
    const phoneRegex = /^[0-9]{11}$/; // Assumes 11-digit phone number
    if (!phoneRegex.test(customerData.phone)) {
      errors.phone = "Phone number must be 11 digits";
    }
  }

  // Address validation (optional)
  if (customerData.address && customerData.address.trim().length > 200) {
    errors.address = "Address cannot exceed 200 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
