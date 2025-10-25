import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, Upload, Trash2, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export default function KnowledgeBase() {
  const { data: documents, isLoading } = trpc.knowledge.list.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => {
      utils.knowledge.list.invalidate();
      toast.success("Document deleted successfully");
    },
    onError: error => {
      toast.error(error.message || "Failed to delete document");
    },
  });

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
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground mt-2">
              Upload reference documents to enhance AI analysis accuracy
            </p>
          </div>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">What is Knowledge Base?</h3>
                <p className="text-sm text-blue-700">
                  Upload your company policies, standard contract templates, or legal guidelines. The AI will use these
                  documents as reference when analyzing your contracts, providing more accurate and context-aware insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              {documents?.length || 0} document{documents?.length !== 1 ? "s" : ""} in your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="skeleton h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.filename}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} •{" "}
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-2">{doc.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc.id, doc.filename)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload reference documents to improve AI analysis accuracy
                </p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Add First Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium">Upload Company Policies</h4>
                <p className="text-sm text-muted-foreground">
                  Add your company's internal policies and guidelines for more relevant analysis
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium">Include Standard Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your standard contract templates to help AI identify deviations
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium">Add Legal References</h4>
                <p className="text-sm text-muted-foreground">
                  Include relevant legal documents and regulatory guidelines for your industry
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

