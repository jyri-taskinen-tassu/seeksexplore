// lib/bookingsStore.ts
export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guests: number;
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  bookingDate: string; // When the booking was made
  notes?: string;
  phone?: string;
};

let bookings: Booking[] = [];

function generateBookingsForDate(date: string, baseSeed: number): Booking[] {
  const dayBookings: Booking[] = [];
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // Seed for consistent randomness
  let seed = baseSeed + dateObj.getTime();
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Weekend has more bookings
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseBookings = isWeekend ? 4 : 2;
  const numBookings = baseBookings + Math.floor(random() * 3);
  
  const products = [
    "Snowmobile Safari (Sport)",
    "Snowmobile Safari (Touring)",
    "E-bike Tour",
    "Guided Hiking Tour",
    "Northern Lights Tour",
    "City Walk (English)",
    "Food Market Experience",
    "Reindeer Sleigh Ride",
    "Private Sauna Experience",
    "Ice Fishing Experience",
  ];
  
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "James", "Mia", "Benjamin", "Charlotte", "Lucas", "Amelia", "Henry", "Harper", "Alexander", "Evelyn", "Michael"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"];
  
  for (let i = 0; i < numBookings; i++) {
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    const customerName = `${firstName} ${lastName}`;
    const customerEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const productName = products[Math.floor(random() * products.length)];
    const time = times[Math.floor(random() * times.length)];
    const guests = Math.floor(1 + random() * 5); // 1-5 guests
    const basePrice = 50 + random() * 200; // 50-250 EUR
    const totalPrice = Math.round(basePrice * guests);
    
    // Booking date is 1-30 days before the departure date
    const bookingDateObj = new Date(dateObj);
    bookingDateObj.setDate(bookingDateObj.getDate() - Math.floor(1 + random() * 30));
    const bookingDate = bookingDateObj.toISOString().split("T")[0];
    
    // Status distribution: 85% confirmed, 10% pending, 5% cancelled
    const statusRand = random();
    let status: BookingStatus = "confirmed";
    if (statusRand < 0.05) {
      status = "cancelled";
    } else if (statusRand < 0.15) {
      status = "pending";
    }
    
    const phone = `+358 ${Math.floor(40 + random() * 10)} ${Math.floor(100 + random() * 900)} ${Math.floor(1000 + random() * 9000)}`;
    
    dayBookings.push({
      id: `booking-${date}-${i}`,
      customerName,
      customerEmail,
      productName,
      date,
      time,
      guests,
      status,
      totalPrice,
      currency: "EUR",
      bookingDate,
      phone,
      notes: random() > 0.8 ? "Special dietary requirements" : undefined,
    });
  }
  
  return dayBookings;
}

export function seedBookingsData() {
  bookings = [];
  const today = new Date();
  
  // Generate bookings for the next 28 days (4 weeks)
  for (let i = 0; i < 28; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    
    const dayBookings = generateBookingsForDate(dateStr, i * 1000);
    bookings.push(...dayBookings);
  }
}

export function getAllBookings(): Booking[] {
  if (bookings.length === 0) {
    seedBookingsData();
  }
  return [...bookings].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

export function getBookingsByDateRange(startDate: string, endDate: string): Booking[] {
  const all = getAllBookings();
  return all.filter(
    (b) => b.date >= startDate && b.date <= endDate && b.status !== "cancelled"
  );
}

export function getBookingsByDate(date: string): Booking[] {
  return getBookingsByDateRange(date, date);
}

export function getBookingsByStatus(status: BookingStatus): Booking[] {
  return getAllBookings().filter((b) => b.status === status);
}

// Initialize on import
seedBookingsData();
