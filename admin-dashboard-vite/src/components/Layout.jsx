import React from "react";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";

const Layout = ({ onLogout }) => {
  const location = useLocation();

  // Redirect to customers if at root path
  if (location.pathname === "/") {
    return <Navigate to="/customers" replace />;
  }

  const navItems = [
    { path: "/customers", label: "Customers" },
    { path: "/orders", label: "Orders" },
  ];

  const renderNavItem = (item) => (
    <li key={item.path} className="mb-[13px]">
      <Link
        to={item.path}
        className={`block py-[12px] px-4 rounded-xl hover:bg-white hover:text-black transition-colors duration-200 ${
          location.pathname === item.path
            ? "border-[1px] border-transparent bg-white text-black"
            : "border-[1px] border-[rgba(255,255,255,0.3)]"
        }`}
      >
        {item.label}
      </Link>
    </li>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-black font-inter p-2 sm:p-[20px]">
      {/* Mobile Header */}
      <header className="lg:hidden flex justify-between items-center p-4 bg-black text-white border border-[rgba(255,255,255,0.3)] rounded-2xl mb-2">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h1 className="text-xl font-semibold">Anvi Admin</h1>
        </div>
        <button
          onClick={onLogout}
          className="py-1 px-3 rounded-xl hover:bg-white hover:text-black 
          transition duration-200 bg-black text-white font-semibold border border-[rgba(255,255,255,0.3)] flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="ml-1 hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className="hidden lg:flex lg:w-64 bg-black text-white shadow-lg flex-col py-4 pt-[35px] border border-[rgba(255,255,255,0.3)] rounded-3xl 
      lg:mr-[15px] h-[calc(100vh-40px)]"
      >
        <h2 className="text-4xl font-bold mb-[50px] text-center text-white">
          Anvi Admin
        </h2>
        <nav className="flex-grow px-4">
          <ul>{navItems.map(renderNavItem)}</ul>
        </nav>
        <div className="mt-auto flex flex-col items-center">
          <button
            onClick={onLogout}
            className="w-[calc(100%-30px)] text-left py-2 px-4 rounded-xl hover:bg-white hover:text-black 
            transition duration-200 bg-black text-white font-semibold border border-[rgba(255,255,255,0.3)] flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-[rgba(255,255,255,0.3)] z-10">
        <ul className="flex justify-around p-2">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1">
              <Link
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg text-xs sm:text-sm transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-white text-black"
                    : "text-white"
                }`}
              >
                {item.path === "/customers" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                )}
                <span className="mt-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col border border-[rgba(255,255,255,0.3)] rounded-3xl 
       min-h-[calc(100vh-120px)] lg:h-[calc(100vh-40px)] px-3 sm:px-[10px] pb-16 lg:pb-0"
      >
        <header className="hidden lg:flex shadow py-[22px] justify-between items-center">
          <h1 className="text-3xl font-semibold text-white pl-[26px] mt-[20px]">
            Admin Panel
          </h1>
          <div className="flex items-center">
            <span className="text-white mr-4">Welcome, Admin!</span>
            <button
              onClick={onLogout}
              className="py-1 px-3 rounded-xl hover:bg-white hover:text-black 
              transition duration-200 bg-black text-white font-semibold border border-[rgba(255,255,255,0.3)] flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
