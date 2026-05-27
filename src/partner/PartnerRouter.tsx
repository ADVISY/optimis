import { Routes, Route } from "react-router-dom";
import { PartnerAuthProvider } from "./hooks/usePartnerAuth";
import { ProtectedPartnerRoute } from "./components/ProtectedPartnerRoute";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerLeads from "./pages/PartnerLeads";

export default function PartnerRouter() {
  return (
    <PartnerAuthProvider>
      <Routes>
        <Route path="login" element={<PartnerLogin />} />
        <Route index element={<ProtectedPartnerRoute><PartnerDashboard /></ProtectedPartnerRoute>} />
        <Route path="leads" element={<ProtectedPartnerRoute><PartnerLeads /></ProtectedPartnerRoute>} />
      </Routes>
    </PartnerAuthProvider>
  );
}
