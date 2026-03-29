import { generateWhatsAppLink, generateBookingCode } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useBookingActions = () => {
  
  const handleCreateBooking = async (bookingData: any) => {
    const code = generateBookingCode();
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          code,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Find available operators in the area
      const { data: operators } = await supabase
        .from('operator_profiles')
        .select('user_id, phone, full_name')
        .eq('service_area', bookingData.pickup_area)
        .eq('is_active', true);

      // Send WhatsApp notifications to operators
      if (operators && operators.length > 0) {
        operators.forEach(op => {
          const waLink = generateWhatsAppLink(
            op.phone,
            code,
            'operator_accept',
            {
              pickup: bookingData.pickup,
              dropoff: bookingData.dropoff,
              price: bookingData.price,
              date: bookingData.date,
              time: bookingData.time
            }
          );
          
          // Store the link for the operator to click
          supabase.from('notifications').insert({
            operator_id: op.user_id,
            booking_id: data.id,
            whatsapp_link: waLink,
            type: 'new_booking',
            status: 'pending'
          });
        });
      }

      toast.success(`Booking created! Code: ${code}`);
      return { success: true, code, booking: data };
      
    } catch (error) {
      toast.error('Failed to create booking');
      return { success: false, error };
    }
  };

  const handleAcceptBooking = async (booking: any, operatorPhone: string) => {
    const waLink = generateWhatsAppLink(
      booking.traveler_phone,
      booking.code,
      'traveler_confirm',
      {
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        price: booking.price,
        date: booking.date,
        time: booking.time
      }
    );

    // Open WhatsApp immediately
    window.open(waLink, '_blank');

    // Update booking status
    await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        operator_phone: operatorPhone,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', booking.id);

    toast.success('Opening WhatsApp to notify traveler...');
  };

  const handleContact = (booking: any, userRole: string) => {
    const phone = userRole === 'traveler' 
      ? booking.operator_phone 
      : booking.traveler_phone;
    
    if (!phone) {
      toast.error('Contact not available yet');
      return;
    }

    const message = userRole === 'traveler'
      ? `Hi, I'm checking on my booking ${booking.code}`
      : `Hi, I'm your driver for booking ${booking.code}`;

    const waLink = `https://wa.me/63${phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(waLink, '_blank');
  };

  return {
    handleCreateBooking,
    handleAcceptBooking,
    handleContact
  };
};
