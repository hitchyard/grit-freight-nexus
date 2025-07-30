import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, DollarSign, Clock, MapPin, Truck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";

interface FreightFuture {
  id: string;
  lane_from: string;
  lane_to: string;
  truck_type: string;
  rate_per_mile: number;
  estimated_miles: number;
  total_commitment: number;
  start_date: string;
  end_date: string;
  ai_confidence_score: number;
  market_demand: string;
  status: string;
  created_at: string;
}

export default function FreightFutures() {
  const [futures, setFutures] = useState<FreightFuture[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    lane_from: "",
    lane_to: "",
    truck_type: "",
    rate_per_mile: "",
    estimated_miles: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
  });

  useEffect(() => {
    fetchFutures();
  }, []);

  const fetchFutures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('futures')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFutures(data || []);
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

  const handleCreateFuture = async () => {
    if (!formData.lane_from || !formData.lane_to || !formData.truck_type || 
        !formData.rate_per_mile || !formData.estimated_miles || 
        !formData.start_date || !formData.end_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-freight-future', {
        body: {
          lane_from: formData.lane_from,
          lane_to: formData.lane_to,
          truck_type: formData.truck_type,
          rate_per_mile: parseFloat(formData.rate_per_mile),
          estimated_miles: parseInt(formData.estimated_miles),
          start_date: format(formData.start_date, 'yyyy-MM-dd'),
          end_date: format(formData.end_date, 'yyyy-MM-dd'),
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Freight future created successfully!",
      });

      setShowCreateForm(false);
      setFormData({
        lane_from: "",
        lane_to: "",
        truck_type: "",
        rate_per_mile: "",
        estimated_miles: "",
        start_date: undefined,
        end_date: undefined,
      });
      fetchFutures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getDemandColor = (demand: string) => {
    switch (demand.toLowerCase()) {
      case 'high': return "text-green-600 bg-green-50";
      case 'medium': return "text-yellow-600 bg-yellow-50";
      case 'low': return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Freight Futures</h1>
            <p className="text-muted-foreground">
              Pre-commit to lanes and secure guaranteed rates
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            Create Future
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Freight Future</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lane_from">From</Label>
                  <Input
                    id="lane_from"
                    placeholder="Chicago, IL"
                    value={formData.lane_from}
                    onChange={(e) => setFormData({...formData, lane_from: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lane_to">To</Label>
                  <Input
                    id="lane_to"
                    placeholder="Dallas, TX"
                    value={formData.lane_to}
                    onChange={(e) => setFormData({...formData, lane_to: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="truck_type">Truck Type</Label>
                  <Select onValueChange={(value) => setFormData({...formData, truck_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry_van">Dry Van</SelectItem>
                      <SelectItem value="reefer">Reefer</SelectItem>
                      <SelectItem value="flatbed">Flatbed</SelectItem>
                      <SelectItem value="step_deck">Step Deck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rate_per_mile">Rate per Mile ($)</Label>
                  <Input
                    id="rate_per_mile"
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    value={formData.rate_per_mile}
                    onChange={(e) => setFormData({...formData, rate_per_mile: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_miles">Estimated Miles</Label>
                  <Input
                    id="estimated_miles"
                    type="number"
                    placeholder="1000"
                    value={formData.estimated_miles}
                    onChange={(e) => setFormData({...formData, estimated_miles: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(formData.start_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => setFormData({...formData, start_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(formData.end_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => setFormData({...formData, end_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFuture} disabled={creating}>
                  {creating ? "Creating..." : "Create Future"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Futures List */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-8">Loading futures...</div>
          ) : futures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No open freight futures available
            </div>
          ) : (
            futures.map((future) => (
              <Card key={future.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{future.lane_from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{future.lane_to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{future.truck_type.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Rate/Mile</div>
                            <div className="font-medium">${future.rate_per_mile}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Miles</div>
                          <div className="font-medium">{future.estimated_miles.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Value</div>
                          <div className="font-medium text-green-600">
                            ${future.total_commitment.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Period</div>
                          <div className="text-sm">
                            {format(new Date(future.start_date), 'MMM dd')} - {format(new Date(future.end_date), 'MMM dd')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">AI Confidence:</span>
                          <span className={cn("font-medium", getConfidenceColor(future.ai_confidence_score))}>
                            {(future.ai_confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Market Demand:</span>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getDemandColor(future.market_demand)
                          )}>
                            {future.market_demand}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <Button>
                        Lock In Rate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}