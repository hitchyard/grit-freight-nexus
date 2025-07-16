import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, DollarSign, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Precommitment {
  id: string;
  lane_from: string;
  lane_to: string;
  truck_type: string;
  forecast_rate: number;
  miles_estimate: number;
  commitment_amount: number;
  expires_at: string;
  status: string;
}

export default function RateScalpFeed() {
  const [precommitments, setPrecommitments] = useState<Precommitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrecommitments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('precommitments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'precommitments'
        },
        () => {
          fetchPrecommitments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPrecommitments = async () => {
    try {
      const { data, error } = await supabase
        .from('precommitments')
        .select('*')
        .eq('status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrecommitments(data || []);
    } catch (error) {
      console.error('Error fetching precommitments:', error);
      toast({
        title: "Error",
        description: "Failed to load rate futures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPrecommitment = async (precommitmentId: string) => {
    setAccepting(precommitmentId);
    
    try {
      const { data, error } = await supabase.functions.invoke('accept-precommitment', {
        body: { precommitment_id: precommitmentId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rate future locked in successfully!",
      });

      // Refresh the list
      fetchPrecommitments();
    } catch (error) {
      console.error('Error accepting precommitment:', error);
      toast({
        title: "Error",
        description: "Failed to accept rate future",
        variant: "destructive",
      });
    } finally {
      setAccepting(null);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (precommitments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Rate Futures Available</h3>
          <p className="text-muted-foreground">
            No brokers have posted rate futures at this time. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Rate Futures</h2>
        <Badge variant="secondary">{precommitments.length} available</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {precommitments.map((pc) => (
          <Card key={pc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {pc.lane_from} → {pc.lane_to}
                </CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(pc.expires_at)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{pc.truck_type}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Rate/Mile</div>
                  <div className="font-bold text-green-600">
                    ${pc.forecast_rate.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Miles:</span>
                  <span className="font-medium">{pc.miles_estimate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Payout:</span>
                  <span className="text-green-600">
                    ${pc.commitment_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleAcceptPrecommitment(pc.id)}
                disabled={accepting === pc.id}
              >
                {accepting === pc.id ? "Locking In..." : "Lock It In"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}