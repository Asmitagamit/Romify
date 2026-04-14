
// // import React from "react";
// import React, { useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";


// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import OwnerDashboard from "./pages/OwnerDashboard";
// import ClientDashboard from "./pages/ClientDashboard";
// import SignUp from "./pages/SignUp";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import PgDetails from "./pages/PgDetails";
// import ReceiptView from "./pages/ReceiptView";
// import OwnerNavbar from "./components/UserNavbar";
// import HelpDashboard from "./components/Help";


// export default function App() {

//   const [search, setSearch] = useState("");
//   return (
//     <>
//       {/* <Toaster position="top-center" /> */}
//       {/* Toast notifications for Luxe feedback */}
//       <Toaster 
//         position="top-center" 
//         toastOptions={{
//           duration: 3000,
//           style: { background: '#333', color: '#fff' }
//         }} 
//       />
//       <Routes>

//         <Route path="/" element={<Home search={search} setSearch={setSearch} />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/owner-dashboard" element={<OwnerDashboard />} />
//         <Route path="/client-dashboard" element={<ClientDashboard />} />
//         <Route path="/signup" element={<SignUp />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:token" element={<ResetPassword />} />
//         <Route path="/pg/:id" element={<PgDetails />} />
//         <Route path="/receipt/:id" element={<ReceiptView />} />
//         <Route path="/help" element={<HelpDashboard />} />
//       </Routes>
//     </>
//   );
// }


import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // 🟢 Added Navigate
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PgDetails from "./pages/PgDetails";
import ReceiptView from "./pages/ReceiptView";
import HelpDashboard from "./components/Help";

// --- 🔐 PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Luxe Toast Notifications */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: { 
            background: '#132B6B', // Roomify Navy
            color: '#E2C18D',      // Roomify Gold
            border: '1px solid #B87333' // Roomify Copper
          }
        }} 
      />

      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home search={search} setSearch={setSearch} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/pg/:id" element={<PgDetails />} />
        <Route path="/help" element={<HelpDashboard />} />

        {/* --- 🔐 Protected Owner Routes --- */}
        <Route 
          path="/owner-dashboard" 
          element={
            <ProtectedRoute allowedRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- 🔐 Protected Client Routes --- */}
        <Route 
          path="/client-dashboard" 
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- Protected Shared Routes --- */}
        <Route 
          path="/receipt/:id" 
          element={
            <ProtectedRoute>
              <ReceiptView />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}