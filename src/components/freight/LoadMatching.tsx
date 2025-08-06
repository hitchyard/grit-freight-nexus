import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Truck, 
  DollarSign, 
  Clock, 
  Star, 
  Search,
  Filter,
  TrendingUp,
  Target,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Load {
  id: string;
  title: string;
  pickup_city: string;
  pickup_state: string;
  delivery_city: string;
  delivery_state: string;
  truck_type: string;
  rate: number;
  rate_per_mile: number;
  distance_miles: number;
  expires_at: string;
  status: string;
  broker_id: string;
  similarity?: number;
}

interface LoadMatchingProps {
  userRole?: 'trucker' | 'broker';
}

export default function LoadMatching({ userRole = 'trucker' }: LoadMatchingProps) {
  const [loads, setLoads] = useState<Load[]>([]);
  const [aiMatches, setAiMatches] = useState<Load[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchLoads();
    if (userRole === 'trucker') {
      fetchAIMatches();
    }
  }, [userRole]);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('status', 'posted')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLoads(data || []);
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

  const fetchAIMatches = async () => {
    try {
      // In a real implementation, this would call an AI matching function
      // For now, we'll simulate by getting loads and adding similarity scores
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('status', 'posted')
        .gte('expires_at', new Date().toISOString())
        .limit(5);

      if (error) throw error;
      
      // Simulate AI matching scores
      const matchedLoads = (data || []).map(load => ({
        ...load,
        similarity: Math.random() * 0.3 + 0.7 // Random score between 0.7-1.0
      })).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      setAiMatches(matchedLoads);
    } catch (error: any) {
      console.error("Error fetching AI matches:", error);
    }
  };

  const handleBookLoad = async (loadId: string) => {
    try {
      // In a real implementation, this would create a booking
      toast({
        title: "Load Booked",
        description: "You have successfully booked this load!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMatchColor = (similarity: number) => {
    if (similarity >= 0.9) return "text-green-600";
    if (similarity >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getTruckTypeColor = (type: string) => {
    switch (type) {
      case 'dry_van': return "bg-blue-100 text-blue-800";
      case 'reefer': return "bg-green-100 text-green-800";
      case 'flatbed': return "bg-orange-100 text-orange-800";
      case 'step_deck': return "bg-purple-100 text-purple-800";
      case 'hotshot': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatTruckType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredLoads = loads.filter(load =>
    load.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.pickup_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.delivery_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* AI Matches Section (Truckers Only) */}
      {userRole === 'trucker' && aiMatches.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              AI Matched Loads
              <Badge className="bg-primary/10 text-primary">Hot Matches</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Loads that match your profile and preferences
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {aiMatches.map((load) => (
                <div key={load.id} className="flex items-center justify-between p-4 bg-background/80 border border-primary/10 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-medium ${getMatchColor(load.similarity || 0)}`}>
                        {((load.similarity || 0) * 100).toFixed(0)}% match
                      </div>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {load.pickup_city}, {load.pickup_state} → {load.delivery_city}, {load.delivery_state}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge className={getTruckTypeColor(load.truck_type)}>
                          {formatTruckType(load.truck_type)}
                        </Badge>
                        <span>{load.distance_miles} miles</span>
                        <Clock className="h-3 w-3" />
                        <span>Expires {new Date(load.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">${load.rate}</div>
                      <div className="text-sm text-muted-foreground">${load.rate_per_mile?.toFixed(2)}/mi</div>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleBookLoad(load.id)}
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search loads</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by location, load title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Loads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Available Loads
            </div>
            <Badge variant="outline">{filteredLoads.length} loads</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading loads...</div>
          ) : filteredLoads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No loads found matching your criteria
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoads.map((load) => (
                <div key={load.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="font-medium">{load.title}</div>
                      <Badge className={getTruckTypeColor(load.truck_type)}>
                        {formatTruckType(load.truck_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {load.pickup_city}, {load.pickup_state} → {load.delivery_city}, {load.delivery_state}
                      </div>
                      <div>{load.distance_miles} miles</div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Expires {new Date(load.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">${load.rate}</div>
                      <div className="text-sm text-muted-foreground">
                        ${load.rate_per_mile?.toFixed(2)}/mi
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleBookLoad(load.id)}
                      >
                        {userRole === 'broker' ? 'Edit' : 'Book Load'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}