import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  Clock,
  MessageSquare,
  Star,
  AlertCircle,
  Plus,
  Eye
} from "lucide-react";

export default function BrokerDashboard() {
  const stats = [
    {
      title: "Active Loads",
      value: "12",
      change: "+3 from yesterday",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Total Bookings",
      value: "89",
      change: "+12% this month",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Revenue",
      value: "$45,230",
      change: "+8% this month",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Active Truckers",
      value: "24",
      change: "2 pending invites",
      icon: Users,
      color: "text-warning"
    }
  ];

  const recentLoads = [
    {
      id: "LD001",
      pickup: "Los Angeles, CA",
      delivery: "Phoenix, AZ",
      rate: "$1,850",
      status: "active",
      expires: "2 hours",
      equipment: "Flatbed"
    },
    {
      id: "LD002",
      pickup: "Houston, TX",
      delivery: "Dallas, TX",
      rate: "$850",
      status: "booked",
      trucker: "Mike Rodriguez",
      equipment: "Hotshot"
    },
    {
      id: "LD003",
      pickup: "Miami, FL",
      delivery: "Atlanta, GA",
      rate: "$1,200",
      status: "in-transit",
      trucker: "Sarah Johnson",
      equipment: "Power-only"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="text-primary">Active</Badge>;
      case "booked":
        return <Badge className="bg-warning/20 text-warning">Booked</Badge>;
      case "in-transit":
        return <Badge className="bg-success/20 text-success">In Transit</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout userRole="broker">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Broker Dashboard</h1>
            <p className="text-muted-foreground">Manage your loads and truckers</p>
          </div>
          <Button variant="industrial" className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Load
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="industrial-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="industrial-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>Post Load</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Invite Trucker</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Check Messages</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Loads */}
        <Card className="industrial-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Loads</CardTitle>
              <CardDescription>Your latest freight postings and bookings</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLoads.map((load) => (
                <div key={load.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm text-muted-foreground">{load.id}</div>
                    <div>
                      <div className="font-medium">{load.pickup} → {load.delivery}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{load.equipment}</span>
                        {load.status === "active" && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>Expires in {load.expires}</span>
                          </>
                        )}
                        {load.trucker && (
                          <>
                            <span>•</span>
                            <span>Driver: {load.trucker}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg">{load.rate}</div>
                      {getStatusBadge(load.status)}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="industrial-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Broker Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">4.8</div>
                <div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 5 ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Based on 67 reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Speed Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-success">92</div>
                <div>
                  <div className="text-sm font-medium">Excellent</div>
                  <div className="text-sm text-muted-foreground">Top 15% of brokers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="industrial-shadow border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div>
                  <div className="font-medium">Stripe Account Setup</div>
                  <div className="text-sm text-muted-foreground">Complete your payment setup to receive payouts</div>
                </div>
                <Button variant="warning" size="sm">Complete Setup</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div>
                  <div className="font-medium">2 Pending Trucker Invites</div>
                  <div className="text-sm text-muted-foreground">Follow up on your recent invitations</div>
                </div>
                <Button variant="outline" size="sm">View Invites</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}