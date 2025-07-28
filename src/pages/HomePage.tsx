import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Truck, 
  Shield, 
  Zap, 
  MessageSquare, 
  Target, 
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Grit Club Access",
      description: "Invite-only platform for trusted brokers and their truckers. No spam, no junk loads.",
      badge: "Exclusive"
    },
    {
      icon: Clock,
      title: "Fresh Loads Only",
      description: "Loads auto-expire in 1-3 hours. No stale freight, no dead leads.",
      badge: "Real-time"
    },
    {
      icon: MessageSquare,
      title: "Instant Broker Chat",
      description: "Direct messaging with load-linked threads. Book loads with one click.",
      badge: "Fast"
    },
    {
      icon: Target,
      title: "Smart AI Matching",
      description: "Create your lane profile and get instant alerts for matching loads.",
      badge: "AI-Powered"
    },
    {
      icon: DollarSign,
      title: "Rate Transparency",
      description: "See average rates per lane. Expose lowballers, reward fair brokers.",
      badge: "Honest"
    },
    {
      icon: TrendingUp,
      title: "Speed Rankings",
      description: "Top carriers get early access to premium freight opportunities.",
      badge: "Competitive"
    }
  ];

  const testimonials = [
    {
      quote: "Finally, a load board that doesn't waste my time. Real loads from real brokers.",
      author: "Mike Rodriguez",
      role: "Owner-Operator",
      rating: 5
    },
    {
      quote: "Hitchyard gets me quality truckers fast. No more dealing with tire kickers.",
      author: "Sarah Chen",
      role: "Freight Broker",
      rating: 5
    },
    {
      quote: "The AI matching is spot-on. I get alerts for loads that actually fit my routes.",
      author: "Tommy Jackson",
      role: "Fleet Manager",
      rating: 5
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
                <p className="text-sm text-muted-foreground">Load Board for Short Kings</p>
              </div>
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

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-glow"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-primary font-semibold">
              The Load Board for Short Kings
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              No <span className="text-primary">Junk Loads.</span><br />
              No <span className="text-primary">Tire Kickers.</span><br />
              Just <span className="text-primary">Real Freight.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Invite-only freight platform for serious brokers and their truckers. 
              Hotshot, Power-only, Flatbed, Short hauls under 400 miles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" variant="industrial" className="group" onClick={() => navigate("/apply")}>
                Apply as Broker
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate("/get-invited")}>
                Get Invited by Dispatcher
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Loads expire in 1-3 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Verified broker contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>AI-powered load matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Freight Game</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature designed to eliminate waste and maximize efficiency in freight brokerage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="industrial-shadow hover:border-primary/50 transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
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

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Freight Pros</h2>
            <p className="text-xl text-muted-foreground">
              Real feedback from brokers and truckers using Hitchyard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="industrial-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-4 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join the Grit Club?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get verified as a broker and start posting quality loads to our exclusive network of truckers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="industrial" onClick={() => navigate("/apply")}>
              Apply as Broker
            </Button>
            <Button size="xl" variant="outline" onClick={() => navigate("/learn-more")}>
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
                <div className="text-sm text-muted-foreground">Load Board for Short Kings</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 Hitchyard. Gritty freight, delivered.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}