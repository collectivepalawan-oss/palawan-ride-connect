import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Calendar, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Booking {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  transport_type: string;
  date: string;
  time: string;
  passengers: number;
  status: string;
  price_estimate: number | null;
  final_price: number | null;
  payment_method: string;
  created_at: string;
  operator_id: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-blue-500",
  rejected: "bg-red-500",
  enroute: "bg-purple-500",
  arrived: "bg-green-500",
  in_progress: "bg-indigo-500",
  completed: "bg-green-600",
  cancelled: "bg-gray-500",
};

const MyTrips = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("traveler_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookings(data);
      }
      setLoading(false);
    };

    fetchBookings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `traveler_id=eq.${user.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Trips</h1>
            <p className="text-muted-foreground">View and track all your bookings</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No bookings yet</p>
                <Button asChild>
                  <a href="/book">Book Your First Ride</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {booking.pickup_location} → {booking.dropoff_location}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {booking.transport_type.replace("_", " ").toUpperCase()}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[booking.status]}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(booking.date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.passengers} passenger(s)</span>
                      </div>
                    </div>

                    {booking.final_price && (
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Price:</span>
                          <span className="text-lg font-semibold">₱{booking.final_price}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Payment: {booking.payment_method.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {booking.status === "accepted" || booking.status === "enroute" || booking.status === "arrived" || booking.status === "in_progress" ? (
                      <Button className="w-full" asChild>
                        <a href={`/track/${booking.id}`}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Track Ride
                        </a>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyTrips;