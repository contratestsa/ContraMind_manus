import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, MessageSquare, AlertTriangle, TrendingUp, Upload, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { RISK_LEVELS } from "@/const";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: contracts, isLoading: contractsLoading } = trpc.contracts.list.useQuery({ limit: 5, offset: 0 });

  const stats = [
    {
      title: "Contracts Analyzed",
      value: contracts?.length || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "AI Messages",
      value: "0",
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Risk Alerts",
      value: contracts?.filter(c => c.riskScore === "high").length || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Compliance Score",
      value: "95%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const getRiskBadge = (risk: string | null) => {
    if (!risk) return null;
    const riskConfig = RISK_LEVELS[risk.toUpperCase() as keyof typeof RISK_LEVELS];
    return (
      <Badge variant="outline" className={riskConfig.color}>
        {riskConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      uploading: { label: "Uploading", variant: "secondary" },
      processing: { label: "Processing", variant: "default" },
      analyzed: { label: "Analyzed", variant: "outline" },
      error: { label: "Error", variant: "destructive" },
    };
    const config = statusConfig[status] || statusConfig.processing;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name || "User"}! Here's an overview of your contract analysis.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with contract analysis</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link href="/upload">
              <a className="block">
                <Button className="w-full h-auto py-6 flex-col gap-2" size="lg">
                  <Upload className="h-6 w-6" />
                  <span>Upload New Contract</span>
                </Button>
              </a>
            </Link>
            <Link href="/contracts">
              <a className="block">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2" size="lg">
                  <FileText className="h-6 w-6" />
                  <span>View All Contracts</span>
                </Button>
              </a>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Contracts</CardTitle>
              <CardDescription>Your latest contract analyses</CardDescription>
            </div>
            <Link href="/contracts">
              <a>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </Link>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="skeleton h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : contracts && contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.map(contract => (
                  <Link key={contract.id} href={`/contracts/${contract.id}`}>
                    <a className="block p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{contract.filename}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(contract.uploadedAt).toLocaleDateString()} •{" "}
                              {(contract.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(contract.status)}
                          {getRiskBadge(contract.riskScore)}
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No contracts yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first contract to get started with AI-powered analysis</p>
                <Link href="/upload">
                  <a>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Contract
                    </Button>
                  </a>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold capitalize">{user?.subscriptionTier?.replace("_", " ") || "Free Trial"}</p>
                {user?.subscriptionStatus === "trial" && user?.trialEndsAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Trial ends {new Date(user.trialEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Link href="/subscription">
                <a>
                  <Button>Manage Subscription</Button>
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

