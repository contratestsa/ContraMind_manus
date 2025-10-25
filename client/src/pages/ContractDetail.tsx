import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { RISK_LEVELS, COMPLIANCE_STATUS } from "@/const";
import {
  FileText,
  Send,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
import { useParams, Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { MarkdownMessage } from "@/components/MarkdownMessage";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const contractId = parseInt(id || "0");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Array<{id: string, role: string, content: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: contract, isLoading: contractLoading } = trpc.contracts.getById.useQuery({ id: contractId });
  const { data: messages, isLoading: messagesLoading } = trpc.ai.getMessages.useQuery({ contractId });

  const utils = trpc.useUtils();
  
  const sendMessageMutation = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsSending(false);
      setOptimisticMessages([]);
      // Invalidate messages to refetch
      utils.ai.getMessages.invalidate({ contractId });
    },
    onError: error => {
      toast.error(error.message || "Failed to send message");
      setIsSending(false);
      setOptimisticMessages([]);
    },
  });

  const feedbackMutation = trpc.ai.submitFeedback.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticMessages]);

  const handleSendMessage = async (promptText?: string) => {
    const messageToSend = promptText || message;
    if (!messageToSend.trim() || isSending) return;

    setIsSending(true);
    setMessage("");
    
    // Add optimistic user message
    setOptimisticMessages([{
      id: 'temp-user',
      role: 'user',
      content: messageToSend
    }, {
      id: 'temp-assistant',
      role: 'assistant',
      content: 'processing'
    }]);
    
    await sendMessageMutation.mutateAsync({
      contractId,
      content: messageToSend,
    });
  };

  const handleFeedback = (messageId: number, rating: "thumbs_up" | "thumbs_down") => {
    feedbackMutation.mutate({ messageId, rating });
  };

  const getRiskBadge = (risk: string | null) => {
    if (!risk) return null;
    const riskConfig = RISK_LEVELS[risk.toUpperCase() as keyof typeof RISK_LEVELS];
    return (
      <Badge variant="outline" className={riskConfig.color}>
        {riskConfig.label}
      </Badge>
    );
  };

  const getComplianceBadge = (compliance: string | null) => {
    if (!compliance) return null;
    const complianceConfig = COMPLIANCE_STATUS[compliance.toUpperCase() as keyof typeof COMPLIANCE_STATUS];
    return (
      <Badge variant="outline" className={complianceConfig.color}>
        {complianceConfig.label}
      </Badge>
    );
  };

  const preBuiltPrompts = [
    "What are the main risks in this contract?",
    "Is this contract Sharia compliant?",
    "What are my obligations?",
    "Explain the payment terms",
    "What are the termination conditions?",
  ];

  if (contractLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Contract not found</h3>
          <Link href="/contracts">
            <Button>Back to Contracts</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link href="/contracts" className="text-sm text-muted-foreground hover:underline">
                Contracts
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm font-medium">{contract.filename}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{contract.filename}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Uploaded {new Date(contract.uploadedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{(contract.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              {contract.detectedLanguage && (
                <>
                  <span>•</span>
                  <span>{contract.detectedLanguage.toUpperCase()}</span>
                </>
              )}
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Analysis Status */}
        {contract.status === "processing" && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Analysis in progress</p>
                  <p className="text-sm text-blue-700">This may take a few moments...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {contract.status === "error" && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Analysis failed</p>
                  <p className="text-sm text-red-700">{contract.errorMessage || "An error occurred"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analysis Results */}
            {contract.status === "analyzed" && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI-powered contract analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Risk Assessment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Assessment</span>
                      {getRiskBadge(contract.riskScore)}
                    </div>
                  </div>

                  <Separator />

                  {/* Compliance */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Sharia Compliance</span>
                      {getComplianceBadge(contract.shariaCompliance)}
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">KSA Regulatory Compliance</span>
                      {getComplianceBadge(contract.ksaCompliance)}
                    </div>
                  </div>

                  <Separator />

                  {/* Analyzed Date */}
                  {contract.analyzedAt && (
                    <div className="text-sm text-muted-foreground">
                      Analyzed on {new Date(contract.analyzedAt).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Chat */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Assistant
                </CardTitle>
                <CardDescription>Ask questions about this contract</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pre-built Prompts */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick Questions</p>
                  <div className="flex flex-wrap gap-2">
                    {preBuiltPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(prompt)}
                        disabled={isSending || contract.status !== "analyzed"}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Chat Messages */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                      {messages && messages.length > 0 && messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                          {msg.role === "assistant" && (
                            <div className="flex items-start gap-3 max-w-[80%]">
                              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                                <Sparkles className="h-4 w-4 text-primary" />
                              </div>
                              <div className="space-y-2">
                                <div className="bg-accent p-3 rounded-lg">
                                  <MarkdownMessage content={msg.content} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(msg.id, "thumbs_up")}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(msg.id, "thumbs_down")}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          {msg.role === "user" && (
                            <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {optimisticMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                          {msg.role === "assistant" && msg.content === "processing" ? (
                            <div className="flex items-start gap-3 max-w-[80%]">
                              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                                <Sparkles className="h-4 w-4 text-primary" />
                              </div>
                              <div className="bg-accent p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                  <span className="text-sm text-muted-foreground">ContraMind AI is analyzing...</span>
                                </div>
                              </div>
                            </div>
                          ) : msg.role === "user" ? (
                            <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                      
                      {!messages || messages.length === 0 && optimisticMessages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No messages yet. Ask a question to get started!</p>
                        </div>
                      ) : null}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about this contract..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={isSending || contract.status !== "analyzed"}
                  />
                  <Button onClick={() => handleSendMessage()} disabled={isSending || !message.trim()}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1">{contract.status}</Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">File Type</p>
                  <p className="text-sm font-medium mt-1">{contract.mimeType}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="text-sm font-medium mt-1">{(contract.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export Analysis (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export Analysis (Word)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

