import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  UserCheck,
  AlertTriangle,
  Activity,
  BarChart3,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "342",
      change: "+23 this week",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Active Loads",
      value: "156",
      change: "+45 today",
      icon: Package,
      color: "text-success"
    },
    {
      title: "Platform Revenue",
      value: "$23,450",
      change: "+12% this month",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Pending Applications",
      value: "7",
      change: "Requires review",
      icon: UserCheck,
      color: "text-warning"
    }
  ];

  const pendingApplications = [
    {
      id: "APP001",
      name: "Southwest Freight LLC",
      applicant: "John Martinez",
      submitted: "2 hours ago",
      revenue: "$2.3M annually",
      experience: "8 years",
      status: "pending"
    },
    {
      id: "APP002",
      name: "Desert Logistics Co",
      applicant: "Sarah Chen",
      submitted: "4 hours ago",
      revenue: "$1.8M annually",
      experience: "5 years",
      status: "pending"
    },
    {
      id: "APP003",
      name: "Route Runner Transport",
      applicant: "Mike Rodriguez",
      submitted: "1 day ago",
      revenue: "$950K annually",
      experience: "3 years",
      status: "under_review"
    }
  ];

  const recentActivity = [
    {
      type: "broker_approved",
      message: "Approved broker application: Coast Transport Inc",
      time: "30 min ago",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      type: "load_flagged",
      message: "Load LD089 flagged for suspicious activity",
      time: "1 hour ago",
      icon: AlertTriangle,
      color: "text-warning"
    },
    {
      type: "payment_processed",
      message: "Platform fee collected: $450",
      time: "2 hours ago",
      icon: DollarSign,
      color: "text-primary"
    },
    {
      type: "user_suspended",
      message: "Suspended broker: Bad Rate Freight (TOS violation)",
      time: "3 hours ago",
      icon: XCircle,
      color: "text-destructive"
    }
  ];

  const systemMetrics = [
    {
      title: "Load Expiry Rate",
      value: "8.5%",
      description: "Loads expiring without bookings",
      trend: "down",
      color: "text-success"
    },
    {
      title: "Average Booking Time",
      value: "23 min",
      description: "Time from post to booking",
      trend: "down",
      color: "text-success"
    },
    {
      title: "Broker Satisfaction",
      value: "4.7/5",
      description: "Average broker rating",
      trend: "up",
      color: "text-success"
    },
    {
      title: "Platform Uptime",
      value: "99.8%",
      description: "Last 30 days",
      trend: "stable",
      color: "text-success"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="text-warning">Pending</Badge>;
      case "under_review":
        return <Badge className="bg-primary/20 text-primary">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout userRole="admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
          <Button variant="industrial" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            View Analytics
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

        {/* Pending Applications */}
        <Card className="industrial-shadow border-warning/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-warning">
                <UserCheck className="h-5 w-5" />
                Pending Broker Applications
              </CardTitle>
              <CardDescription>Review and approve new broker applications</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm text-muted-foreground">{app.id}</div>
                    <div>
                      <div className="font-medium">{app.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Applicant: {app.applicant} • {app.experience} experience • {app.revenue}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {app.submitted}
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="success" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="industrial-shadow">
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{metric.title}</div>
                    <TrendingUp className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="industrial-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                  <div className="flex-1">
                    <div className="font-medium">{activity.message}</div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="industrial-shadow">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <UserCheck className="h-6 w-6" />
              <span>Review Applications</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Flagged Content</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Generate Reports</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}