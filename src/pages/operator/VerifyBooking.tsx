import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Search } from "lucide-react";

const VerifyBooking = () => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const handleVerify = async () => {
    if (!pin || pin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("verification_pin", pin)
      .single();

    if (error || !data) {
      toast.error("Invalid PIN. No booking found.");
      setBooking(null);
    } else {
      setBooking(data);
      toast.success("Booking found!");
    }

    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!booking) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "accepted" })
      .eq("id", booking.id);

    if (error) {
      toast.error("Failed to confirm booking");
    } else {
      toast.success("Booking accepted!");
      setBooking({ ...booking, status: "accepted" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                🔐 Verify Booking PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pin">Enter 6-digit PIN</Label>
                <div className="flex gap-2">
                  <Input
                    id="pin"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="text-2xl font-mono text-center"
                  />
                  <Button onClick={handleVerify} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </div>
              </div>

              {booking && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Booking Details</h3>
                    {booking.status === "accepted" ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Accepted
                      </span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>📍 From:</strong> {booking.pickup_location}</p>
                    <p><strong>📍 To:</strong> {booking.dropoff_location}</p>
                    <p><strong>🚗 Type:</strong> {booking.transport_type}</p>
                    <p><strong>📅 Date:</strong> {booking.date}</p>
                    <p><strong>⏰ Time:</strong> {booking.time}</p>
                    <p><strong>👥 Passengers:</strong> {booking.passengers}</p>
                    <p><strong>💰 Price:</strong> ₱{booking.price_estimate?.toLocaleString()}</p>
                  </div>

                  {booking.status !== "accepted" && (
                    <Button onClick={handleConfirm} className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Booking
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VerifyBooking;
