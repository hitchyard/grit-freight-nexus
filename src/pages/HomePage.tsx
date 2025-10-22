import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-logistics-team.jpg";
import { 
  Truck, 
  Shield, 
  MessageSquare, 
  Target, 
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  FileText,
  Zap
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "FMCSA Broker Verification",
      description: "Automated verification via FMCSA SAFER API - MC/DOT numbers, operating status, bond & insurance compliance checked in real-time",
      badge: "Verified"
    },
    {
      icon: CheckCircle,
      title: "Industry Trust Standards",
      description: "Trust systems modeled on FMC-Verified Brokerage Standards, CSA Safety Scores, and UCC Contract Registry principles",
      badge: "Compliant"
    },
    {
      icon: Target,
      title: "AI Load Matching (pgvector)",
      description: "Vector-based matching connects carriers with ideal loads based on lane history, preferences, and performance metrics",
      badge: "AI-Powered"
    },
    {
      icon: TrendingUp,
      title: "Freight Futures",
      description: "Lock in rates for future lanes, hedge against market volatility with pre-commitments and rate forecasting",
      badge: "Innovative"
    },
    {
      icon: DollarSign,
      title: "Integrated Payments (Stripe Connect)",
      description: "Escrow, Quick Pay options, transparent fees, automated payouts - all in one system",
      badge: "Secure"
    },
    {
      icon: FileText,
      title: "Digital Contracts & E-Signatures",
      description: "Rate confirmations, BOLs, DocuSeal integration - all documents digitally signed and stored securely",
      badge: "Paperless"
    },
    {
      icon: MessageSquare,
      title: "Direct Broker-Carrier Messaging",
      description: "Built-in communication with contract-linked threads, notifications, and load history tracking",
      badge: "Fast"
    },
    {
      icon: Users,
      title: "Bidirectional Rating System",
      description: "Communication, timeliness, and payment ratings build trust and reputation on both sides",
      badge: "Transparent"
    },
    {
      icon: Users,
      title: "Invite-Only Network",
      description: "Referral-based onboarding ensures quality participants and reduces fraud across the platform",
      badge: "Exclusive"
    },
    {
      icon: Clock,
      title: "Speed-to-Book Metrics",
      description: "Track and optimize load acceptance times, improving efficiency and identifying top performers",
      badge: "Performance"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Rate Intelligence",
      description: "Market rates, lane analytics, demand forecasting powered by AI and historical data",
      badge: "Smart"
    },
    {
      icon: Shield,
      title: "Compliance & Safety Tracking",
      description: "Monitor carrier CSA safety scores, insurance updates, and regulatory compliance status continuously",
      badge: "Safe"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-foreground">Hitchyard</h1>
                <p className="text-sm text-muted-foreground">Verified Freight Network</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate("/apply")}>
                Apply as Broker
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] overflow-hidden flex items-center">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              No <span className="text-white">Junk Loads.</span><br />
              No <span className="text-white">Tire Kickers.</span><br />
              Just <span className="text-white">Real Freight.</span>
            </h1>
            
            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
              FMCSA-verified brokers and trusted carriers on an invite-only freight network.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" className="group bg-accent hover:bg-accent/90 shadow-accent" onClick={() => navigate("/apply")}>
                Apply as Broker
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="xl" variant="outline" className="bg-white/95 border-white text-primary hover:bg-white" onClick={() => navigate("/get-invited")}>
                Get Invited by Dispatcher
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-primary font-medium">Loads expire in 1-3 hours</span>
              </div>
              <div className="flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-primary font-medium">Verified broker contacts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-primary font-medium">AI-powered load matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Features List */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Freight Operating System</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              End-to-end platform features for verified brokers and trusted carriers - from verification to payment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-accent hover:border-accent/50 transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <Badge className="bg-accent/10 text-accent border-accent/20">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join the Verified Network?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get FMCSA-verified as a broker and start posting quality loads to our exclusive network of trusted carriers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="bg-accent hover:bg-accent/90 shadow-accent" onClick={() => navigate("/apply")}>
              Apply as Broker
            </Button>
            <Button size="xl" variant="outline" className="border-primary hover:bg-primary/5" onClick={() => navigate("/learn-more")}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div>
                <div className="font-bold">Hitchyard</div>
                <div className="text-sm text-muted-foreground">Verified Freight Network</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 Hitchyard. Verified freight, delivered.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}