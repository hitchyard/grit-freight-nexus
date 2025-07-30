import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, DollarSign, Calendar, FileText, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContractDetails {
  id: string;
  future_id: string;
  total_amount: number;
  trucker_amount: number;
  broker_amount: number;
  platform_amount: number;
  status: string;
  escrow_status: string;
  contract_terms: any;
  created_at: string;
  futures: {
    lane_from: string;
    lane_to: string;
    truck_type: string;
    rate_per_mile: number;
    estimated_miles: number;
    start_date: string;
    end_date: string;
  } | null;
}

export default function ContractPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          futures:future_id (
            lane_from,
            lane_to,
            truck_type,
            rate_per_mile,
            estimated_miles,
            start_date,
            end_date
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setContract(data as any);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    if (!contract) return;

    setSigning(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', contract.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contract signed successfully!",
      });

      fetchContract();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSigning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending Signature</Badge>;
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
        return <Badge variant="outline">Payment Pending</Badge>;
      case 'held':
        return <Badge className="bg-yellow-100 text-yellow-800">Funds Secured</Badge>;
      case 'released':
        return <Badge className="bg-green-100 text-green-800">Payment Released</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">Loading contract...</div>
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">Contract not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Freight Contract</h1>
            <p className="text-muted-foreground">Contract ID: {contract.id}</p>
          </div>
          <div className="space-y-2">
            {getStatusBadge(contract.status)}
            {getEscrowBadge(contract.escrow_status)}
          </div>
        </div>

        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Route Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">FROM</h3>
                <p className="text-lg font-medium">{contract.futures?.lane_from}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">TO</h3>
                <p className="text-lg font-medium">{contract.futures?.lane_to}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Equipment</p>
                  <p className="font-medium capitalize">
                    {contract.futures?.truck_type?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-medium">{contract.futures?.estimated_miles?.toLocaleString()} miles</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate per Mile</p>
                <p className="font-medium">${contract.futures?.rate_per_mile}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {contract.futures?.start_date && new Date(contract.futures.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {contract.futures?.end_date && new Date(contract.futures.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Financial Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contract Value</p>
                  <p className="text-2xl font-bold">${contract.total_amount.toLocaleString()}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Trucker Payment (80%)</span>
                    <span className="font-medium">${contract.trucker_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Broker Commission (10%)</span>
                    <span className="font-medium">${contract.broker_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Platform Fee (10%)</span>
                    <span className="font-medium">${contract.platform_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">Escrow Protection</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Funds are held in secure escrow until delivery is confirmed. 
                  This ensures payment protection for both parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Contract Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contract.contract_terms && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Payment Terms</h4>
                  <p className="text-sm text-muted-foreground">
                    {contract.contract_terms.payment_terms}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Cancellation Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    {contract.contract_terms.cancellation_policy}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Insurance Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    {contract.contract_terms.insurance_requirements}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {contract.status === 'pending' && (
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={handleSignContract} disabled={signing}>
              {signing ? "Signing..." : "Sign Contract"}
            </Button>
          </div>
        )}

        {contract.status !== 'pending' && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}