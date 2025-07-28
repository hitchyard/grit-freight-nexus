import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Clock, 
  MessageSquare, 
  Target, 
  DollarSign, 
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Truck,
  BarChart3
} from "lucide-react";

export default function LearnMorePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Invite-Only Network",
      description: "Every broker is verified and every trucker is vouched for by their dispatcher. No random spam.",
      benefits: ["Verified MC/DOT numbers", "Background checks", "Reference validation"]
    },
    {
      icon: Clock,
      title: "Fresh Loads Only",
      description: "Loads auto-expire in 1-3 hours max. No stale freight cluttering your board.",
      benefits: ["Auto-expiring posts", "Real-time updates", "No dead leads"]
    },
    {
      icon: MessageSquare,
      title: "Instant Communication",
      description: "Chat directly with brokers in load-specific threads. Book with one click.",
      benefits: ["Direct messaging", "Load-linked chats", "One-click booking"]
    },
    {
      icon: Target,
      title: "AI-Powered Matching",
      description: "Set your lane preferences and get instant alerts for matching loads.",
      benefits: ["Smart route matching", "Rate predictions", "Custom alerts"]
    },
    {
      icon: DollarSign,
      title: "Rate Transparency",
      description: "See average rates per lane. Expose lowballers and reward fair brokers.",
      benefits: ["Market rate data", "Broker ratings", "Fair pricing"]
    },
    {
      icon: TrendingUp,
      title: "Performance Rankings",
      description: "Top performing carriers get early access to premium freight.",
      benefits: ["Speed rankings", "Priority access", "Performance metrics"]
    }
  ];

  const stats = [
    { label: "Average Book Time", value: "<2 mins", icon: Clock },
    { label: "Load Completion Rate", value: "96%", icon: CheckCircle },
    { label: "Average Rate Premium", value: "+15%", icon: TrendingUp },
    { label: "Active Brokers", value: "250+", icon: Users }
  ];

  const truckTypes = [
    "Hotshot", "Power Only", "Flatbed", "Dry Van", "Step Deck", "RGN"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">Hitchyard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button variant="industrial" onClick={() => navigate("/apply")}>
                Apply as Broker
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-primary font-semibold">
              How Hitchyard Works
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              The Load Board That Actually <span className="text-primary">Works</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Designed by freight pros for freight pros. Every feature eliminates waste and maximizes efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Hitchyard is Different</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature addresses real pain points in freight brokerage
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="industrial-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Truck Types */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supported Equipment Types</h2>
            <p className="text-xl text-muted-foreground">
              Specialized for short-haul and specialty freight
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {truckTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-base">
                <Truck className="h-4 w-4 mr-2" />
                {type}
              </Badge>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Focused on loads under 400 miles for maximum efficiency
            </p>
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
              <p className="text-xl text-muted-foreground">
                Choose your path to get started on Hitchyard
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="industrial-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <CardTitle>For Freight Brokers</CardTitle>
                  </div>
                  <CardDescription>
                    Get verified and start posting loads to our network of quality truckers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>MC/DOT verification required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Access to pre-screened truckers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>AI-powered load matching</span>
                    </li>
                  </ul>
                  <Button className="w-full" onClick={() => navigate("/apply")}>
                    Apply as Broker
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="industrial-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-primary" />
                    <CardTitle>For Truckers</CardTitle>
                  </div>
                  <CardDescription>
                    Get invited by a broker or dispatcher to access their exclusive loads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Invitation required from verified broker</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>No spam or junk loads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Premium rate opportunities</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/get-invited")}>
                    Request Invitation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
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
                <div className="text-sm text-muted-foreground">Load Board for Short Kings</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="industrial" onClick={() => navigate("/apply")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}