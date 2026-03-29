import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShieldCheck, ClipboardList, MapPin, Phone } from "lucide-react";

const OperatorDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Operator Dashboard</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Verify Booking Card */}
            <Link to="/operator/verify">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
                <CardHeader>
                  <ShieldCheck className="h-12 w-12 text-green-500 mb-2" />
                  <CardTitle>Verify Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Enter PIN code to verify and confirm traveler bookings
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* My Bookings Card (placeholder) */}
            <Card className="opacity-50">
              <CardHeader>
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-2" />
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Coming soon - View all your assigned bookings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Operator Info */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Your WhatsApp number is registered with the system</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>Update your service areas in Settings (coming soon)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperatorDashboard;
