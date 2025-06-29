// admin-dashboard-vite/src/pages/DashboardPage.jsx
import React from "react";

const DashboardPage = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md font-inter">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Dashboard Overview
      </h2>
      <p className="text-gray-600">
        This is where you'll see key metrics, recent orders, and other important
        information at a glance.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow-md border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">1234</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-md border border-green-200">
          <h3 className="text-lg font-semibold text-green-800">
            New Customers
          </h3>
          <p className="text-3xl font-bold text-green-600">56</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-md border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800">
            Pending Orders
          </h3>
          <p className="text-3xl font-bold text-yellow-600">15</p>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <ul className="space-y-3">
          <li className="bg-gray-50 p-3 rounded-md border border-gray-200">
            New order #001 placed by John Doe.
          </li>
          <li className="bg-gray-50 p-3 rounded-md border border-gray-200">
            Customer Jane Smith's wallet credited.
          </li>
          <li className="bg-gray-50 p-3 rounded-md border border-gray-200">
            Referral bonus issued for user Peter Jones.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
