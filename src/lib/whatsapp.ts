// Generate WhatsApp click-to-chat links without API
export const generateWhatsAppLink = (
  phone: string, 
  bookingCode: string,
  type: 'operator_accept' | 'traveler_confirm' | 'admin_notify',
  data: {
    pickup: string;
    dropoff: string;
    price: number;
    date: string;
    time: string;
  }
) => {
  // Format: 63XXXXXXXXX (Philippines format, no + or 0)
  const formattedPhone = phone.replace(/\D/g, '').replace(/^0/, '63');
  
  const messages = {
    operator_accept: `🚗 NEW BOOKING ${bookingCode}\n\n` +
      `📍 From: ${data.pickup}\n` +
      `📍 To: ${data.dropoff}\n` +
      `📅 ${data.date} at ${data.time}\n` +
      `💰 ₱${data.price.toLocaleString()}\n\n` +
      `Reply YES to accept or NO to decline`,
      
    traveler_confirm: `✅ BOOKING CONFIRMED ${bookingCode}\n\n` +
      `Your ride has been accepted!\n` +
      `Driver will contact you shortly.\n\n` +
      `Track: ${window.location.origin}/track/${bookingCode}`,
      
    admin_notify: `📊 ADMIN ALERT\n\n` +
      `Booking ${bookingCode} requires attention\n` +
      `Route: ${data.pickup} → ${data.dropoff}`
  };

  const encodedMessage = encodeURIComponent(messages[type]);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Generate verification code
export const generateBookingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars
  let code = 'PRC-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
