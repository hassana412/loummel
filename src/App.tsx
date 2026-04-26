import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Backoffice from "./pages/Backoffice";
import Recherche from "./pages/Recherche";
import InscriptionVendeur from "./pages/InscriptionVendeur";
import DevenirPartenaire from "./pages/DevenirPartenaire";
import CreerMaBoutique from "./pages/CreerMaBoutique";
import Panier from "./pages/Panier";
import Checkout from "./pages/Checkout";
import CommandeConfirmee from "./pages/CommandeConfirmee";
import MonProfil from "./pages/MonProfil";
import MesCommandes from "./pages/MesCommandes";

// Auth pages
import ClientAuth from "./pages/auth/ClientAuth";
import VendeurAuth from "./pages/auth/VendeurAuth";
import PartenaireAuth from "./pages/auth/PartenaireAuth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Boutique pages
import BoutiqueLayout from "./pages/boutique/BoutiqueLayout";
import BoutiqueProduits from "./pages/boutique/BoutiqueProduits";
import BoutiqueServices from "./pages/boutique/BoutiqueServices";
import BoutiqueContact from "./pages/boutique/BoutiqueContact";
import ProductDetail from "./pages/boutique/ProductDetail";

// Dashboard pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PartenaireDashboard from "./pages/dashboard/PartenaireDashboard";
import BoutiqueDashboard from "./pages/dashboard/BoutiqueDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/recherche" element={<Recherche />} />
            <Route path="/inscription-vendeur" element={<InscriptionVendeur />} />
            <Route path="/devenir-partenaire" element={<DevenirPartenaire />} />
            <Route path="/creer-ma-boutique" element={<CreerMaBoutique />} />
            <Route path="/panier" element={<Panier />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/commande-confirmee" element={<CommandeConfirmee />} />
            <Route path="/mon-profil" element={<MonProfil />} />
            <Route path="/mes-commandes" element={<MesCommandes />} />
            
            {/* Auth routes - 4 separate login pages */}
            <Route path="/connexion" element={<ClientAuth />} />
            <Route path="/auth/vendeur" element={<VendeurAuth />} />
            <Route path="/auth/partenaire" element={<PartenaireAuth />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
            <Route path="/backoffice" element={<Backoffice />} />
            
            {/* Legacy /auth redirects to client auth */}
            <Route path="/auth" element={<Navigate to="/connexion" replace />} />
            
            {/* Admin shortcut route */}
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            
            {/* Boutique public pages */}
            <Route path="/boutique/:slug" element={<BoutiqueLayout />}>
              <Route index element={<BoutiqueProduits />} />
              <Route path="services" element={<BoutiqueServices />} />
              <Route path="contact" element={<BoutiqueContact />} />
              <Route path="produit/:id" element={<ProductDetail />} />
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
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
