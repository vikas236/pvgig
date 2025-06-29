import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiTrash2,
  FiX,
  FiInfo,
} from "react-icons/fi";

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ORDERS_PER_PAGE = 9;
const ORDER_STATUSES = [
  { value: "received", label: "Order Received" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready for Delivery" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // State Management
  const [state, setState] = useState({
    orders: [],
    error: null,
    filters: {
      search: "",
      status: "",
    },
    modals: {
      details: false,
      create: false,
      updateStatus: false,
    },
    selectedOrder: null,
    newOrder: {
      user_id: "",
      total_amount: "",
      delivery_address: "",
      payment_method: "cash",
      notes: "",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
    selectedStatus: "",
  });

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Derived values
  const {
    orders,
    error,
    filters,
    modals,
    selectedOrder,
    newOrder,
    pagination,
    selectedStatus,
  } = state;
  const { currentPage, totalPages } = pagination;

  // Calculate paginated orders
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Initial authentication check
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
    } else {
      if (initialLoad) {
        fetchOrders();
        setInitialLoad(false);
      }
    }
  }, [navigate, initialLoad]);

  // API Call to fetch orders with filtering
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setState((prev) => ({ ...prev, error: null }));

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const endpoint = filters.search.trim()
        ? `${BACKEND_URL}/orders/search`
        : `${BACKEND_URL}/orders`;

      const params = {
        status: filters.status || undefined,
      };

      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_SECRET_KEY, // Add your API key from .env
        },
        params,
        validateStatus: (status) => status < 500,
      });

      if (response.status === 403) {
        showNotification("You don't have permission to view orders", "error");
        localStorage.removeItem("adminToken");
        navigate("/login");
        return;
      }

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to fetch orders");
      }

      const ordersData = Array.isArray(response.data) ? response.data : [];
      const totalPages = Math.ceil(ordersData.length / ORDERS_PER_PAGE);

      setState((prev) => ({
        ...prev,
        orders: ordersData,
        pagination: {
          ...prev.pagination,
          totalPages,
          currentPage:
            prev.pagination.currentPage > totalPages
              ? 1
              : prev.pagination.currentPage,
        },
      }));
    } catch (err) {
      showNotification(
        err.response?.data?.message || err.message || "Failed to fetch orders",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters.search, filters.status, navigate]);

  // Search debounce effect
  useEffect(() => {
    if (initialLoad) return;

    if (searchTimeout) clearTimeout(searchTimeout);

    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);

    setSearchTimeout(timer);

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [filters.search, initialLoad]);

  // Other filter effects
  useEffect(() => {
    if (initialLoad) return;
    fetchOrders();
  }, [filters.status, initialLoad]);

  // Pagination handlers
  const goToPage = (page) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: page,
      },
    }));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/login");
        return;
      }

      setIsLoading(true);

      const response = await axios.put(
        `${BACKEND_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_API_SECRET_KEY, // Include API key from .env
          },
          validateStatus: (status) => status < 500,
        }
      );

      await fetchOrders();
      toggleModal("updateStatus", false);
      showNotification("Order status updated successfully!", "success");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update status",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createNewOrder = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const totalAmount = Number(newOrder.total_amount);
      if (isNaN(totalAmount)) {
        showNotification("Please enter a valid amount", "error");
        return;
      }

      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/orders`,
        { ...newOrder, total_amount: totalAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_API_SECRET_KEY, // Include API key
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status >= 400) {
        throw new Error(response.data?.message || "Failed to create order");
      }

      await fetchOrders();
      resetNewOrderForm();
      toggleModal("create", false);
      showNotification("Order created successfully!", "success");
    } catch (err) {
      console.error("Order creation error:", err);
      showNotification(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Functions
  const showNotification = (message, type) => {
    setState((prev) => ({ ...prev, error: type === "error" ? message : null }));
    setTimeout(() => setState((prev) => ({ ...prev, error: null })), 5000);
  };

  const toggleModal = (modalName, isOpen, order = null) => {
    setState((prev) => ({
      ...prev,
      modals: { ...prev.modals, [modalName]: isOpen },
      selectedOrder: order,
      selectedStatus: order?.status || "",
    }));
  };

  const resetNewOrderForm = () => {
    setState((prev) => ({
      ...prev,
      newOrder: {
        user_id: "",
        total_amount: "",
        delivery_address: "",
        payment_method: "cash",
        notes: "",
      },
    }));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = isMobile
      ? { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
      : {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleFilterChange = (name, value) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [name]: value },
      pagination: {
        ...prev.pagination,
        currentPage: 1,
      },
    }));
  };

  const handleNewOrderChange = (name, value) => {
    setState((prev) => ({
      ...prev,
      newOrder: { ...prev.newOrder, [name]: value },
    }));
  };

  const handleStatusChange = (value) => {
    setState((prev) => ({ ...prev, selectedStatus: value }));
  };

  // UI Components
  const StatusBadge = ({ status }) => {
    return (
      <span
        className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-black text-white border"
        style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
      >
        {ORDER_STATUSES.find((s) => s.value === status)?.label || status}
      </span>
    );
  };

  const StatusDropdownButton = ({ orderId, currentStatus }) => {
    return (
      <button
        onClick={() => {
          toggleModal("updateStatus", true, {
            order_id: orderId,
            status: currentStatus,
          });
        }}
        className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm rounded-md bg-black border border-white/30 hover:bg-black/80 transition"
      >
        <span className="hidden sm:inline">Update</span>
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    );
  };

  // Enhanced Order Details Modal
  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with blur */}
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          onClick={() => toggleModal("details", false)}
        ></div>

        {/* Modal content */}
        <div className="relative w-full max-w-2xl bg-black border border-white/30 rounded-lg shadow-xl z-10 mx-2 sm:mx-0">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Order #{selectedOrder.order_id}
                </h3>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <button
                onClick={() => toggleModal("details", false)}
                className="text-white/70 hover:text-white transition"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-white/70 text-xs sm:text-sm">
                    Customer ID
                  </p>
                  <p className="text-white font-medium text-sm sm:text-base">
                    {selectedOrder.user_id}
                  </p>
                </div>

                <div>
                  <p className="text-white/70 text-xs sm:text-sm">Order Date</p>
                  <p className="text-white font-medium text-sm sm:text-base">
                    {formatDateTime(selectedOrder.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-white/70 text-xs sm:text-sm">
                    Delivery Address
                  </p>
                  <p className="text-white font-medium text-sm sm:text-base">
                    {selectedOrder.delivery_address}
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-white/70 text-xs sm:text-sm">
                    Total Amount
                  </p>
                  <p className="text-white font-medium text-sm sm:text-base">
                    ₹{selectedOrder.total_amount}
                  </p>
                </div>

                <div>
                  <p className="text-white/70 text-xs sm:text-sm">
                    Payment Method
                  </p>
                  <p className="text-white font-medium text-sm sm:text-base capitalize">
                    {selectedOrder.payment_method.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-white/70 text-xs sm:text-sm">Status</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="mt-4 sm:mt-6">
                <p className="text-white/70 text-xs sm:text-sm">Order Notes</p>
                <p className="text-white font-medium text-sm sm:text-base">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4 sm:mt-6">
              <button
                onClick={() => toggleModal("details", false)}
                className="px-3 py-1 sm:px-4 sm:py-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update Status Modal
  const UpdateStatusModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with blur */}
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          onClick={() => toggleModal("updateStatus", false)}
        ></div>

        {/* Modal content */}
        <div className="relative w-full max-w-md bg-black border border-white/30 rounded-lg shadow-xl z-10 mx-2 sm:mx-0">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Update Order Status
              </h3>
              <button
                onClick={() => toggleModal("updateStatus", false)}
                className="text-white/70 hover:text-white transition"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              <div>
                <p className="text-white/70 mb-1 text-sm sm:text-base">
                  Current Status
                </p>
                <StatusBadge status={selectedOrder.status} />
              </div>

              <div>
                <label className="block text-white/70 mb-2 text-sm sm:text-base">
                  Select New Status
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ORDER_STATUSES.filter(
                    (s) => s.value !== selectedOrder.status
                  ).map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      className={`p-2 sm:p-3 text-left rounded-md border transition text-sm sm:text-base ${
                        selectedStatus === status.value
                          ? "border-white bg-white/10 text-white"
                          : "border-white/30 hover:border-white/50 hover:bg-white/5 text-white/80"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 sm:pt-4 flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => toggleModal("updateStatus", false)}
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-white/30 text-white rounded-md hover:bg-white/10 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    updateOrderStatus(selectedOrder.order_id, selectedStatus)
                  }
                  disabled={!selectedStatus || isLoading}
                  className="px-3 py-1 sm:px-4 sm:py-2 text-white bg-black rounded-md hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateOrderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm"
        onClick={() => toggleModal("create", false)}
      ></div>

      {/* Modal content */}
      <div className="relative w-full max-w-md bg-black border border-white/30 rounded-lg shadow-xl z-10 mx-2 sm:mx-0">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Create New Order
            </h3>
            <button
              onClick={() => toggleModal("create", false)}
              className="text-white/70 hover:text-white transition"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-white/70 mb-1 sm:mb-2 text-sm sm:text-base">
                Customer ID
              </label>
              <input
                type="text"
                className="w-full p-2 sm:p-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:border-white text-white text-sm sm:text-base"
                value={newOrder.user_id}
                onChange={(e) =>
                  handleNewOrderChange("user_id", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1 sm:mb-2 text-sm sm:text-base">
                Total Amount (₹)
              </label>
              <input
                type="number"
                className="w-full p-2 sm:p-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:border-white text-white text-sm sm:text-base"
                value={newOrder.total_amount}
                onChange={(e) =>
                  handleNewOrderChange("total_amount", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1 sm:mb-2 text-sm sm:text-base">
                Delivery Address
              </label>
              <textarea
                className="w-full p-2 sm:p-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:border-white text-white text-sm sm:text-base"
                value={newOrder.delivery_address}
                onChange={(e) =>
                  handleNewOrderChange("delivery_address", e.target.value)
                }
                rows={3}
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1 sm:mb-2 text-sm sm:text-base">
                Payment Method
              </label>
              <select
                className="w-full p-2 sm:p-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:border-white text-white text-sm sm:text-base"
                value={newOrder.payment_method}
                onChange={(e) =>
                  handleNewOrderChange("payment_method", e.target.value)
                }
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-white/70 mb-1 sm:mb-2 text-sm sm:text-base">
                Notes
              </label>
              <textarea
                className="w-full p-2 sm:p-3 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:border-white text-white text-sm sm:text-base"
                value={newOrder.notes}
                onChange={(e) => handleNewOrderChange("notes", e.target.value)}
                rows={2}
              />
            </div>

            <div className="pt-2 sm:pt-4">
              <button
                onClick={createNewOrder}
                disabled={isLoading}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white text-black rounded-md hover:bg-white/90 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Order Card
  const MobileOrderCard = ({ order }) => (
    <div className="p-4 border border-white/30 rounded-lg mb-3 bg-black/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-white">#{order.order_id}</h3>
          <p className="text-xs text-white/70">Customer: {order.user_id}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-white/70">Amount</p>
          <p className="text-white">₹{order.total_amount}</p>
        </div>
        <div>
          <p className="text-white/70">Date</p>
          <p className="text-white">{formatDateTime(order.created_at)}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-between">
        <button
          onClick={() => toggleModal("details", true, order)}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-white/30 rounded hover:bg-white/10"
        >
          <FiInfo size={14} />
          Details
        </button>
        <StatusDropdownButton
          orderId={order.order_id}
          currentStatus={order.status}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white font-inter">
      {initialLoad ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Food Orders Management
                </h2>
                <p className="text-white/70 text-sm sm:text-base">
                  Manage food orders and delivery status.
                </p>
              </div>
              <button
                onClick={() => toggleModal("create", true)}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white text-black rounded-md hover:bg-white/90 transition text-sm sm:text-base w-full md:w-auto justify-center"
              >
                <FiPlus size={16} /> Create Order
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 p-3 bg-black/50 border border-white/30 rounded-md text-white text-sm sm:text-base">
                {error}
              </div>
            )}

            {/* Filters Section */}
            <div className="mt-4 sm:mt-6 border border-white/30 rounded-lg">
              <div className="p-3 sm:p-4 bg-black border-b border-white/30 flex flex-wrap gap-3 items-center">
                <div className="relative flex-grow w-full">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
                  <input
                    type="text"
                    placeholder={
                      isMobile
                        ? "Search orders..."
                        : "Search by Order ID, Customer, Address, Notes, etc..."
                    }
                    className="pl-9 pr-7 w-full p-2 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:border-white text-white text-sm sm:text-base"
                    value={filters.search}
                    onChange={(e) => {
                      handleFilterChange("search", e.target.value);
                    }}
                  />
                  {isLoading && filters.search && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                  {filters.search && !isLoading && (
                    <button
                      onClick={() => handleFilterChange("search", "")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <select
                  className="flex-grow w-full p-2 bg-black/50 border border-white/30 rounded-md focus:outline-none focus:border-white text-white text-sm sm:text-base"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchOrders}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-white/30 text-white rounded-md hover:bg-black/70 transition disabled:opacity-50 text-sm sm:text-base w-full md:w-auto justify-center"
                >
                  <FiRefreshCw
                    className={`${isLoading ? "animate-spin" : ""} w-4 h-4`}
                  />
                  {isMobile ? "Refresh" : "Refresh Orders"}
                </button>
              </div>

              {/* Orders Table */}
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/30"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-white/70 border text-sm sm:text-base">
                  {filters.search.trim()
                    ? "No orders match your search criteria"
                    : "No food orders found"}
                </div>
              ) : isMobile ? (
                // Mobile view - cards
                <div className="p-3">
                  <div className="space-y-3">
                    {paginatedOrders.map((order) => (
                      <MobileOrderCard key={order.order_id} order={order} />
                    ))}
                  </div>

                  {/* Pagination Controls for mobile */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-white/30 rounded-md bg-black/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition text-sm"
                      >
                        <FiChevronLeft />
                      </button>
                      <span className="text-sm text-white/70">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-white/30 rounded-md bg-black/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition text-sm"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Desktop view - table
                <div className="h-[calc(100dvh-450px)] sm:h-[calc(100dvh-465px)] flex flex-col justify-between">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/30">
                      <thead className="bg-black">
                        <tr>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider border-b border-white/30">
                            Order ID
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider border-b border-white/30">
                            Customer
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider border-b border-white/30">
                            Amount
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider border-b border-white/30">
                            Status
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider border-b border-white/30">
                            Date
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider border-b border-white/30">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-black divide-y divide-white/30">
                        {paginatedOrders.map((order) => (
                          <tr
                            key={order.order_id}
                            className="hover:bg-black/50"
                          >
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-white border-b border-white/30">
                              #{order.order_id}
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-white/70 border-b border-white/30">
                              {order.user_id}
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-white/70 border-b border-white/30">
                              ₹{order.total_amount}
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm border-b border-white/30">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-white/70 border-b border-white/30">
                              {formatDateTime(order.created_at)}
                            </td>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-white/70 border-b border-white/30">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    toggleModal("details", true, order)
                                  }
                                  className="text-white hover:text-white/70 transition border rounded-md p-1 border-[rgba(255,255,255,0.3)]"
                                  title="View Details"
                                >
                                  <FiEdit size={16} />
                                </button>
                                <StatusDropdownButton
                                  orderId={order.order_id}
                                  currentStatus={order.status}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-black border-t border-white/30">
                      <div className="text-sm text-white/70 mb-2 sm:mb-0">
                        Showing page {currentPage} of {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-white/30 rounded-md bg-black/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition"
                        >
                          <FiChevronLeft />
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                              page = i + 1;
                            } else if (currentPage <= 3) {
                              page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              page = totalPages - 4 + i;
                            } else {
                              page = currentPage - 2 + i;
                            }
                            return (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1 border rounded-md ${
                                  currentPage === page
                                    ? "bg-white border-white text-black"
                                    : "border-white/30 bg-black/50 text-white hover:bg-black/70"
                                } transition`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <span className="px-3 py-1 text-white/70">...</span>
                        )}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <button
                            onClick={() => goToPage(totalPages)}
                            className={`px-3 py-1 border rounded-md ${
                              currentPage === totalPages
                                ? "bg-white border-white text-black"
                                : "border-white/30 bg-black/50 text-white hover:bg-black/70"
                            } transition`}
                          >
                            {totalPages}
                          </button>
                        )}
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-white/30 rounded-md bg-black/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition"
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
          {modals.details && <OrderDetailsModal />}
          {modals.create && <CreateOrderModal />}
          {modals.updateStatus && <UpdateStatusModal />}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
