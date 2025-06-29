import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Initial States
const initialCustomerFormData = {
  user_id: null,
  full_name: "",
  phone_number: "",
  address: "",
  wallet_balance: "0.00",
};

// Helper Components
const Notification = ({ message, type, onClose }) => {
  return (
    <div
      className={`bg-black border ${
        type === "error" ? "border-red-500" : "border-green-500"
      } text-white px-4 py-3 rounded-md relative mb-4 flex items-center shadow-lg`}
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-300">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const CustomerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  formErrors,
  onChange,
  isSaving,
  currentCustomer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-black border border-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4 text-center text-white">
            {currentCustomer ? "Edit Customer" : "Add New Customer"}
          </h3>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={onChange}
                className="w-full px-3 py-2 bg-black border border-white/30 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white/50"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={onChange}
                className="w-full px-3 py-2 bg-black border border-white/30 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white/50"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={onChange}
                rows="3"
                className="w-full px-3 py-2 bg-black border border-white/30 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white/50"
              />
            </div>

            {/* Wallet Balance */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Wallet Balance
              </label>
              <input
                type="number"
                step="0.01"
                name="wallet_balance"
                value={formData.wallet_balance}
                onChange={onChange}
                className="w-full px-3 py-2 bg-black border border-white/30 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white/50"
              />
              {formErrors.wallet_balance && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.wallet_balance}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-white/30 rounded-md hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-white/90 transition flex items-center gap-2"
              >
                {isSaving && (
                  <svg
                    className="animate-spin h-4 w-4 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {currentCustomer ? "Update" : "Add Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  customer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-black border border-white/30 rounded-lg shadow-2xl w-full max-w-sm mx-4">
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4 text-center text-white">
            Confirm Deletion
          </h3>
          <p className="text-sm text-white/80 text-center mb-6">
            Are you sure you want to delete customer{" "}
            <span className="font-semibold">
              {customer?.full_name || "N/A"}
            </span>{" "}
            (ID: {customer?.user_id})? This action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-white/30 rounded-md hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-white/90 transition flex items-center gap-2"
            >
              {isDeleting && (
                <svg
                  className="animate-spin h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileCustomerCard = ({ customer, onEdit, onDelete }) => {
  return (
    <div className="bg-black border border-white/30 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-white">
            {customer.full_name || "N/A"}
          </h3>
          <p className="text-xs text-white/70 mt-1">ID: {customer.user_id}</p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white border border-white/30">
          {parseFloat(customer.wallet_balance).toFixed(2)} pts
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-white/70 text-xs">Phone</p>
          <p className="text-white">{customer.phone_number || "N/A"}</p>
        </div>
        <div>
          <p className="text-white/70 text-xs">Address</p>
          <p className="text-white line-clamp-1">{customer.address || "N/A"}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => onEdit(customer)}
          className="px-3 py-1 text-xs flex items-center gap-1 bg-black text-white border border-white/30 rounded-md hover:bg-white/10"
        >
          <FiEdit size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(customer)}
          className="px-3 py-1 text-xs flex items-center gap-1 bg-black text-white border border-white/30 rounded-md hover:bg-white/10"
        >
          <FiTrash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
};

const CustomersTable = ({ customers, onEdit, onDelete, loading, isMobile }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = isMobile ? 5 : 11;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-white">No customers found</p>
      </div>
    );
  }

  // Pagination calculations
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(customers.length / customersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (isMobile) {
    return (
      <div className="pb-16">
        {currentCustomers.map((customer) => (
          <MobileCustomerCard
            key={customer.user_id}
            customer={customer}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-black text-white border border-white/30 rounded disabled:opacity-50"
            >
              <FiChevronLeft /> Prev
            </button>
            <span className="text-sm text-white/80">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-black text-white border border-white/30 rounded disabled:opacity-50"
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/30">
        <thead className="bg-black">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              Address
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              Points
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/30">
          {currentCustomers.map((customer) => (
            <tr key={customer.user_id} className="hover:bg-white/5">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-white">
                {customer.user_id}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                {customer.full_name || "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                {customer.phone_number || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm text-white max-w-xs truncate">
                {customer.address || "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white border border-white/30">
                  {parseFloat(customer.wallet_balance).toFixed(2)} pts
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(customer)}
                    className="text-white hover:text-white/70 p-1"
                    title="Edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => onDelete(customer)}
                    className="text-white hover:text-white/70 p-1"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-black border-t border-white/30">
          <div className="flex-1 flex justify-between items-center gap-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-1 border border-white/30 text-sm font-medium rounded-md text-white bg-black hover:bg-white/10 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-white/80">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-1 border border-white/30 text-sm font-medium rounded-md text-white bg-black hover:bg-white/10 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SearchAndAddBar = ({
  searchTerm,
  onSearchChange,
  onAddClick,
  isMobile,
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="text-white/70" />
      </div>
      <input
        type="text"
        placeholder={
          isMobile ? "Search customers..." : "Search by name or phone..."
        }
        className="block w-full pl-10 pr-3 py-2 bg-black border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
    <button
      onClick={onAddClick}
      className="flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 font-medium px-4 py-2 rounded-md transition sm:w-auto"
    >
      <FiPlus /> {isMobile ? "Add" : "Add Customer"}
    </button>
  </div>
);

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isCustomerFormModalOpen, setIsCustomerFormModalOpen] = useState(false);
  const [currentCustomerForForm, setCurrentCustomerForForm] = useState(null);
  const [customerFormData, setCustomerFormData] = useState(
    initialCustomerFormData
  );
  const [customerFormErrors, setCustomerFormErrors] = useState({});
  const [isFormSaving, setIsFormSaving] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const showNotification = useCallback((message, type) => {
    if (type === "success") {
      setSuccessMessage(message);
      setError(null);
    } else {
      setError(message);
      setSuccessMessage(null);
    }
    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        showNotification(
          "Authentication token not found. Please log in again.",
          "error"
        );
        setLoading(false);
        return;
      }

      const url = debouncedSearchTerm
        ? `${BACKEND_URL}/customers/search?query=${debouncedSearchTerm}`
        : `${BACKEND_URL}/customers`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": import.meta.env.VITE_API_SECRET_KEY, // API key from .env
        },
      });

      setCustomers(response.data);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to fetch customers.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, showNotification]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const openCustomerFormModal = (customer = null) => {
    setCurrentCustomerForForm(customer);
    setCustomerFormData(
      customer
        ? {
            user_id: customer.user_id,
            full_name: customer.full_name || "",
            phone_number: customer.phone_number || "",
            address: customer.address || "",
            wallet_balance: parseFloat(customer.wallet_balance).toFixed(2),
          }
        : initialCustomerFormData
    );
    setCustomerFormErrors({});
    setIsCustomerFormModalOpen(true);
  };

  const closeCustomerFormModal = () => {
    setIsCustomerFormModalOpen(false);
    setCurrentCustomerForForm(null);
    setCustomerFormErrors({});
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData((prev) => ({ ...prev, [name]: value }));
    if (customerFormErrors[name]) {
      setCustomerFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateCustomerForm = () => {
    let errors = {};
    if (!customerFormData.full_name.trim()) {
      errors.full_name = "Full name is required.";
    }

    if (isNaN(parseFloat(customerFormData.wallet_balance))) {
      errors.wallet_balance = "Wallet balance must be a valid number.";
    }

    setCustomerFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!validateCustomerForm()) return;

    setIsFormSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        showNotification(
          "Authentication token not found. Please log in again.",
          "error"
        );
        setIsFormSaving(false);
        return;
      }

      const url = customerFormData.user_id
        ? `${BACKEND_URL}/customers/${customerFormData.user_id}`
        : `${BACKEND_URL}/customers`;

      const method = customerFormData.user_id ? "put" : "post";

      await axios[method](url, customerFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": import.meta.env.VITE_API_SECRET_KEY, // API key from env
        },
      });

      showNotification(
        customerFormData.user_id
          ? "Customer updated successfully!"
          : "Customer added successfully!",
        "success"
      );

      closeCustomerFormModal();
      setSearchTerm("");
      await fetchCustomers();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to save customer.",
        "error"
      );
    } finally {
      setIsFormSaving(false);
    }
  };

  const openConfirmModal = (customer) => {
    setCustomerToDelete(customer);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setCustomerToDelete(null);
  };

  const handleConfirmDelete = async () => {
    closeConfirmModal();
    if (!customerToDelete) return;

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        showNotification(
          "Authentication token not found. Please log in again.",
          "error"
        );
        setIsDeleting(false);
        return;
      }

      await axios.delete(
        `${BACKEND_URL}/customers/${customerToDelete.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": import.meta.env.VITE_API_SECRET_KEY,
          },
        }
      );

      showNotification(
        `Customer "${
          customerToDelete.full_name || "N/A"
        }" deleted successfully.`,
        "success"
      );

      await fetchCustomers();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to delete customer.",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="bg-black text-white">
      <h2 className="text-2xl font-bold mb-2">Customers</h2>
      <p className="text-sm text-white/70 mb-6">
        Manage your customer accounts
      </p>

      {successMessage && (
        <Notification
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      <SearchAndAddBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={() => openCustomerFormModal()}
        isMobile={isMobile}
      />

      <div className="border border-white/30 rounded-lg overflow-hidden">
        <CustomersTable
          customers={customers}
          onEdit={openCustomerFormModal}
          onDelete={openConfirmModal}
          loading={loading}
          isMobile={isMobile}
        />
      </div>

      <CustomerFormModal
        isOpen={isCustomerFormModalOpen}
        onClose={closeCustomerFormModal}
        onSubmit={handleSaveCustomer}
        formData={customerFormData}
        formErrors={customerFormErrors}
        onChange={handleCustomerFormChange}
        isSaving={isFormSaving}
        currentCustomer={currentCustomerForForm}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        customer={customerToDelete}
      />
    </div>
  );
};

export default CustomersPage;
