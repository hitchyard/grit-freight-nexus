import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, Truck } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CreatePrecommitment() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lane_from: "",
    lane_to: "",
    truck_type: "",
    forecast_rate: "",
    miles_estimate: "",
    expires_at: undefined as Date | undefined,
  });
  const { toast } = useToast();

  const truckTypes = [
    { value: "hotshot", label: "Hotshot" },
    { value: "power_only", label: "Power Only" },
    { value: "flatbed", label: "Flatbed" },
    { value: "dry_van", label: "Dry Van" },
    { value: "reefer", label: "Reefer" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lane_from || !formData.lane_to || !formData.truck_type || 
        !formData.forecast_rate || !formData.miles_estimate || !formData.expires_at) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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
        title: "Success",
        description: "Rate future created successfully!",
      });

      // Reset form
      setFormData({
        lane_from: "",
        lane_to: "",
        truck_type: "",
        forecast_rate: "",
        miles_estimate: "",
        expires_at: undefined,
      });

      // TODO: Handle Stripe payment intent if needed
      if (data.payment_intent) {
        console.log("Payment intent created:", data.payment_intent);
      }

    } catch (error) {
      console.error('Error creating precommitment:', error);
      toast({
        title: "Error",
        description: "Failed to create rate future",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const commitmentAmount = formData.forecast_rate && formData.miles_estimate 
    ? parseFloat(formData.forecast_rate) * parseInt(formData.miles_estimate)
    : 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Create Rate Future
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lane_from">From (City, State)</Label>
              <Input
                id="lane_from"
                placeholder="Los Angeles, CA"
                value={formData.lane_from}
                onChange={(e) => setFormData({ ...formData, lane_from: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lane_to">To (City, State)</Label>
              <Input
                id="lane_to"
                placeholder="Phoenix, AZ"
                value={formData.lane_to}
                onChange={(e) => setFormData({ ...formData, lane_to: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Truck Type</Label>
            <Select 
              value={formData.truck_type} 
              onValueChange={(value) => setFormData({ ...formData, truck_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select truck type" />
              </SelectTrigger>
              <SelectContent>
                {truckTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forecast_rate">Rate per Mile ($)</Label>
              <Input
                id="forecast_rate"
                type="number"
                step="0.01"
                placeholder="2.50"
                value={formData.forecast_rate}
                onChange={(e) => setFormData({ ...formData, forecast_rate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="miles_estimate">Miles Estimate</Label>
              <Input
                id="miles_estimate"
                type="number"
                placeholder="350"
                value={formData.miles_estimate}
                onChange={(e) => setFormData({ ...formData, miles_estimate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expires At</Label>
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
                  {formData.expires_at ? format(formData.expires_at, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expires_at}
                  onSelect={(date) => setFormData({ ...formData, expires_at: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {commitmentAmount > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Commitment:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${commitmentAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This amount will be escrowed until a trucker accepts your rate future.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Rate Future"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}