import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminVerifyOtp from "./pages/AdminVerifyOtp";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClients from "./pages/AdminClients";
import AdminOrders from "./pages/AdminOrders";
import AdminInvoices from "./pages/AdminInvoices";

export default function AdminRouter() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="verify" element={<AdminVerifyOtp />} />
        <Route index element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="clients" element={<ProtectedAdminRoute><AdminClients /></ProtectedAdminRoute>} />
        <Route path="commandes" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
        <Route path="factures" element={<ProtectedAdminRoute><AdminInvoices /></ProtectedAdminRoute>} />
      </Routes>
    </AdminAuthProvider>
  );
}
