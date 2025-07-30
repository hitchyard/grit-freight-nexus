import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, DollarSign, TrendingUp, Shield, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function PricingPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Only pay when you complete a successful freight deal
          </p>
        </div>

        {/* Commission Structure */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl">10% Flat Commission</CardTitle>
            <p className="text-center text-muted-foreground">
              Taken only on successfully completed freight deals
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">80%</div>
                <div className="font-medium">Trucker</div>
                <div className="text-sm text-muted-foreground">You keep the majority</div>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">10%</div>
                <div className="font-medium">Broker</div>
                <div className="text-sm text-muted-foreground">Fair broker fee</div>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">10%</div>
                <div className="font-medium">Hitchyard</div>
                <div className="text-sm text-muted-foreground">Platform fee</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground">
                Example: On a $2,500 load, truckers earn $2,000, brokers earn $250, and Hitchyard takes $250
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Included */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Escrow Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All payments secured in escrow until delivery confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">AI Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Smart algorithms match you with optimal freight opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Freight Futures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pre-commit to lanes and secure guaranteed rates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle className="text-lg">Instant Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get paid immediately upon delivery confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's Included */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Everything You Need</CardTitle>
            <p className="text-muted-foreground">
              No hidden fees, no monthly subscriptions, no setup costs
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Unlimited load postings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>AI-powered matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Real-time chat with partners</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Digital contract management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Automatic payment processing</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Freight futures trading</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Performance analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Rating and review system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>24/7 customer support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Mobile app access</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose Hitchyard?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Feature</th>
                    <th className="text-center py-3">Traditional Brokers</th>
                    <th className="text-center py-3 text-primary font-bold">Hitchyard</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-3">Commission Rate</td>
                    <td className="text-center py-3">15-25%</td>
                    <td className="text-center py-3 font-bold text-green-600">10%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Payment Terms</td>
                    <td className="text-center py-3">30-60 days</td>
                    <td className="text-center py-3 font-bold text-green-600">Instant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Load Matching</td>
                    <td className="text-center py-3">Manual</td>
                    <td className="text-center py-3 font-bold text-green-600">AI-Powered</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Freight Futures</td>
                    <td className="text-center py-3">❌</td>
                    <td className="text-center py-3 font-bold text-green-600">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Transparent Pricing</td>
                    <td className="text-center py-3">❌</td>
                    <td className="text-center py-3 font-bold text-green-600">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to Start Earning More?</h2>
          <p className="text-muted-foreground">
            Join thousands of truckers and brokers already using Hitchyard
          </p>
          <div className="space-x-4">
            <Button size="lg">Get Started Today</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}