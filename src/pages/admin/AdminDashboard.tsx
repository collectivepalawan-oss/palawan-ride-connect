import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Ship, Users, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalBookings: number;
  totalOperators: number;
  onlineOperators: number;
  pendingBookings: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalOperators: 0,
    onlineOperators: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [bookingsRes, operatorsRes, onlineRes, pendingRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("operators").select("id", { count: "exact", head: true }),
        supabase.from("operators").select("id", { count: "exact", head: true }).eq("availability", true),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStats({
        totalBookings: bookingsRes.count || 0,
        totalOperators: operatorsRes.count || 0,
        onlineOperators: onlineRes.count || 0,
        pendingBookings: pendingRes.count || 0,
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage operators, bookings, and routes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Bookings</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  {loading ? "..." : stats.totalBookings}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Bookings</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                  {loading ? "..." : stats.pendingBookings}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Operators</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  {loading ? "..." : stats.totalOperators}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Online Operators</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Ship className="h-6 w-6 text-green-500" />
                  {loading ? "..." : stats.onlineOperators}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="operators">Operators</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>View and manage all booking requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Bookings management interface coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operators" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Operators</CardTitle>
                  <CardDescription>Manage transport operators</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Operators management interface coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Routes</CardTitle>
                  <CardDescription>Manage available routes and pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Routes management interface coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;