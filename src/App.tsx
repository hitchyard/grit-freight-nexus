import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FreightFutures from "./pages/FreightFutures";
import Dashboard from "./pages/Dashboard";
import ContractPage from "./pages/ContractPage";
import PricingPage from "./pages/PricingPage";
import BrokerDashboard from "./pages/BrokerDashboard";
import TruckerDashboard from "./pages/TruckerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ApplyPage from "./pages/ApplyPage";
import GetInvitedPage from "./pages/GetInvitedPage";
import LearnMorePage from "./pages/LearnMorePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/get-invited" element={<GetInvitedPage />} />
          <Route path="/learn-more" element={<LearnMorePage />} />
          <Route path="/freight-futures" element={<FreightFutures />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contract/:id" element={<ContractPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/broker" element={<BrokerDashboard />} />
          <Route path="/trucker" element={<TruckerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
