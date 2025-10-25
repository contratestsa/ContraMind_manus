import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, User as UserIcon, FileText, CreditCard, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation, Link } from "wouter";
import { useEffect } from "react";

export default function AdminUserDetail() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || "0");

  const { data, isLoading } = trpc.admin.getUser.useQuery({ id: userId });

  // Redirect non-admin users
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, currentUser, setLocation]);

  if (!isAuthenticated || currentUser?.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">User not found</h3>
          <Link href="/admin/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { user, subscription, contracts } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{user.name || "Unnamed User"}</h1>
            <p className="text-muted-foreground mt-1">{user.email || "No email"}</p>
          </div>
          <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-sm">
            {user.role === "admin" && <Shield className="mr-1 h-3 w-3" />}
            {user.role}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Account details and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium mt-1">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open ID</p>
                    <p className="font-medium mt-1 truncate">{user.openId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Login Method</p>
                    <Badge variant="outline" className="mt-1">
                      {user.loginMethod || "Unknown"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Created</p>
                    <p className="font-medium mt-1">{new Date(user.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Sign In</p>
                    <p className="font-medium mt-1">{new Date(user.lastSignedIn).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium mt-1">{new Date(user.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </CardTitle>
                <CardDescription>Current subscription and billing</CardDescription>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="font-medium mt-1 capitalize">{subscription.tier.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={subscription.status === "active" ? "default" : "secondary"} className="mt-1">
                          {subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Billing Cycle</p>
                        <p className="font-medium mt-1 capitalize">{subscription.billingCycle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Billing</p>
                        <p className="font-medium mt-1">
                          {subscription.currentPeriodEnd
                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active subscription</p>
                )}
              </CardContent>
            </Card>

            {/* Contracts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Contracts
                </CardTitle>
                <CardDescription>Latest uploaded contracts</CardDescription>
              </CardHeader>
              <CardContent>
                {contracts && contracts.length > 0 ? (
                  <div className="space-y-3">
                    {contracts.map(contract => (
                      <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{contract.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contract.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{contract.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No contracts uploaded</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contracts</p>
                  <p className="text-2xl font-bold mt-1">{contracts?.length || 0}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Account Age</p>
                  <p className="text-2xl font-bold mt-1">
                    {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  Suspend Account
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Reset Password
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

