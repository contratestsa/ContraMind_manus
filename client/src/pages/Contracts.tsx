import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { FileText, Search, Upload, MoreVertical, Eye, Trash2, Download } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { RISK_LEVELS, COMPLIANCE_STATUS } from "@/const";
import { toast } from "sonner";

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const utils = trpc.useUtils();

  const { data: contracts, isLoading } = trpc.contracts.list.useQuery({ limit: 100, offset: 0 });
  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => {
      utils.contracts.list.invalidate();
      toast.success("Contract deleted successfully");
    },
    onError: error => {
      toast.error(error.message || "Failed to delete contract");
    },
  });

  const filteredContracts = contracts?.filter(contract =>
    contract.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getComplianceBadge = (compliance: string | null, type: "sharia" | "ksa") => {
    if (!compliance) return null;
    const complianceConfig = COMPLIANCE_STATUS[compliance.toUpperCase() as keyof typeof COMPLIANCE_STATUS];
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{type === "sharia" ? "Sharia:" : "KSA:"}</span>
        <Badge variant="outline" className={complianceConfig.color}>
          {complianceConfig.label}
        </Badge>
      </div>
    );
  };

  const handleDelete = async (id: number, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
            <p className="text-muted-foreground mt-2">Manage and analyze your contracts</p>
          </div>
          <Link href="/upload">
            <a>
              <Button size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload Contract
              </Button>
            </a>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Contracts</CardTitle>
            <CardDescription>
              {filteredContracts?.length || 0} contract{filteredContracts?.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="skeleton h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContracts && filteredContracts.length > 0 ? (
              <div className="space-y-3">
                {filteredContracts.map(contract => (
                  <div key={contract.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <Link href={`/contracts/${contract.id}`}>
                              <a className="font-medium hover:underline truncate block">{contract.filename}</a>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              Uploaded {new Date(contract.uploadedAt).toLocaleDateString()} •{" "}
                              {(contract.fileSize / 1024 / 1024).toFixed(2)} MB
                              {contract.detectedLanguage && ` • ${contract.detectedLanguage.toUpperCase()}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusBadge(contract.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/contracts/${contract.id}`}>
                                    <a className="flex items-center w-full">
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </a>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(contract.id, contract.filename)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Analysis Results */}
                        {contract.status === "analyzed" && (
                          <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
                            {contract.riskScore && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Risk:</span>
                                {getRiskBadge(contract.riskScore)}
                              </div>
                            )}
                            {contract.shariaCompliance && getComplianceBadge(contract.shariaCompliance, "sharia")}
                            {contract.ksaCompliance && getComplianceBadge(contract.ksaCompliance, "ksa")}
                          </div>
                        )}

                        {/* Error Message */}
                        {contract.status === "error" && contract.errorMessage && (
                          <div className="text-sm text-destructive pt-2 border-t">{contract.errorMessage}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "No contracts found" : "No contracts yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Upload your first contract to get started with AI-powered analysis"}
                </p>
                {!searchQuery && (
                  <Link href="/upload">
                    <a>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Contract
                      </Button>
                    </a>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

