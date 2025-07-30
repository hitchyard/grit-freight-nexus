import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Clock, MapPin, Truck, Users, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: string;
  future_id: string;
  total_amount: number;
  trucker_amount: number;
  broker_amount: number;
  platform_amount: number;
  status: string;
  escrow_status: string;
  created_at: string;
  futures: {
    lane_from: string;
    lane_to: string;
    truck_type: string;
    rate_per_mile: number;
    estimated_miles: number;
  } | null;
}

interface DashboardStats {
  totalEarnings: number;
  activeContracts: number;
  completedDeals: number;
  avgRating: number;
}

export default function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    activeContracts: 0,
    completedDeals: 0,
    avgRating: 4.8
  });
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'broker' | 'trucker'>('trucker');
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get user profile to determine role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile && ['admin', 'broker', 'trucker'].includes(profile.role)) {
        setUserRole(profile.role as 'admin' | 'broker' | 'trucker');
      }

      // Fetch contracts based on role
      const contractQuery = profile?.role === 'broker' 
        ? supabase.from('contracts').select(`
            *,
            futures:future_id (
              lane_from,
              lane_to,
              truck_type,
              rate_per_mile,
              estimated_miles
            )
          `).eq('broker_id', user.id)
        : supabase.from('contracts').select(`
            *,
            futures:future_id (
              lane_from,
              lane_to,
              truck_type,
              rate_per_mile,
              estimated_miles
            )
          `).eq('trucker_id', user.id);

      const { data: contractData, error } = await contractQuery
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContracts((contractData as any) || []);

      // Calculate stats
      const totalEarnings = contractData?.reduce((sum, contract) => {
        if (contract.status === 'executed') {
          return sum + (profile?.role === 'broker' ? contract.broker_amount : contract.trucker_amount);
        }
        return sum;
      }, 0) || 0;

      const activeContracts = contractData?.filter(c => c.status === 'signed').length || 0;
      const completedDeals = contractData?.filter(c => c.status === 'executed').length || 0;

      setStats({
        totalEarnings,
        activeContracts,
        completedDeals,
        avgRating: 4.8
      });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'signed':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'executed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEscrowBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'held':
        return <Badge className="bg-yellow-100 text-yellow-800">Held</Badge>;
      case 'released':
        return <Badge className="bg-green-100 text-green-800">Released</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout userRole={userRole}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {userRole === 'broker' ? 'Manage your freight operations' : 'Track your freight opportunities'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedDeals}</div>
              <p className="text-xs text-muted-foreground">
                All time completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground">
                Based on recent reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contracts Section */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active Contracts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {contracts.filter(c => c.status === 'signed').map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{contract.futures?.lane_from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{contract.futures?.lane_to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{contract.futures?.truck_type?.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Your Earnings</div>
                          <div className="font-medium text-green-600">
                            ${userRole === 'broker' ? contract.broker_amount : contract.trucker_amount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Value</div>
                          <div className="font-medium">${contract.total_amount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Escrow Status</div>
                          {getEscrowBadge(contract.escrow_status)}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 space-y-2">
                      {getStatusBadge(contract.status)}
                      <div>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {contracts.filter(c => c.status === 'pending').map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{contract.futures?.lane_from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{contract.futures?.lane_to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{contract.futures?.truck_type?.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Potential Earnings</div>
                          <div className="font-medium text-green-600">
                            ${userRole === 'broker' ? contract.broker_amount : contract.trucker_amount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Value</div>
                          <div className="font-medium">${contract.total_amount}</div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 space-y-2">
                      {getStatusBadge(contract.status)}
                      <div>
                        <Button size="sm">
                          Sign Contract
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {contracts.filter(c => c.status === 'executed').map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{contract.futures?.lane_from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{contract.futures?.lane_to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(contract.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Earnings Received</div>
                          <div className="font-medium text-green-600">
                            ${userRole === 'broker' ? contract.broker_amount : contract.trucker_amount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Value</div>
                          <div className="font-medium">${contract.total_amount}</div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      {getStatusBadge(contract.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}