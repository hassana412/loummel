import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import InscriptionVendeur from "./pages/InscriptionVendeur";
import DevenirPartenaire from "./pages/DevenirPartenaire";

// Boutique pages
import BoutiqueLayout from "./pages/boutique/BoutiqueLayout";
import BoutiqueProduits from "./pages/boutique/BoutiqueProduits";
import BoutiqueServices from "./pages/boutique/BoutiqueServices";
import BoutiqueContact from "./pages/boutique/BoutiqueContact";

// Dashboard pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PartenaireDashboard from "./pages/dashboard/PartenaireDashboard";
import BoutiqueDashboard from "./pages/dashboard/BoutiqueDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/inscription-vendeur" element={<InscriptionVendeur />} />
            <Route path="/devenir-partenaire" element={<DevenirPartenaire />} />
            
            {/* Boutique public pages */}
            <Route path="/boutique/:slug" element={<BoutiqueLayout />}>
              <Route index element={<BoutiqueProduits />} />
              <Route path="services" element={<BoutiqueServices />} />
              <Route path="contact" element={<BoutiqueContact />} />
            </Route>

            {/* Protected: Super Admin Dashboard */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected: Partner Dashboard */}
            <Route
              path="/dashboard/partenaire"
              element={
                <ProtectedRoute allowedRoles={["partner"]}>
                  <PartenaireDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected: Shop Owner Dashboard */}
            <Route
              path="/dashboard/boutique"
              element={
                <ProtectedRoute allowedRoles={["shop_owner"]}>
                  <BoutiqueDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
