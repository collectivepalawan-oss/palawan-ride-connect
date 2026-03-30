import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ship, Users, Calendar, DollarSign, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Stats {
  totalBookings: number;
  totalOperators: number;
  onlineOperators: number;
  pendingBookings: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalOperators: 0,
    onlineOperators: 0,
    pendingBookings: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

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
  };

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const usersWithRoles = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .maybeSingle();
        
        return {
          ...profile,
          role: roleData?.role || "traveler",
        };
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(true);
    
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });
    
    if (error) {
      toast.error("Failed to update role");
    } else {
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    }
    
    setUpdating(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "operator": return "bg-blue-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage operators, bookings, and users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Bookings</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  {stats.totalBookings}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Bookings</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                  {stats.pendingBookings}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Operators</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  {stats.totalOperators}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Online Operators</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Ship className="h-6 w-6 text-green-500" />
                  {stats.onlineOperators}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="operators">Operators</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user roles (Traveler, Operator, Admin)</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading users...</p>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role.toUpperCase()}
                            </Badge>
                            <select
                              className="border rounded-md px-2 py-1 text-sm"
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              disabled={updating}
                            >
                              <option value="traveler">Traveler</option>
                              <option value="operator">Operator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

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
