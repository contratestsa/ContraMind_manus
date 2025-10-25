import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export interface ContractAnalysisResult {
  summary: string;
  riskScore: "low" | "medium" | "high";
  riskFactors: string[];
  shariaCompliance: "compliant" | "non_compliant" | "requires_review";
  shariaIssues: string[];
  ksaCompliance: "compliant" | "non_compliant" | "requires_review";
  ksaIssues: string[];
  keyTerms: Array<{ term: string; definition: string; importance: string }>;
  recommendations: string[];
  detectedLanguage: "en" | "ar" | "mixed";
}

/**
 * Analyze a contract using Gemini 2.5 Pro
 */
export async function analyzeContract(contractText: string): Promise<ContractAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `You are an expert legal AI assistant specializing in Saudi Arabian contract law, Sharia compliance, and KSA regulatory requirements.

Analyze the following contract and provide a comprehensive analysis in JSON format with the following structure:

{
  "summary": "Brief 2-3 sentence summary of the contract",
  "riskScore": "low" | "medium" | "high",
  "riskFactors": ["list of identified risk factors"],
  "shariaCompliance": "compliant" | "non_compliant" | "requires_review",
  "shariaIssues": ["list of Sharia compliance issues if any"],
  "ksaCompliance": "compliant" | "non_compliant" | "requires_review",
  "ksaIssues": ["list of KSA regulatory compliance issues if any"],
  "keyTerms": [
    {
      "term": "term name",
      "definition": "explanation",
      "importance": "why this term matters"
    }
  ],
  "recommendations": ["actionable recommendations for the user"],
  "detectedLanguage": "en" | "ar" | "mixed"
}

Consider:
1. Risk Assessment: Identify unfair terms, liability issues, payment terms, termination clauses
2. Sharia Compliance: Check for interest (riba), excessive uncertainty (gharar), gambling (maysir), prohibited activities
3. KSA Regulatory Compliance: Saudi Labor Law, Commercial Law, Consumer Protection Law
4. Key Terms: Important clauses, obligations, rights, and restrictions
5. Language: Detect if contract is in English, Arabic, or mixed

Contract Text:
${contractText}

Provide only the JSON response, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]) as ContractAnalysisResult;
    return analysis;
  } catch (error) {
    console.error("Contract analysis error:", error);
    throw new Error("Failed to analyze contract");
  }
}

/**
 * Chat with AI about a contract
 */
export async function chatWithAI(
  contractText: string,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string,
  language: "en" | "ar" = "en"
): Promise<{ response: string; tokensUsed: number }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const systemPrompt =
    language === "ar"
      ? `أنت مساعد قانوني متخصص في تحليل العقود السعودية باسم ContraMind AI. لديك خبرة في القانون السعودي والامتثال الشرعي والأنظمة التنظيمية في المملكة العربية السعودية.

العقد المرجعي:
${contractText}

عند الإجابة على الأسئلة:
1. ابدأ دائماً بعبارة: "ContraMind AI يوصي بـ:"
2. استخدم جداول Markdown للتحليل المنظم
3. قدم ملخصاً تنفيذياً (≤ 150 كلمة) بعد الجدول
4. استخدم لغة قانونية رسمية ومهنية
5. نظم الإجابة بوضوح مع عناوين وأقسام

قدم إجابات عملية ومفيدة ومنظمة بشكل احترافي.`
      : `You are ContraMind AI, an expert legal assistant specializing in Saudi Arabian contract analysis. You have expertise in Saudi law, Sharia compliance, and KSA regulatory requirements.

Reference Contract:
${contractText}

When answering questions, ALWAYS follow this structure:

1. Start with: "ContraMind AI recommends to:"
2. Use Markdown tables for structured analysis with columns: Clause #/Title | Contract Extract | Issue/Concern | Recommendation
3. Provide an executive summary (≤ 150 words) after the table highlighting top 3 risks/issues
4. Use formal legal English suitable for professional review
5. Organize your answer with clear headings and sections
6. For risk analysis, categorize by: Financial, Legal, Operational, Compliance
7. For Sharia compliance, check: Riba (interest), Gharar (uncertainty), prohibited activities
8. For KSA compliance, reference: Labor Law, Commercial Law, Consumer Protection Law

Provide practical, actionable, and professionally structured responses.`;

  // Build chat history
  const messages = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "I understand. I'm ready to answer questions about this contract." }] },
  ];

  // Add chat history (limit to last 5 messages to avoid context overload)
  const recentHistory = chatHistory.slice(-5);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Add current user message
  messages.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  try {
    // Use generateContent with full context to avoid duplicate responses
    const fullPrompt = messages.map(m => m.parts[0].text).join('\n\n---\n\n') + '\n\n' + userMessage;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Estimate tokens (rough approximation)
    const tokensUsed = Math.ceil((systemPrompt.length + userMessage.length + text.length) / 4);

    return {
      response: text,
      tokensUsed,
    };
  } catch (error) {
    console.error("AI chat error:", error);
    throw new Error("Failed to get AI response");
  }
}

/**
 * Extract text from PDF or Word document
 * This is a placeholder - in production, use proper document parsing libraries
 */
export async function extractTextFromDocument(fileBuffer: Buffer, mimeType: string): Promise<string> {
  // TODO: Implement actual text extraction using libraries like:
  // - pdf-parse for PDFs
  // - mammoth for Word documents
  // For now, return a placeholder
  return "Contract text will be extracted here using document parsing libraries.";
}

/**
 * Generate pre-built prompts based on contract analysis
 */
export function generatePrompts(analysis: ContractAnalysisResult, language: "en" | "ar" = "en"): string[] {
  if (language === "ar") {
    return [
      "ما هي أهم المخاطر في هذا العقد؟",
      "هل هذا العقد متوافق مع الشريعة الإسلامية؟",
      "ما هي التزاماتي بموجب هذا العقد؟",
      "هل هناك أي بنود غير عادلة؟",
      "ما هي شروط الإنهاء؟",
      "اشرح شروط الدفع",
      "ما هي المسؤوليات القانونية؟",
    ];
  }

  return [
    "What are the main risks in this contract?",
    "Is this contract Sharia compliant?",
    "What are my obligations under this contract?",
    "Are there any unfair terms?",
    "What are the termination conditions?",
    "Explain the payment terms",
    "What are the legal liabilities?",
  ];
}

