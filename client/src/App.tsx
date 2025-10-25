import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import Upload from "./pages/Upload";
import ContractDetail from "./pages/ContractDetail";
import KnowledgeBase from "./pages/KnowledgeBase";
import Subscription from "./pages/Subscription";
import Support from "./pages/Support";
import Home from "./pages/Home";

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
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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

