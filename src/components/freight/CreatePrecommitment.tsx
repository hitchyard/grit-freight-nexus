import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, Clock, MapPin, Truck, Shield } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreatePrecommitmentProps {
  onPrecommitmentCreated?: () => void;
}

export default function CreatePrecommitment({ onPrecommitmentCreated }: CreatePrecommitmentProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    lane_from: "",
    lane_to: "",
    truck_type: "",
    forecast_rate: "",
    miles_estimate: "",
    expires_at: undefined as Date | undefined,
  });

  const handleCreatePrecommitment = async () => {
    if (!formData.lane_from || !formData.lane_to || !formData.truck_type || 
        !formData.forecast_rate || !formData.miles_estimate || !formData.expires_at) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-precommitment', {
        body: {
          lane_from: formData.lane_from,
          lane_to: formData.lane_to,
          truck_type: formData.truck_type,
          forecast_rate: parseFloat(formData.forecast_rate),
          miles_estimate: parseInt(formData.miles_estimate),
          expires_at: formData.expires_at.toISOString(),
        }
      });

      if (error) throw error;

      toast({
        title: "Precommitment Created",
        description: "Your precommitment has been created and is awaiting funding",
      });

      setShowForm(false);
      setFormData({
        lane_from: "",
        lane_to: "",
        truck_type: "",
        forecast_rate: "",
        miles_estimate: "",
        expires_at: undefined,
      });

      if (onPrecommitmentCreated) {
        onPrecommitmentCreated();
      }

      // Handle Stripe payment if client_secret is returned
      if (data?.client_secret) {
        // In a real implementation, you'd redirect to Stripe Checkout or use Stripe Elements
        console.log("Payment required:", data.client_secret);
      }

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

  const calculateCommitmentAmount = () => {
    if (formData.forecast_rate && formData.miles_estimate) {
      const totalValue = parseFloat(formData.forecast_rate) * parseInt(formData.miles_estimate);
      const commitmentAmount = totalValue * 0.10; // 10% commitment
      return commitmentAmount.toFixed(2);
    }
    return "0.00";
  };

  if (!showForm) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Create Precommitment</h3>
                <p className="text-sm text-muted-foreground">
                  Secure capacity with a 10% commitment deposit
                </p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <DollarSign className="h-4 w-4" />
              Start Precommitment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Create Freight Precommitment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Lock in capacity by making a 10% commitment deposit. Truckers who accept will guarantee the rate.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lane Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lane_from" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              From
            </Label>
            <Input
              id="lane_from"
              placeholder="Chicago, IL"
              value={formData.lane_from}
              onChange={(e) => setFormData({...formData, lane_from: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="lane_to" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              To
            </Label>
            <Input
              id="lane_to"
              placeholder="Dallas, TX"
              value={formData.lane_to}
              onChange={(e) => setFormData({...formData, lane_to: e.target.value})}
            />
          </div>
        </div>

        {/* Equipment and Rate */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Truck Type
            </Label>
            <Select onValueChange={(value) => setFormData({...formData, truck_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dry_van">Dry Van</SelectItem>
                <SelectItem value="reefer">Reefer</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="step_deck">Step Deck</SelectItem>
                <SelectItem value="hotshot">Hotshot</SelectItem>
                <SelectItem value="power_only">Power Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="forecast_rate" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Rate per Mile ($)
            </Label>
            <Input
              id="forecast_rate"
              type="number"
              step="0.01"
              placeholder="2.50"
              value={formData.forecast_rate}
              onChange={(e) => setFormData({...formData, forecast_rate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="miles_estimate">Estimated Miles</Label>
            <Input
              id="miles_estimate"
              type="number"
              placeholder="1000"
              value={formData.miles_estimate}
              onChange={(e) => setFormData({...formData, miles_estimate: e.target.value})}
            />
          </div>
        </div>

        {/* Expires At */}
        <div>
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Expires At
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.expires_at && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expires_at ? format(formData.expires_at, "PPP") : "Select expiration date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expires_at}
                onSelect={(date) => setFormData({...formData, expires_at: date})}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Commitment Summary */}
        {formData.forecast_rate && formData.miles_estimate && (
          <Card className="bg-accent/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Estimated Value:</span>
                  <span className="font-medium">
                    ${(parseFloat(formData.forecast_rate || "0") * parseInt(formData.miles_estimate || "0")).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Commitment Required (10%):</span>
                  <span>${calculateCommitmentAmount()}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This amount will be held in escrow until a trucker accepts your precommitment
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreatePrecommitment} disabled={loading} className="gap-2">
            {loading ? "Creating..." : "Create & Fund Precommitment"}
            <Shield className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}