import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStripeConnect } from '@/hooks/useStripeConnect';

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface BrokerOnboardingProps {
  onComplete: () => void;
}

const BrokerOnboarding = ({ onComplete }: BrokerOnboardingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createStripeAccount, loading: stripeLoading } = useStripeConnect();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form data
  const [companyName, setCompanyName] = useState('');
  const [dotNumber, setDotNumber] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleCreateBrokerProfile = async () => {
    setLoading(true);
    
    try {
      // Create broker profile
      const { error: brokerError } = await supabase
        .from('brokers')
        .insert({
          user_id: user?.id,
          company_name: companyName,
          mc_number: mcNumber,
          dot_number: dotNumber,
          address,
          city,
          state,
          zip_code: zipCode,
          status: 'pending',
        });

      if (brokerError) throw brokerError;

      // Update profile completion status
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: user?.user_metadata?.first_name,
          last_name: user?.user_metadata?.last_name,
          role: 'broker',
          onboarding_complete: true,
        });

      if (profileError) throw profileError;

      toast({
        title: "Profile Created!",
        description: "Your broker profile is pending verification.",
      });

      setStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSetup = async () => {
    try {
      const stripeData = await createStripeAccount({
        email: user?.email || '',
        company_name: companyName,
        country: 'US',
      });

      if (stripeData?.account_link_url) {
        // Open Stripe onboarding in new tab
        window.open(stripeData.account_link_url, '_blank');
        
        toast({
          title: "Stripe Setup",
          description: "Complete your Stripe onboarding to receive payments.",
        });
      }

      onComplete();
    } catch (error: any) {
      toast({
        title: "Stripe Setup Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Broker Registration</CardTitle>
          <CardDescription>
            Register your brokerage company to start posting loads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ABC Logistics LLC"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mc-number">MC Number</Label>
              <Input
                id="mc-number"
                value={mcNumber}
                onChange={(e) => setMcNumber(e.target.value)}
                placeholder="MC-123456"
                required
              />
            </div>
            <div>
              <Label htmlFor="dot-number">DOT Number</Label>
              <Input
                id="dot-number"
                value={dotNumber}
                onChange={(e) => setDotNumber(e.target.value)}
                placeholder="1234567"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Atlanta"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="30309"
                required
              />
            </div>
          </div>

          <Button 
            onClick={handleCreateBrokerProfile}
            className="w-full"
            disabled={loading || !companyName || !mcNumber || !address || !city || !state || !zipCode}
          >
            {loading ? 'Creating Profile...' : 'Create Broker Profile'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Payment Setup</CardTitle>
        <CardDescription>
          Set up Stripe Connect to receive payments from completed loads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">What happens next:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Connect your bank account through Stripe</li>
            <li>Verify your business information</li>
            <li>Start receiving payments from completed loads</li>
            <li>Commission structure: Trucker 80%, Broker 10%, Platform 10%</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onComplete()} className="flex-1">
            Setup Later
          </Button>
          <Button 
            onClick={handleStripeSetup}
            className="flex-1"
            disabled={stripeLoading}
          >
            {stripeLoading ? 'Setting Up...' : 'Setup Stripe Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrokerOnboarding;