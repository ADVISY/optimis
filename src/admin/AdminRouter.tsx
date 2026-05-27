import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminVerifyOtp from "./pages/AdminVerifyOtp";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClients from "./pages/AdminClients";
import AdminOrders from "./pages/AdminOrders";
import AdminInvoices from "./pages/AdminInvoices";
import AdminSettings from "./pages/AdminSettings";
import AdminProfile from "./pages/AdminProfile";
import AdminProducts from "./pages/AdminProducts";
import AdminLeads from "./pages/AdminLeads";
import AdminCanaux from "./pages/AdminCanaux";
import AdminDistributions from "./pages/AdminDistributions";

export default function AdminRouter() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="verify" element={<AdminVerifyOtp />} />
        <Route index element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="leads" element={<ProtectedAdminRoute><AdminLeads /></ProtectedAdminRoute>} />
        <Route path="canaux" element={<ProtectedAdminRoute><AdminCanaux /></ProtectedAdminRoute>} />
        <Route path="distributions" element={<ProtectedAdminRoute><AdminDistributions /></ProtectedAdminRoute>} />
        <Route path="clients" element={<ProtectedAdminRoute><AdminClients /></ProtectedAdminRoute>} />
        <Route path="commandes" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
        <Route path="factures" element={<ProtectedAdminRoute><AdminInvoices /></ProtectedAdminRoute>} />
        <Route path="produits" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
        <Route path="parametres" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
        <Route path="profil" element={<ProtectedAdminRoute><AdminProfile /></ProtectedAdminRoute>} />
      </Routes>
    </AdminAuthProvider>
  );
}
