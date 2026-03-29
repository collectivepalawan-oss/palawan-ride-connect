import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  code: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  operatorName?: string;
  operatorPhone?: string;
  travelerPhone: string;
}

interface MobileTableProps {
  bookings: Booking[];
  userRole: 'traveler' | 'operator' | 'admin';
  onAction: (action: string, booking: Booking) => void;
}

export const MobileTable = ({ bookings, userRole, onAction }: MobileTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {bookings.map((booking) => (
        <div 
          key={booking.id}
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
        >
          {/* Card Header - Always Visible */}
          <div 
            className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
            onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-primary">
                  {booking.code}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize ${getStatusColor(booking.status)}`}
                >
                  {booking.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{booking.pickup} → {booking.dropoff}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <span className="font-bold text-lg">₱{booking.price.toLocaleString()}</span>
              {expandedId === booking.id ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {expandedId === booking.id && (
            <div className="px-4 pb-4 border-t bg-gray-50/50">
              <div className="pt-4 space-y-3">
                {/* Route Details */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="font-medium">{booking.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dropoff</p>
                      <p className="font-medium">{booking.dropoff}</p>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">@</span>
                    <span>{booking.time}</span>
                  </div>
                </div>

                {/* Contact Info */}
                {userRole === 'operator' && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Traveler: {booking.travelerPhone}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {booking.status === 'pending' && userRole === 'operator' && (
                    <>
                      <Button 
                        size="sm" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => onAction('accept', booking)}
                      >
                        Accept via WhatsApp
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => onAction('decline', booking)}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      className="w-full col-span-2"
                      variant="outline"
                      onClick={() => onAction('contact', booking)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact {userRole === 'traveler' ? 'Driver' : 'Traveler'}
                    </Button>
                  )}

                  {userRole === 'admin' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full col-span-2"
                      onClick={() => onAction('view_details', booking)}
                    >
                      View Full Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
