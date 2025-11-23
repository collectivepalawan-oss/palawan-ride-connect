import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ship, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Operator {
  id: string;
  operator_name: string;
  transport_type: string;
  capacity: number;
  availability: boolean;
}

interface Booking {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  transport_type: string;
  date: string;
  time: string;
  passengers: number;
  status: string;
}

const OperatorDashboard = () => {
  const { user } = useAuth();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOperatorData = async () => {
      const { data: opData } = await supabase
        .from("operators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (opData) {
        setOperator(opData);

        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("operator_id", opData.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (bookingsData) {
          setPendingBookings(bookingsData);
        }
      }

      setLoading(false);
    };

    fetchOperatorData();
  }, [user]);

  const toggleAvailability = async () => {
    if (!operator) return;

    const newStatus = !operator.availability;

    const { error } = await supabase
      .from("operators")
      .update({ availability: newStatus })
      .eq("id", operator.id);

    if (!error) {
      setOperator({ ...operator, availability: newStatus });
      toast.success(newStatus ? "You are now online" : "You are now offline");
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleBookingAction = async (bookingId: string, action: "accepted" | "rejected") => {
    if (!operator) return;

    const { error } = await supabase
      .from("bookings")
      .update({ 
        status: action,
        operator_id: action === "accepted" ? operator.id : null
      })
      .eq("id", bookingId);

    if (!error) {
      setPendingBookings(pendingBookings.filter(b => b.id !== bookingId));
      toast.success(`Booking ${action}`);
    } else {
      toast.error("Failed to update booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No operator profile found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
            <p className="text-muted-foreground">Manage your rides and availability</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {operator.operator_name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {operator.transport_type.replace("_", " ").toUpperCase()} • {operator.capacity} passengers
                  </CardDescription>
                </div>
                <Badge className={operator.availability ? "bg-green-500" : "bg-gray-500"}>
                  {operator.availability ? "Online" : "Offline"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="availability"
                  checked={operator.availability}
                  onCheckedChange={toggleAvailability}
                />
                <Label htmlFor="availability">
                  {operator.availability ? "Go Offline" : "Go Online"}
                </Label>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pending booking requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {booking.pickup_location} → {booking.dropoff_location}
                      </CardTitle>
                      <CardDescription>
                        {booking.transport_type.replace("_", " ").toUpperCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.date} at {booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.passengers} passenger(s)</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleBookingAction(booking.id, "accepted")}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleBookingAction(booking.id, "rejected")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperatorDashboard;