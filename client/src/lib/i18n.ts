/**
 * i18next Configuration
 * 
 * Provides internationalization support with automatic language detection
 * and RTL/LTR direction handling.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      // App
      appName: "ContraMind.ai",
      
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.contracts": "Contracts",
      "nav.upload": "Upload",
      "nav.knowledge": "Knowledge Base",
      "nav.subscription": "Subscription",
      "nav.support": "Support",
      "nav.profile": "Profile",
      "nav.logout": "Logout",

      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.welcome": "Welcome back",
      "dashboard.contracts_analyzed": "Contracts Analyzed",
      "dashboard.ai_messages": "AI Messages",
      "dashboard.risk_alerts": "Risk Alerts",
      "dashboard.compliance_score": "Compliance Score",
      "dashboard.recent_contracts": "Recent Contracts",
      "dashboard.view_all": "View All",
      "dashboard.quick_actions": "Quick Actions",
      "dashboard.upload_new": "Upload New Contract",
      "dashboard.view_contracts": "View All Contracts",

      // Contracts
      "contracts.title": "Contracts",
      "contracts.upload_new": "Upload New Contract",
      "contracts.search": "Search contracts...",
      "contracts.no_contracts": "No contracts found",
      "contracts.upload_first": "Upload your first contract to get started",
      "contracts.filename": "Filename",
      "contracts.uploaded": "Uploaded",
      "contracts.status": "Status",
      "contracts.risk": "Risk",
      "contracts.actions": "Actions",

      // Upload
      "upload.title": "Upload Contract",
      "upload.drag_drop": "Drag and drop your contract here",
      "upload.or": "or",
      "upload.browse": "Browse files",
      "upload.supported": "Supported formats: PDF, DOC, DOCX (Max 10MB)",
      "upload.uploading": "Uploading...",
      "upload.processing": "Processing...",
      "upload.success": "Upload successful!",
      "upload.error": "Upload failed. Please try again.",

      // Analysis
      "analysis.title": "Contract Analysis",
      "analysis.risk_assessment": "Risk Assessment",
      "analysis.sharia_compliance": "Sharia Compliance",
      "analysis.ksa_compliance": "KSA Regulatory Compliance",
      "analysis.ask_question": "Ask a question about this contract...",
      "analysis.send": "Send",
      "analysis.pre_built_prompts": "Pre-built Prompts",
      "analysis.export": "Export",

      // Status
      "status.uploading": "Uploading",
      "status.processing": "Processing",
      "status.analyzed": "Analyzed",
      "status.error": "Error",

      // Risk
      "risk.low": "Low Risk",
      "risk.medium": "Medium Risk",
      "risk.high": "High Risk",

      // Compliance
      "compliance.compliant": "Compliant",
      "compliance.non_compliant": "Non-Compliant",
      "compliance.requires_review": "Requires Review",

      // Subscription
      "subscription.title": "Subscription",
      "subscription.current_plan": "Current Plan",
      "subscription.upgrade": "Upgrade",
      "subscription.manage": "Manage Subscription",
      "subscription.billing_cycle": "Billing Cycle",
      "subscription.next_billing": "Next Billing Date",
      "subscription.payment_method": "Payment Method",

      // Support
      "support.title": "Support",
      "support.create_ticket": "Create Ticket",
      "support.my_tickets": "My Tickets",
      "support.subject": "Subject",
      "support.message": "Message",
      "support.submit": "Submit",
      "support.no_tickets": "No support tickets",

      // Common
      "common.loading": "Loading...",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.view": "View",
      "common.close": "Close",
      "common.confirm": "Confirm",
      "common.error": "Error",
      "common.success": "Success",
    },
  },
  ar: {
    translation: {
      // App
      appName: "كونترا مايند",
      
      // Navigation
      "nav.dashboard": "لوحة التحكم",
      "nav.contracts": "العقود",
      "nav.upload": "رفع",
      "nav.knowledge": "قاعدة المعرفة",
      "nav.subscription": "الاشتراك",
      "nav.support": "الدعم",
      "nav.profile": "الملف الشخصي",
      "nav.logout": "تسجيل الخروج",

      // Dashboard
      "dashboard.title": "لوحة التحكم",
      "dashboard.welcome": "مرحباً بعودتك",
      "dashboard.contracts_analyzed": "العقود المحللة",
      "dashboard.ai_messages": "رسائل الذكاء الاصطناعي",
      "dashboard.risk_alerts": "تنبيهات المخاطر",
      "dashboard.compliance_score": "درجة الامتثال",
      "dashboard.recent_contracts": "العقود الأخيرة",
      "dashboard.view_all": "عرض الكل",
      "dashboard.quick_actions": "إجراءات سريعة",
      "dashboard.upload_new": "رفع عقد جديد",
      "dashboard.view_contracts": "عرض جميع العقود",

      // Contracts
      "contracts.title": "العقود",
      "contracts.upload_new": "رفع عقد جديد",
      "contracts.search": "البحث في العقود...",
      "contracts.no_contracts": "لم يتم العثور على عقود",
      "contracts.upload_first": "قم برفع عقدك الأول للبدء",
      "contracts.filename": "اسم الملف",
      "contracts.uploaded": "تاريخ الرفع",
      "contracts.status": "الحالة",
      "contracts.risk": "المخاطر",
      "contracts.actions": "الإجراءات",

      // Upload
      "upload.title": "رفع عقد",
      "upload.drag_drop": "اسحب وأفلت عقدك هنا",
      "upload.or": "أو",
      "upload.browse": "تصفح الملفات",
      "upload.supported": "الصيغ المدعومة: PDF، DOC، DOCX (حد أقصى 10 ميجابايت)",
      "upload.uploading": "جاري الرفع...",
      "upload.processing": "جاري المعالجة...",
      "upload.success": "تم الرفع بنجاح!",
      "upload.error": "فشل الرفع. يرجى المحاولة مرة أخرى.",

      // Analysis
      "analysis.title": "تحليل العقد",
      "analysis.risk_assessment": "تقييم المخاطر",
      "analysis.sharia_compliance": "الامتثال الشرعي",
      "analysis.ksa_compliance": "الامتثال التنظيمي للمملكة",
      "analysis.ask_question": "اطرح سؤالاً عن هذا العقد...",
      "analysis.send": "إرسال",
      "analysis.pre_built_prompts": "أوامر جاهزة",
      "analysis.export": "تصدير",

      // Status
      "status.uploading": "جاري الرفع",
      "status.processing": "جاري المعالجة",
      "status.analyzed": "تم التحليل",
      "status.error": "خطأ",

      // Risk
      "risk.low": "مخاطر منخفضة",
      "risk.medium": "مخاطر متوسطة",
      "risk.high": "مخاطر عالية",

      // Compliance
      "compliance.compliant": "متوافق",
      "compliance.non_compliant": "غير متوافق",
      "compliance.requires_review": "يتطلب مراجعة",

      // Subscription
      "subscription.title": "الاشتراك",
      "subscription.current_plan": "الخطة الحالية",
      "subscription.upgrade": "ترقية",
      "subscription.manage": "إدارة الاشتراك",
      "subscription.billing_cycle": "دورة الفوترة",
      "subscription.next_billing": "تاريخ الفوترة القادم",
      "subscription.payment_method": "طريقة الدفع",

      // Support
      "support.title": "الدعم",
      "support.create_ticket": "إنشاء تذكرة",
      "support.my_tickets": "تذاكري",
      "support.subject": "الموضوع",
      "support.message": "الرسالة",
      "support.submit": "إرسال",
      "support.no_tickets": "لا توجد تذاكر دعم",

      // Common
      "common.loading": "جاري التحميل...",
      "common.save": "حفظ",
      "common.cancel": "إلغاء",
      "common.delete": "حذف",
      "common.edit": "تعديل",
      "common.view": "عرض",
      "common.close": "إغلاق",
      "common.confirm": "تأكيد",
      "common.error": "خطأ",
      "common.success": "نجح",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;

