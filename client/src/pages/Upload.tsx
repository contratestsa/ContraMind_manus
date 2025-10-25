import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FILE_UPLOAD } from "@/const";
import { trpc } from "@/lib/trpc";
import { Upload as UploadIcon, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Upload() {
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const createContractMutation = trpc.contracts.create.useMutation({
    onSuccess: data => {
      setUploadStatus("success");
      toast.success("Contract uploaded successfully!");
      setTimeout(() => {
        setLocation(`/contracts/${data.id}`);
      }, 1500);
    },
    onError: error => {
      setUploadStatus("error");
      toast.error(error.message || "Upload failed");
      setUploading(false);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      toast.error(`File size exceeds ${FILE_UPLOAD.MAX_SIZE_MB}MB limit`);
      return;
    }

    // Validate file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!FILE_UPLOAD.ACCEPTED_TYPES.includes(fileExtension as any)) {
      toast.error("Invalid file type. Please upload PDF or Word documents.");
      return;
    }

    setUploadedFile(file);
    setUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to storage
      const formData = new FormData();
      formData.append("file", file);

      // TODO: Replace with actual storage upload endpoint
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create contract record
      // In production, this would use the actual file URL from storage
      const fileKey = `contracts/${Date.now()}-${file.name}`;
      const fileUrl = `https://storage.example.com/${fileKey}`;

      await createContractMutation.mutateAsync({
        filename: file.name,
        fileKey,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setUploading(false);
    }
  }, [createContractMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const resetUpload = () => {
    setUploadedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadStatus("idle");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Contract</h1>
          <p className="text-muted-foreground mt-2">Upload a contract for AI-powered analysis</p>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Select Contract File</CardTitle>
            <CardDescription>
              Supported formats: PDF, DOC, DOCX (Max {FILE_UPLOAD.MAX_SIZE_MB}MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(uploadStatus === "idle" || uploadStatus === "error") ? (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                  transition-colors
                  ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                  ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <UploadIcon className="h-12 w-12 text-primary" />
                  </div>
                  {isDragActive ? (
                    <p className="text-lg font-medium">Drop the file here...</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Drag and drop your contract here</p>
                        <p className="text-sm text-muted-foreground">or</p>
                      </div>
                      <Button type="button" disabled={uploading}>
                        Browse Files
                      </Button>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX • Max {FILE_UPLOAD.MAX_SIZE_MB}MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                {uploadedFile && (
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-accent/50">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {uploadStatus === "success" && <CheckCircle className="h-6 w-6 text-green-600" />}
                    {(uploadStatus as string) === "error" && <XCircle className="h-6 w-6 text-red-600" />}
                    {uploadStatus === "uploading" && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
                  </div>
                )}

                {/* Progress Bar */}
                {uploadStatus === "uploading" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Success Message */}
                {uploadStatus === "success" && (
                  <div className="text-center space-y-4 py-6">
                    <div className="flex justify-center">
                      <div className="p-4 bg-green-50 rounded-full">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Upload Successful!</h3>
                      <p className="text-muted-foreground">Your contract is being analyzed...</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {((uploadStatus as string) === "error") && (
                  <div className="text-center space-y-4 py-6">
                    <div className="flex justify-center">
                      <div className="p-4 bg-red-50 rounded-full">
                        <XCircle className="h-12 w-12 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Upload Failed</h3>
                      <p className="text-muted-foreground">Please try again</p>
                    </div>
                    <Button onClick={resetUpload}>Try Again</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium">Text Extraction</h4>
                <p className="text-sm text-muted-foreground">We extract and analyze the contract text</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Google Gemini 2.5 Pro analyzes risks, compliance, and key terms
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium">Interactive Chat</h4>
                <p className="text-sm text-muted-foreground">Ask questions and get instant answers about your contract</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

