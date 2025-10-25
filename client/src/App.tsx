import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useDocumentDirection } from "./hooks/useDocumentDirection";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import Upload from "./pages/Upload";
import ContractDetail from "./pages/ContractDetail";
import KnowledgeBase from "./pages/KnowledgeBase";
import Subscription from "./pages/Subscription";
import Support from "./pages/Support";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminTickets from "./pages/admin/AdminTickets";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import { RTLDemo } from "./components/RTLDemo";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/contracts"} component={Contracts} />
      <Route path={"/contracts/:id"} component={ContractDetail} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/knowledge-base"} component={KnowledgeBase} />
      <Route path={"/subscription"} component={Subscription} />
      <Route path={"/support"} component={Support} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/users/:id"} component={AdminUserDetail} />
      <Route path={"/admin/tickets"} component={AdminTickets} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/rtl-demo"} component={RTLDemo} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize document direction based on i18next language
  useDocumentDirection();
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

