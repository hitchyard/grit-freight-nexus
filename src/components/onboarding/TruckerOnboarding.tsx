import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const TRUCK_TYPES = [
  'Dry Van',
  'Refrigerated',
  'Flatbed',
  'Step Deck',
  'Lowboy',
  'Tanker',
  'Box Truck',
  'Dump Truck'
];

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface TruckerOnboardingProps {
  onComplete: () => void;
}

const TruckerOnboarding = ({ onComplete }: TruckerOnboardingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form data
  const [companyName, setCompanyName] = useState('');
  const [dotNumber, setDotNumber] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [truckType, setTruckType] = useState('');
  const [equipmentDetails, setEquipmentDetails] = useState('');
  const [homeBaseCity, setHomeBaseCity] = useState('');
  const [homeBaseState, setHomeBaseState] = useState('');
  const [maxRadius, setMaxRadius] = useState(400);
  const [ratePerMileMin, setRatePerMileMin] = useState('');
  const [preferredLanes, setPreferredLanes] = useState<string[]>([]);
  const [newLane, setNewLane] = useState('');

  const addPreferredLane = () => {
    if (newLane.trim() && !preferredLanes.includes(newLane.trim())) {
      setPreferredLanes([...preferredLanes, newLane.trim()]);
      setNewLane('');
    }
  };

  const removePreferredLane = (lane: string) => {
    setPreferredLanes(preferredLanes.filter(l => l !== lane));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create trucker profile - for now just create without broker_id
      // This can be updated later when broker assignment is implemented
      const { error: truckerError } = await supabase
        .from('truckers')
        .insert({
          user_id: user?.id,
          broker_id: '850e8400-e29b-41d4-a716-446655440002', // Default broker for demo
          company_name: companyName,
          truck_type: truckType as any,
          equipment_details: equipmentDetails,
          home_base_city: homeBaseCity,
          home_base_state: homeBaseState,
          max_radius: maxRadius,
          rate_per_mile_min: parseFloat(ratePerMileMin),
          preferred_lanes: preferredLanes,
        });

      if (truckerError) throw truckerError;

      // Update profile completion status
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: user?.user_metadata?.first_name,
          last_name: user?.user_metadata?.last_name,
          role: 'trucker',
          onboarding_complete: true,
        });

      if (profileError) throw profileError;

      toast({
        title: "Profile Created!",
        description: "Your trucker profile has been set up successfully.",
      });

      onComplete();
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

  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Let's start with your company details and DOT/MC numbers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Transportation Company LLC"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dot-number">DOT Number</Label>
              <Input
                id="dot-number"
                value={dotNumber}
                onChange={(e) => setDotNumber(e.target.value)}
                placeholder="1234567"
              />
            </div>
            <div>
              <Label htmlFor="mc-number">MC Number</Label>
              <Input
                id="mc-number"
                value={mcNumber}
                onChange={(e) => setMcNumber(e.target.value)}
                placeholder="MC-123456"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="home-city">Home Base City</Label>
              <Input
                id="home-city"
                value={homeBaseCity}
                onChange={(e) => setHomeBaseCity(e.target.value)}
                placeholder="Atlanta"
                required
              />
            </div>
            <div>
              <Label htmlFor="home-state">Home Base State</Label>
              <Select value={homeBaseState} onValueChange={setHomeBaseState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => setStep(2)} 
            className="w-full"
            disabled={!companyName || !homeBaseCity || !homeBaseState}
          >
            Next: Equipment Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Equipment & Preferences</CardTitle>
        <CardDescription>
          Tell us about your equipment and preferred routes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="truck-type">Primary Truck Type</Label>
            <Select value={truckType} onValueChange={setTruckType}>
              <SelectTrigger>
                <SelectValue placeholder="Select truck type" />
              </SelectTrigger>
              <SelectContent>
                {TRUCK_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="equipment-details">Equipment Details</Label>
            <Textarea
              id="equipment-details"
              value={equipmentDetails}
              onChange={(e) => setEquipmentDetails(e.target.value)}
              placeholder="2019 Freightliner Cascadia, 53ft dry van, liftgate available..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-radius">Max Radius (miles)</Label>
              <Input
                id="max-radius"
                type="number"
                value={maxRadius}
                onChange={(e) => setMaxRadius(parseInt(e.target.value))}
                min={50}
                max={3000}
              />
            </div>
            <div>
              <Label htmlFor="rate-min">Minimum Rate ($/mile)</Label>
              <Input
                id="rate-min"
                type="number"
                step="0.01"
                value={ratePerMileMin}
                onChange={(e) => setRatePerMileMin(e.target.value)}
                placeholder="2.50"
              />
            </div>
          </div>

          <div>
            <Label>Preferred Lanes</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLane}
                onChange={(e) => setNewLane(e.target.value)}
                placeholder="e.g., Atlanta, GA to Nashville, TN"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredLane())}
              />
              <Button type="button" onClick={addPreferredLane} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferredLanes.map((lane, index) => (
                <Badge key={index} variant="secondary" className="pr-1">
                  {lane}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 ml-1"
                    onClick={() => removePreferredLane(lane)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading || !truckType}
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TruckerOnboarding;