import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, DollarSign, Shield, Zap, Clock, Users, TrendingUp, Star } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function PricingPage() {
  const features = [
    {
      icon: Shield,
      title: "Escrow Protection",
      description: "Secure payments held in escrow until delivery completion"
    },
    {
      icon: Zap,
      title: "AI Matching",
      description: "Smart algorithms match optimal loads to carrier preferences"
    },
    {
      icon: Clock,
      title: "Freight Futures",
      description: "Pre-commit to lanes and lock in guaranteed rates"
    },
    {
      icon: Users,
      title: "Instant Payouts",
      description: "Get paid within 24 hours via Stripe Connect"
    }
  ];

  const commissionBreakdown = [
    { role: "Trucker", percentage: 80, amount: "$800", color: "text-primary" },
    { role: "Broker", percentage: 10, amount: "$100", color: "text-warning" },
    { role: "Hitchyard", percentage: 10, amount: "$100", color: "text-muted-foreground" }
  ];

  const comparisons = [
    {
      feature: "Commission Rate",
      hitchyard: "10% flat",
      traditional: "15-25%",
      advantage: true
    },
    {
      feature: "Payment Speed",
      hitchyard: "24 hours",
      traditional: "30-90 days",
      advantage: true
    },
    {
      feature: "Ghost Loads",
      hitchyard: "Zero",
      traditional: "Common",
      advantage: true
    },
    {
      feature: "AI Matching",
      hitchyard: "Yes",
      traditional: "Manual",
      advantage: true
    },
    {
      feature: "Verified Users",
      hitchyard: "100%",
      traditional: "No verification",
      advantage: true
    }
  ];

  const whatsIncluded = [
    "AI-powered load matching",
    "Secure escrow payments",
    "Real-time messaging",
    "Freight futures trading",
    "24/7 customer support",
    "Mobile app access",
    "Performance analytics",
    "Instant notifications"
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="text-primary">10%</span> Flat Commission
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent pricing with no hidden fees. 
            Pay only when you successfully complete a deal.
          </p>
        </div>

        {/* Commission Breakdown */}
        <Card className="max-w-4xl mx-auto industrial-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How Revenue is Split</CardTitle>
            <CardDescription>
              Fair distribution on every $1,000 load
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {commissionBreakdown.map((item, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className={`text-4xl font-bold ${item.color}`}>
                    {item.percentage}%
                  </div>
                  <div className="font-medium text-lg">{item.role}</div>
                  <div className={`text-2xl font-bold ${item.color}`}>
                    {item.amount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.role === "Trucker" && "Keep the majority of your earnings"}
                    {item.role === "Broker" && "Fair commission for sourcing"}
                    {item.role === "Hitchyard" && "Platform & infrastructure"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Example based on $1,000 load. Commission only applies to successful deals.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Why Choose Hitchyard?</h2>
            <p className="text-muted-foreground mt-2">
              Built for the modern freight industry
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="industrial-shadow">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <Card className="max-w-2xl mx-auto industrial-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">What's Included</CardTitle>
            <CardDescription>
              Everything you need to succeed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {whatsIncluded.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Hitchyard vs Traditional Brokers</h2>
            <p className="text-muted-foreground mt-2">
              See how we stack up against the competition
            </p>
          </div>
          <Card className="max-w-4xl mx-auto industrial-shadow">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Feature</th>
                      <th className="text-center p-4 font-medium text-primary">Hitchyard</th>
                      <th className="text-center p-4 font-medium">Traditional Brokers</th>
                      <th className="text-center p-4 font-medium">Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0 hover:bg-accent/30">
                        <td className="p-4 font-medium">{item.feature}</td>
                        <td className="p-4 text-center text-primary font-medium">
                          {item.hitchyard}
                        </td>
                        <td className="p-4 text-center text-muted-foreground">
                          {item.traditional}
                        </td>
                        <td className="p-4 text-center">
                          {item.advantage && (
                            <Badge className="bg-primary/10 text-primary">
                              Hitchyard
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="industrial-shadow text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">2.5x</div>
              <div className="text-sm text-muted-foreground">Faster payments</div>
            </CardContent>
          </Card>
          <Card className="industrial-shadow text-center">
            <CardContent className="p-6">
              <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Payment guarantee</div>
            </CardContent>
          </Card>
          <Card className="industrial-shadow text-center">
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-sm text-muted-foreground">User satisfaction</div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto industrial-shadow bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
            <p className="text-muted-foreground">
              Join the future of freight with transparent pricing and guaranteed payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Sign Up as Trucker
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                Sign Up as Broker
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              No setup fees • No monthly fees • Only pay on successful deals
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}