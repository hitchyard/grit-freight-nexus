import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, MapPin, Truck, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoadMatchingProps {
  truckerId?: string;
  loadId?: string;
  type: "load_matches" | "trucker_matches";
}

export function LoadMatching({ truckerId, loadId, type }: LoadMatchingProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vector-matching', {
        body: {
          type,
          id: type === "load_matches" ? loadId : truckerId,
          threshold: 0.8
        }
      });

      if (error) throw error;
      setMatches(data.matches || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((truckerId && type === "trucker_matches") || (loadId && type === "load_matches")) {
      fetchMatches();
    }
  }, [truckerId, loadId, type]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading matches...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          AI Matches ({matches.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No matches found
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div key={index} className="border rounded-lg p-4">
                {type === "load_matches" ? (
                  // Showing trucker matches for a load
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{match.company_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {match.home_base_city}, {match.home_base_state}
                        </div>
                        <div className="text-sm">
                          {match.truck_type} • ${match.rate_per_mile_min}/mi min
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {Math.round(match.similarity * 100)}% match
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        ⭐ {match.average_rating?.toFixed(1) || 'New'}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Showing load matches for a trucker
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{match.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {match.pickup_city}, {match.pickup_state} → {match.delivery_city}, {match.delivery_state}
                        </div>
                        <div className="text-sm">
                          {match.truck_type} • {match.distance_miles} miles
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {Math.round(match.similarity * 100)}% match
                      </Badge>
                      <div className="text-sm font-semibold text-green-600 mt-1">
                        ${match.rate?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">
                    {type === "load_matches" ? "Invite" : "Apply"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}