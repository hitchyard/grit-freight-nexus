import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEmail } from "@/hooks/useEmail";
import { Users, MessageSquare, Shield, CheckCircle } from "lucide-react";

export default function GetInvitedPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendEmail } = useEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendEmail({
        to: "hello@hitchyard.com",
        subject: "Trucker Invitation Request",
        text: `
Email: ${email}
Message: ${message}

This trucker is requesting an invitation to join Hitchyard.
        `,
        html: `
<h2>New Trucker Invitation Request</h2>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>
<p>This trucker is requesting an invitation to join Hitchyard.</p>
        `
      });

      toast({
        title: "Request Sent!",
        description: "We'll review your request and have a dispatcher reach out to you.",
      });

      setEmail("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      icon: MessageSquare,
      title: "Request Invitation",
      description: "Fill out the form below with your contact info and a brief message"
    },
    {
      icon: Users,
      title: "Dispatcher Review",
      description: "A verified broker or dispatcher will review your request"
    },
    {
      icon: Shield,
      title: "Get Invited",
      description: "Receive an invitation link to join their trusted network"
    },
    {
      icon: CheckCircle,
      title: "Start Hauling",
      description: "Access quality loads from your broker's exclusive network"
    }
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
            <Button variant="ghost" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Get Invited by a Dispatcher</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hitchyard is an invite-only platform. Request access from a verified broker or dispatcher to join their trusted network.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* How it Works */}
            <div>
              <h2 className="text-2xl font-bold mb-6">How It Works</h2>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-2">Why Invite-Only?</h3>
                <p className="text-muted-foreground">
                  We maintain quality by ensuring every trucker is vouched for by a verified broker. 
                  This eliminates spam and ensures you're working with legitimate, professional partners.
                </p>
              </div>
            </div>

            {/* Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>Request Invitation</CardTitle>
                <CardDescription>
                  Let us know you're interested and we'll have a dispatcher reach out
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  
                  <textarea
                    className="w-full p-3 border border-border rounded-md min-h-[120px] resize-none"
                    placeholder="Tell us about yourself: What type of freight do you haul? What are your preferred lanes? Any experience with specific brokers?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending Request..." : "Request Invitation"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Already have an invitation code?
                  </p>
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Sign In Here
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}