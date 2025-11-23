import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculatePrice } from "@/lib/pricing";
import { Alert, AlertDescription } from "@/components/ui/alert";

const locations = [
  "Puerto Princesa",
  "Port Barton",
  "San Vicente",
  "Lumambong Beach",
  "El Nido",
  "Sabang",
  "Nacpan Beach",
];

const transportTypes = [
  { value: "shared_van", label: "Shared Van (₱750/person)", category: "land" },
  { value: "private_van", label: "Private Van (Flat Rate)", category: "land" },
  { value: "boat", label: "Shared Boat (₱3,500/person, min 8 pax)", category: "sea" },
  { value: "speedboat", label: "Private Speedboat (₱30,000 flat)", category: "sea" },
  { value: "4x4", label: "4x4 Transfer (Flat Rate)", category: "land" },
];

const BookRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pickup: "",
    dropoff: "",
    transportType: "",
    time: "",
    passengers: "1",
  });

  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);

  // Calculate price whenever relevant fields change
  useEffect(() => {
    if (formData.pickup && formData.dropoff && formData.transportType && formData.passengers) {
      const result = calculatePrice(
        formData.transportType as any,
        formData.pickup,
        formData.dropoff,
        parseInt(formData.passengers)
      );

      if (result.error) {
        setPriceError(result.error);
        setPriceEstimate(null);
      } else {
        setPriceError(null);
        setPriceEstimate(result.total);
        setPriceWarning(result.warning || null);
      }
    } else {
      setPriceEstimate(null);
      setPriceError(null);
      setPriceWarning(null);
    }
  }, [formData.pickup, formData.dropoff, formData.transportType, formData.passengers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!formData.pickup || !formData.dropoff || !formData.transportType || !formData.time) {
      toast.error("Please fill in all fields");
      return;
    }

    if (priceError) {
      toast.error(priceError);
      return;
    }

    if (!priceEstimate) {
      toast.error("Unable to calculate price. Please check your selections.");
      return;
    }

    setLoading(true);

    const selectedTransport = transportTypes.find(t => t.value === formData.transportType);

    try {
      const { error } = await supabase.from("bookings").insert({
        traveler_id: user?.id,
        pickup_location: formData.pickup,
        dropoff_location: formData.dropoff,
        route_category: selectedTransport?.category as "land" | "sea",
        transport_type: formData.transportType as any,
        date: format(date, "yyyy-MM-dd"),
        time: formData.time,
        passengers: parseInt(formData.passengers),
        status: "pending",
        payment_method: "cash",
        price_estimate: priceEstimate,
      });

      if (error) throw error;

      toast.success("Booking request submitted! Looking for available operators...");
      navigate("/my-trips");
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Book Your Ride</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <Select
                    value={formData.pickup}
                    onValueChange={(value) => setFormData({ ...formData, pickup: value })}
                  >
                    <SelectTrigger id="pickup">
                      <SelectValue placeholder="Select pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoff">Destination</Label>
                  <Select
                    value={formData.dropoff}
                    onValueChange={(value) => setFormData({ ...formData, dropoff: value })}
                  >
                    <SelectTrigger id="dropoff">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transport">Transport Type</Label>
                  <Select
                    value={formData.transportType}
                    onValueChange={(value) => setFormData({ ...formData, transportType: value })}
                  >
                    <SelectTrigger id="transport">
                      <SelectValue placeholder="Select transport type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers">Number of Passengers</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.passengers}
                      onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    />
                  </div>
                </div>

                {priceError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{priceError}</AlertDescription>
                  </Alert>
                )}

                {priceWarning && !priceError && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{priceWarning}</AlertDescription>
                  </Alert>
                )}

                {priceEstimate && !priceError && (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estimated Price:</span>
                      <span className="text-2xl font-bold">₱{priceEstimate.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading || !!priceError}>
                  {loading ? "Creating booking..." : "Find Available Operators"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookRide;