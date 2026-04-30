import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

// 🔐 Protected Route WITH ROLE CHECK
function ProtectedRoute({ children, allowedRole }) {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return (
      <Navigate
        to={role === "admin" ? "/admin-dashboard" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}

function App() {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate
                to={role === "admin" ? "/admin-dashboard" : "/dashboard"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            token ? (
              <Navigate
                to={role === "admin" ? "/admin-dashboard" : "/dashboard"}
                replace
              />
            ) : (
              <Signup />
            )
          }
        />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="member">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;