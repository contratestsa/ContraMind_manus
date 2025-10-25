import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl, SUBSCRIPTION_TIERS } from "@/const";
import {
  Sparkles,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Google Gemini 2.5 Pro analyzes your contracts in seconds, identifying risks and compliance issues",
    },
    {
      icon: Shield,
      title: "Sharia & KSA Compliance",
      description: "Specialized checks for Islamic finance principles and Saudi Arabian regulatory requirements",
    },
    {
      icon: MessageSquare,
      title: "Interactive AI Chat",
      description: "Ask questions about your contracts and get instant, accurate answers in English or Arabic",
    },
    {
      icon: Zap,
      title: "10x Faster Reviews",
      description: "What takes lawyers hours, ContraMind does in minutes - saving time and money",
    },
    {
      icon: Globe,
      title: "Bilingual Support",
      description: "Full support for English and Arabic contracts with seamless language switching",
    },
    {
      icon: TrendingUp,
      title: "Smart Insights",
      description: "Get actionable recommendations to improve your contracts and reduce legal risks",
    },
  ];

  const benefits = [
    "Reduce legal review costs by up to 80%",
    "Identify risks before they become problems",
    "Ensure Sharia and KSA regulatory compliance",
    "Get instant answers to contract questions",
    "Export analysis reports in PDF/Word",
    "Secure cloud storage for all contracts",
  ];

  const pricingTiers = [
    {
      ...SUBSCRIPTION_TIERS.STARTER,
      features: ["50 contracts/month", "AI analysis", "Risk assessment", "Email support", "Export reports"],
    },
    {
      ...SUBSCRIPTION_TIERS.PROFESSIONAL,
      features: [
        "200 contracts/month",
        "Advanced AI analysis",
        "Knowledge base",
        "Priority support",
        "API access",
        "Custom prompts",
      ],
      popular: true,
    },
    {
      ...SUBSCRIPTION_TIERS.BUSINESS,
      features: [
        "Unlimited contracts",
        "Dedicated AI model",
        "24/7 support",
        "Team management",
        "Custom integrations",
        "Advanced analytics",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8 rounded-lg" />
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </a>
              <Button onClick={() => (window.location.href = getLoginUrl())}>Get Started</Button>
            </nav>
            <Button className="md:hidden" onClick={() => (window.location.href = getLoginUrl())}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              <Sparkles className="mr-1 h-3 w-3" />
              Powered by Google Gemini 2.5 Pro
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              AI-Powered Contract Analysis
              <br />
              <span className="text-primary">for Saudi Arabian SMBs</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Analyze contracts 10x faster with AI. Identify risks, ensure compliance, and get instant answers in
              English or Arabic.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-lg px-8" onClick={() => (window.location.href = getLoginUrl())}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modern Businesses</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to analyze contracts with confidence
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ContraMind.ai?</h2>
              <p className="text-xl text-muted-foreground">Built specifically for Saudi Arabian businesses</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                  <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  <p className="font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your business</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative ${(tier as any).popular ? "border-2 border-primary shadow-xl" : ""}`}
              >
                {(tier as any).popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{tier.priceMonthly}</span>
                      <span className="text-muted-foreground"> SAR/month</span>
                    </div>
                    <p className="text-sm mt-2">
                      or {tier.priceAnnual} SAR/year (save{" "}
                      {Math.round((1 - tier.priceAnnual / (tier.priceMonthly * 12)) * 100)}%)
                    </p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={(tier as any).popular ? "default" : "outline"}
                    onClick={() => (window.location.href = getLoginUrl())}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Transform Your Contract Review?</h2>
            <p className="text-xl opacity-90">
              Join hundreds of Saudi businesses using AI to analyze contracts faster and smarter
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm opacity-75">14-day free trial • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8 rounded-lg" />
                <span className="text-lg font-bold">{APP_TITLE}</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered contract analysis for Saudi Arabian businesses. Fast, accurate, and compliant.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ContraMind.ai. All rights reserved. Made in Saudi Arabia 🇸🇦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

