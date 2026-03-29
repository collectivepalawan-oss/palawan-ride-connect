import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, MapPin, Calendar, Clock, Users, DollarSign, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const MyBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "accepted")
      .order("date", { ascending: true });

    if (error) {
      toast.error("Failed to load bookings");
    } else {
      setBookings(data || []);
    }
    
    setLoading(false);
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    }
  };

  const openWhatsApp = (booking: any) => {
    const message = `Hi! Your booking from ${booking.pickup_location} to ${booking.dropoff_location} on ${booking.date} at ${booking.time} has been accepted. Ready for pickup?`;
    const whatsappUrl = `https://wa.me/639474443597?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No accepted bookings yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{booking.pickup_location}</span>
                          <span>→</span>
                          <span className="font-medium">{booking.dropoff_location}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{format(new Date(booking.date), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{booking.passengers} passengers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>₱{booking.price_estimate?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWhatsApp(booking)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        
                        <select
                          className="border rounded-md px-3 py-1 text-sm"
                          value={booking.status}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                        >
                          <option value="accepted">Accepted</option>
                          <option value="enroute">En Route</option>
                          <option value="arrived">Arrived</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
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

export default MyBookings;
