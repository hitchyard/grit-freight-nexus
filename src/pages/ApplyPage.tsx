import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Users, Award } from "lucide-react";

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    companyName: "",
    mcNumber: "",
    dotNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    experience: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'broker'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create broker profile
        const { error: brokerError } = await supabase
          .from('brokers')
          .insert({
            user_id: authData.user.id,
            company_name: formData.companyName,
            mc_number: formData.mcNumber,
            dot_number: formData.dotNumber,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            status: 'pending'
          });

        if (brokerError) throw brokerError;

        toast({
          title: "Application Submitted!",
          description: "We'll review your application and get back to you within 24 hours.",
        });

        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const benefits = [
    {
      icon: Shield,
      title: "Verified Platform",
      description: "Join our exclusive network of trusted freight brokers"
    },
    {
      icon: Users,
      title: "Quality Truckers",
      description: "Access to pre-screened, reliable carriers in your network"
    },
    {
      icon: CheckCircle,
      title: "Fast Approval",
      description: "Get approved within 24 hours with proper documentation"
    },
    {
      icon: Award,
      title: "Premium Features",
      description: "AI matching, instant chat, and smart load management"
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Apply as a Freight Broker</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our exclusive network of verified freight brokers and access quality truckers for your loads.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Benefits */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Why Join Hitchyard?</h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form */}
            <Card>
              <CardHeader>
                <CardTitle>Broker Application</CardTitle>
                <CardDescription>
                  Fill out the form below to apply for broker access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="mcNumber"
                      placeholder="MC Number"
                      value={formData.mcNumber}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="dotNumber"
                      placeholder="DOT Number"
                      value={formData.dotNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <Input
                    name="address"
                    placeholder="Business Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="zipCode"
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Textarea
                    name="experience"
                    placeholder="Brief description of your freight brokerage experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={3}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}