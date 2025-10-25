import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

/**
 * All content in this page are only for example, delete if unneeded
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  
  // Redirect authenticated users to dashboard
  if (isAuthenticated && user) {
    window.location.href = "/dashboard";
    return null;
  }

  // If theme is switchable in App.tsx, we can implement theme toggling like this:
  // const { theme, toggleTheme } = useTheme();

  // Use APP_LOGO (as image src) and APP_TITLE if needed

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto p-8 text-center space-y-8">
        <div className="space-y-4">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-20 w-20 mx-auto" />
          <h1 className="text-4xl font-bold">{APP_TITLE}</h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Contract Analysis for Saudi Arabian SMBs
          </p>
        </div>
        <div className="space-y-4">
          <Button size="lg" className="w-full" onClick={() => window.location.href = getLoginUrl()}>
            Get Started
          </Button>
          <p className="text-sm text-muted-foreground">
            Analyze contracts 10x faster with AI-powered risk assessment and compliance checks
          </p>
        </div>
      </div>
    </div>
  );
}
