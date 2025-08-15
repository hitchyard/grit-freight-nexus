import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

interface BrokerApplication {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  mc_number: string;
  dot_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  experience: string;
  status: string;
  fmcsa_verified: boolean;
  fmcsa_status: string;
  fmcsa_operating_status: string;
  fmcsa_bond_compliant: boolean;
  fmcsa_insurance_compliant: boolean;
  fmcsa_legal_name: string;
  fmcsa_verification_timestamp: string;
  created_at: string;
  admin_notes: string;
}

export default function BrokerApplicationsManager() {
  const [applications, setApplications] = useState<BrokerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<BrokerApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('broker_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
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

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (application: BrokerApplication) => {
    if (application.status === 'approved') {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    if (application.status === 'pending_review') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
    if (application.status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
  };

  const getFMCSAStatusIcon = (application: BrokerApplication) => {
    if (!application.fmcsa_verified) {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
    if (application.fmcsa_operating_status?.toLowerCase().includes('active') && 
        application.fmcsa_bond_compliant && 
        application.fmcsa_insurance_compliant) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('broker_applications')
        .update({ 
          status: newStatus,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      // If approving, also create broker profile
      if (newStatus === 'approved' && selectedApp) {
        const { error: brokerError } = await supabase
          .from('brokers')
          .insert({
            user_id: selectedApp.user_id,
            company_name: selectedApp.company_name,
            mc_number: selectedApp.mc_number,
            dot_number: selectedApp.dot_number,
            address: selectedApp.address,
            city: selectedApp.city,
            state: selectedApp.state,
            zip_code: selectedApp.zip_code,
            status: 'approved',
          });

        if (brokerError) {
          console.error('Error creating broker profile:', brokerError);
          // Continue with notification even if broker profile creation fails
        }

        // Send approval notification
        try {
          await supabase.functions.invoke('send-broker-notification', {
            body: {
              email: selectedApp.email,
              firstName: selectedApp.first_name,
              lastName: selectedApp.last_name,
              status: 'approved',
              mcNumber: selectedApp.mc_number,
            },
          });
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
      }

      toast({
        title: "Status Updated",
        description: `Application ${newStatus}`,
      });

      fetchApplications();
      setSelectedApp(null);
      setAdminNotes('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const reverifyApplication = async (application: BrokerApplication) => {
    try {
      await supabase.functions.invoke('fmcsa-verify-broker', {
        body: {
          applicationId: application.id,
          mcNumber: application.mc_number,
          dotNumber: application.dot_number,
        },
      });

      toast({
        title: "Re-verification Started",
        description: "FMCSA verification is running in background",
      });

      // Refresh after a short delay
      setTimeout(fetchApplications, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    pendingReview: applications.filter(app => app.status === 'pending_review').length,
    fmcsaVerified: applications.filter(app => app.fmcsa_verified).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-48">Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Broker Applications</h2>
        <Button onClick={fetchApplications} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReview}</div>
            <div className="text-sm text-muted-foreground">Need Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.fmcsaVerified}</div>
            <div className="text-sm text-muted-foreground">FMCSA Verified</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Manage broker applications and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>MC/DOT</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>FMCSA</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.company_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {app.city}, {app.state}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.first_name} {app.last_name}</div>
                      <div className="text-sm text-muted-foreground">{app.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {app.mc_number && <div>MC: {app.mc_number}</div>}
                      {app.dot_number && <div>DOT: {app.dot_number}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFMCSAStatusIcon(app)}
                      <div className="text-sm">
                        {app.fmcsa_verified ? (
                          <div>
                            <div>{app.fmcsa_operating_status}</div>
                            <div className="text-xs text-muted-foreground">
                              Bond: {app.fmcsa_bond_compliant ? '✓' : '✗'} | 
                              Insurance: {app.fmcsa_insurance_compliant ? '✓' : '✗'}
                            </div>
                          </div>
                        ) : (
                          'Not verified'
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setAdminNotes(app.admin_notes || '');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{app.company_name} - Application Details</DialogTitle>
                            <DialogDescription>
                              Review and manage broker application
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedApp && (
                            <div className="space-y-6">
                              {/* Application Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Company Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {selectedApp.company_name}</div>
                                    <div><strong>MC Number:</strong> {selectedApp.mc_number}</div>
                                    <div><strong>DOT Number:</strong> {selectedApp.dot_number}</div>
                                    <div><strong>Address:</strong> {selectedApp.address}, {selectedApp.city}, {selectedApp.state} {selectedApp.zip_code}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Contact Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>Name:</strong> {selectedApp.first_name} {selectedApp.last_name}</div>
                                    <div><strong>Email:</strong> {selectedApp.email}</div>
                                    <div><strong>Phone:</strong> {selectedApp.phone}</div>
                                  </div>
                                </div>
                              </div>

                              {/* FMCSA Verification */}
                              {selectedApp.fmcsa_verified && (
                                <div>
                                  <h4 className="font-semibold mb-2">FMCSA Verification Results</h4>
                                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                    <div><strong>Operating Status:</strong> {selectedApp.fmcsa_operating_status}</div>
                                    <div><strong>Legal Name:</strong> {selectedApp.fmcsa_legal_name}</div>
                                    <div><strong>Bond Compliant:</strong> {selectedApp.fmcsa_bond_compliant ? 'Yes' : 'No'}</div>
                                    <div><strong>Insurance Compliant:</strong> {selectedApp.fmcsa_insurance_compliant ? 'Yes' : 'No'}</div>
                                    <div><strong>Verified:</strong> {new Date(selectedApp.fmcsa_verification_timestamp).toLocaleString()}</div>
                                  </div>
                                </div>
                              )}

                              {/* Experience */}
                              {selectedApp.experience && (
                                <div>
                                  <h4 className="font-semibold mb-2">Experience</h4>
                                  <div className="bg-muted p-4 rounded-lg text-sm">
                                    {selectedApp.experience}
                                  </div>
                                </div>
                              )}

                              {/* Admin Notes */}
                              <div>
                                <h4 className="font-semibold mb-2">Admin Notes</h4>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add notes about this application..."
                                  rows={3}
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-4 border-t">
                                {selectedApp.status !== 'approved' && (
                                  <Button
                                    onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                                    disabled={updating}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                )}
                                {selectedApp.status !== 'rejected' && (
                                  <Button
                                    onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                                    disabled={updating}
                                    variant="destructive"
                                  >
                                    Reject
                                  </Button>
                                )}
                                <Button
                                  onClick={() => reverifyApplication(selectedApp)}
                                  variant="outline"
                                >
                                  Re-verify FMCSA
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}