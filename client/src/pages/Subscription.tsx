import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { SUBSCRIPTION_TIERS } from "@/const";
import { Check, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Subscription() {
  const { data: subscription, isLoading } = trpc.subscription.getCurrent.useQuery();
  const { data: payments } = trpc.subscription.getPayments.useQuery({ limit: 10, offset: 0 });

  const tiers = [
    {
      ...SUBSCRIPTION_TIERS.STARTER,
      features: [
        "50 contracts per month",
        "Unlimited AI chat",
        "Risk & compliance analysis",
        "Email support",
        "Export to PDF/Word",
      ],
    },
    {
      ...SUBSCRIPTION_TIERS.PROFESSIONAL,
      features: [
        "200 contracts per month",
        "Advanced AI analysis",
        "Knowledge base (10 docs)",
        "Priority support",
        "Custom prompts",
        "API access",
      ],
      popular: true,
    },
    {
      ...SUBSCRIPTION_TIERS.BUSINESS,
      features: [
        "Unlimited contracts",
        "Dedicated AI model",
        "Unlimited knowledge base",
        "24/7 priority support",
        "Custom integrations",
        "Team management",
        "Advanced analytics",
      ],
    },
  ];

  const handleUpgrade = (tierId: string) => {
    // TODO: Implement Tap Payment integration
    toast.info("Payment integration will be activated when Tap Payment keys are provided");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-2">Manage your subscription and billing</p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-4 w-64" />
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold capitalize">
                      {subscription.tier.replace("_", " ")} Plan
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Status: <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                        {subscription.status}
                      </Badge>
                    </p>
                  </div>
                  {subscription.status === "active" && subscription.currentPeriodEnd && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Next billing date</p>
                      <p className="font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {(subscription as any).status === "trial" && (subscription as any).trialEndsAt && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-900">
                      Your free trial ends on {new Date((subscription as any).trialEndsAt).toLocaleDateString()}. Upgrade to
                      continue using ContraMind.ai.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active subscription</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Tiers */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map(tier => (
              <Card
                key={tier.id}
                className={(tier as any).popular ? "border-primary shadow-lg relative" : ""}
              >
                {(tier as any).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{tier.priceMonthly}</span>
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
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={(tier as any).popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={subscription?.tier === tier.id}
                  >
                    {subscription?.tier === tier.id ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.amount} SAR</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={payment.status === "success" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No payment history yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Can I change my plan anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades,
                or at the end of your billing cycle for downgrades.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) and MADA cards through Tap
                Payment Services.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Is there a refund policy?</h4>
              <p className="text-sm text-muted-foreground">
                We offer a 14-day money-back guarantee for all plans. If you're not satisfied, contact our support team
                for a full refund.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

