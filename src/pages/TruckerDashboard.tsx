import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Target, 
  Clock,
  MessageSquare,
  Star,
  MapPin,
  Truck,
  Navigation,
  Bell,
  Eye
} from "lucide-react";

export default function TruckerDashboard() {
  const stats = [
    {
      title: "Available Loads",
      value: "8",
      change: "3 new matches",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Active Bookings",
      value: "2",
      change: "1 in transit",
      icon: Truck,
      color: "text-warning"
    },
    {
      title: "Monthly Earnings",
      value: "$12,450",
      change: "+15% vs last month",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Speed Score",
      value: "94",
      change: "+2 this week",
      icon: TrendingUp,
      color: "text-success"
    }
  ];

  const matchedLoads = [
    {
      id: "LD004",
      pickup: "Los Angeles, CA",
      delivery: "Las Vegas, NV",
      rate: "$950",
      miles: "280 mi",
      match: "98%",
      expires: "45 min",
      equipment: "Hotshot",
      broker: "Southwest Freight Co."
    },
    {
      id: "LD005",
      pickup: "Phoenix, AZ",
      delivery: "Tucson, AZ",
      rate: "$650",
      miles: "120 mi",
      match: "95%",
      expires: "1.5 hrs",
      equipment: "Hotshot",
      broker: "Desert Logistics"
    },
    {
      id: "LD006",
      pickup: "San Diego, CA",
      delivery: "Riverside, CA",
      rate: "$780",
      miles: "85 mi",
      match: "92%",
      expires: "2 hrs",
      equipment: "Power-only",
      broker: "Coast Transport"
    }
  ];

  const recentBookings = [
    {
      id: "BK001",
      pickup: "Dallas, TX",
      delivery: "Austin, TX",
      rate: "$850",
      status: "in-transit",
      eta: "3 hours",
      broker: "Texas Direct"
    },
    {
      id: "BK002",
      pickup: "Houston, TX",
      delivery: "San Antonio, TX",
      rate: "$720",
      status: "delivered",
      completed: "Yesterday",
      broker: "Lone Star Freight"
    }
  ];

  const getMatchColor = (match: string) => {
    const percentage = parseInt(match);
    if (percentage >= 95) return "text-success";
    if (percentage >= 90) return "text-warning";
    return "text-muted-foreground";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-transit":
        return <Badge className="bg-warning/20 text-warning">In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-success/20 text-success">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout userRole="trucker">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Driver Dashboard</h1>
            <p className="text-muted-foreground">Find loads that match your lanes</p>
          </div>
          <Button variant="industrial" className="gap-2">
            <Target className="h-4 w-4" />
            Update Lane Profile
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

        {/* Lane Profile Summary */}
        <Card className="industrial-shadow border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Lane Profile
            </CardTitle>
            <CardDescription>AI uses this to find matching loads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Primary Lanes</div>
                  <div className="text-sm text-muted-foreground">West Coast + Texas Triangle</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Equipment</div>
                  <div className="text-sm text-muted-foreground">Hotshot, Power-only</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Max Distance</div>
                  <div className="text-sm text-muted-foreground">400 miles</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Matched Loads */}
        <Card className="industrial-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                AI Matched Loads
              </CardTitle>
              <CardDescription>Fresh loads matching your profile</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchedLoads.map((load) => (
                <div key={load.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm text-muted-foreground">{load.id}</div>
                    <div>
                      <div className="font-medium">{load.pickup} → {load.delivery}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{load.equipment}</span>
                        <span>•</span>
                        <span>{load.miles}</span>
                        <span>•</span>
                        <span>{load.broker}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getMatchColor(load.match)}`}>
                        {load.match} match
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {load.expires}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">{load.rate}</div>
                      <div className="text-xs text-muted-foreground">${(parseInt(load.rate.slice(1)) / parseInt(load.miles)).toFixed(2)}/mi</div>
                    </div>
                    <Button variant="industrial" size="sm">
                      Book Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="industrial-shadow">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest load activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm text-muted-foreground">{booking.id}</div>
                    <div>
                      <div className="font-medium">{booking.pickup} → {booking.delivery}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.broker}
                        {booking.eta && (
                          <>
                            <span> • ETA: {booking.eta}</span>
                          </>
                        )}
                        {booking.completed && (
                          <>
                            <span> • Completed: {booking.completed}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg">{booking.rate}</div>
                      {getStatusBadge(booking.status)}
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

        {/* Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="industrial-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Driver Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Based on 43 reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-success">#12</div>
                <div>
                  <div className="text-sm font-medium">Top 5% of drivers</div>
                  <div className="text-sm text-muted-foreground">Early access to premium loads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}