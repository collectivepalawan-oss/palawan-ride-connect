import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculatePrice } from "@/lib/pricing";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  { value: "shared_van", label: "🚐 Shared Van (₱750/person)", category: "land" },
  { value: "private_van", label: "🚙 Private Van (Flat Rate)", category: "land" },
  { value: "boat", label: "⛵ Shared Boat (₱3,500/person, min 8 pax)", category: "sea" },
  { value: "speedboat", label: "🛥️ Private Speedboat (₱30,000 flat)", category: "sea" },
  { value: "4x4", label: "🚙 4x4 Transfer (Flat Rate)", category: "land" },
];

const generatePIN = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const BookRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [generatedPIN, setGeneratedPIN] = useState("");

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
    const pin = generatePIN();
    setGeneratedPIN(pin);

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
        verification_pin: pin,
      });

      if (error) throw error;

      // Send WhatsApp message with PIN
      const transportLabel = selectedTransport?.label.replace(/[🚐🚙⛵🛥️]/g, '').trim() || formData.transportType;
      const message = `🆕 *NEW BOOKING* 🆕%0A%0A
🔐 *VERIFICATION PIN:* ${pin}%0A%0A
🚗 *Type:* ${transportLabel}%0A
📍 *From:* ${formData.pickup}%0A
📍 *To:* ${formData.dropoff}%0A
📅 *Date:* ${format(date, "MMMM d, yyyy")}%0A
⏰ *Time:* ${formData.time}%0A
👥 *Passengers:* ${formData.passengers}%0A
💰 *Price:* ₱${priceEstimate.toLocaleString()}%0A%0A
_Share this PIN with the traveler for verification_`;

      const whatsappUrl = `https://wa.me/639474443597?text=${message}`;
      window.open(whatsappUrl, "_blank");

      // Show PIN dialog to traveler
      setShowPINDialog(true);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking");
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowPINDialog(false);
    toast.success("Booking confirmed! Check your trips.");
    navigate("/my-trips");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-t-4 border-t-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                📍 Book Your Ride
              </CardTitle>
              <p className="text-blue-100 text-sm mt-2">
                Explore Palawan with trusted local transport
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pickup" className="text-gray-700 font-semibold">
                    📍 Pickup Location
                  </Label>
                  <Select
                    value={formData.pickup}
                    onValueChange={(value) => setFormData({ ...formData, pickup: value })}
                  >
                    <SelectTrigger id="pickup" className="border-gray-300">
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
                  <Label htmlFor="dropoff" className="text-gray-700 font-semibold">
                    🏝️ Destination
                  </Label>
                  <Select
                    value={formData.dropoff}
                    onValueChange={(value) => setFormData({ ...formData, dropoff: value })}
                  >
                    <SelectTrigger id="dropoff" className="border-gray-300">
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
                  <Label htmlFor="transport" className="text-gray-700 font-semibold">
                    🚗 Transport Type
                  </Label>
                  <Select
                    value={formData.transportType}
                    onValueChange={(value) => setFormData({ ...formData, transportType: value })}
                  >
                    <SelectTrigger id="transport" className="border-gray-300">
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
                    <Label className="text-gray-700 font-semibold">📅 Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-gray-300",
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
                    <Label htmlFor="time" className="text-gray-700 font-semibold">
                      ⏰ Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers" className="text-gray-700 font-semibold">
                    👥 Number of Passengers
                  </Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.passengers}
                      onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                      className="border-gray-300"
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
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">{priceWarning}</AlertDescription>
                  </Alert>
                )}

                {priceEstimate && !priceError && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">💰 Estimated Price:</span>
                      <span className="text-2xl font-bold text-green-600">₱{priceEstimate.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg py-6"
                  size="lg" 
                  disabled={loading || !!priceError}
                >
                  {loading ? "Creating booking..." : "🔍 Find Available Operators"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* PIN Dialog */}
      <Dialog open={showPINDialog} onOpenChange={setShowPINDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center">
              Save this PIN to share with your driver
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Your Verification PIN</p>
              <p className="text-4xl font-bold text-blue-600 tracking-wider">{generatedPIN}</p>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Show this PIN to your driver</p>
              <p className="text-xs mt-1">They will confirm it matches their WhatsApp message</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCloseDialog} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500">
              Got it, take me to my trips
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookRide;
