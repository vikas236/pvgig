// admin-dashboard-vite/src/App.jsx
import React, { useState, useEffect } from "react"; // Import useEffect
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import ReferralsPage from "./pages/ReferralsPage";
import "./index.css"; // Ensure your Tailwind CSS is imported

function App() {
  // Initialize isAuthenticated based on the presence of a token in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("adminToken")
  );

  // Function to handle successful login (passed to LoginPage)
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Function to handle logout (passed to Layout)
  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // Remove token from localStorage
    setIsAuthenticated(false);
  };

  // Optional: Re-check authentication status on mount (useful if token expires etc.)
  // For a simple admin dashboard, relying on initial check and logout is often enough.
  // More robust apps might validate the token with the backend on every page load.
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      // You could optionally send this token to your backend to verify it's still valid
      // before setting isAuthenticated to true, for a more secure setup.
      // For now, simply checking its presence is sufficient.
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Route for Login */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Protected Routes (requires authentication) */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />{" "}
          {/* Redirects / to /dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          {/* Add more protected routes here */}
        </Route>

        {/* Catch-all for undefined routes */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
