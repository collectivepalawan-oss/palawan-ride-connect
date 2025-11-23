import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Car, Waves, MapPin, Clock, Shield, Zap } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on role
  if (userRole === "operator") {
    return <Navigate to="/operator" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Default traveler dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Explore Palawan Your Way
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Book reliable transport across paradise - from island hopping to mountain transfers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg">
                <Link to="/book">
                  <MapPin className="mr-2 h-5 w-5" />
                  Book a Ride
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link to="/my-trips">
                  <Clock className="mr-2 h-5 w-5" />
                  Track My Booking
                </Link>
              </Button>
            </div>
          </div>

          {/* Transport Types */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/book?type=shared_van">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <Car className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Shared Vans</CardTitle>
                  <CardDescription>Affordable group transport</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/book?type=private_van">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <Car className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Private Vans</CardTitle>
                  <CardDescription>Exclusive family rides</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/book?type=boat">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <Ship className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Island Hopping</CardTitle>
                  <CardDescription>Explore hidden beaches</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/book?type=4x4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <Waves className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>4x4 Transfers</CardTitle>
                  <CardDescription>Off-road adventures</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Safe & Reliable</CardTitle>
                <CardDescription>
                  All operators are verified and vetted for your safety
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Track your ride in real-time with live GPS updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Instant Booking</CardTitle>
                <CardDescription>
                  Book in seconds and get confirmed within minutes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
