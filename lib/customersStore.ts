// lib/customersStore.ts
export type CustomerTag = "vip" | "repeat" | "group" | "corporate" | "family";
export type SalesStage = "inquiry" | "quoted" | "followup" | "booked" | "completed";

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  tags: CustomerTag[];
  totalBookings: number;
  totalSpent: number;
  currency: string;
  firstBookingDate: string;
  lastBookingDate: string;
  notes?: string;
};

export type BookingHistory = {
  id: string;
  customerId: string;
  productName: string;
  date: string;
  time: string;
  guests: number;
  status: "confirmed" | "completed" | "cancelled";
  totalPrice: number;
  currency: string;
};

export type MessageHistory = {
  id: string;
  customerId: string;
  platform: "email" | "whatsapp" | "phone";
  subject?: string;
  content: string;
  direction: "inbound" | "outbound";
  timestamp: string;
  read: boolean;
};

export type SalesOpportunity = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  stage: SalesStage;
  estimatedValue: number;
  currency: string;
  guests: number;
  preferredDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

let customers: Customer[] = [];
let bookingHistory: BookingHistory[] = [];
let messageHistory: MessageHistory[] = [];
let salesOpportunities: SalesOpportunity[] = [];

function generateCustomers(): Customer[] {
  const firstNames = [
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
    "Isabella", "James", "Mia", "Benjamin", "Charlotte", "Lucas", "Amelia",
    "Henry", "Harper", "Alexander", "Evelyn", "Michael", "Sofia", "Daniel",
    "Emily", "Matthew", "Madison", "David", "Abigail", "Joseph", "Elizabeth",
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson",
    "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
    "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis",
  ];
  
  const countries = ["Finland", "Sweden", "Norway", "Germany", "UK", "USA", "France", "Spain"];
  
  const generated: Customer[] = [];
  
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const phone = `+358 ${Math.floor(40 + Math.random() * 10)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    const totalBookings = Math.floor(1 + Math.random() * 15);
    const totalSpent = Math.floor(200 + Math.random() * 5000);
    
    // Generate tags based on behavior
    const tags: CustomerTag[] = [];
    if (totalBookings >= 5) tags.push("repeat");
    if (totalSpent >= 2000) tags.push("vip");
    if (Math.random() > 0.7) tags.push("group");
    if (Math.random() > 0.8) tags.push("corporate");
    if (Math.random() > 0.85) tags.push("family");
    
    const firstBookingDate = new Date();
    firstBookingDate.setDate(firstBookingDate.getDate() - Math.floor(30 + Math.random() * 300));
    
    const lastBookingDate = new Date();
    lastBookingDate.setDate(lastBookingDate.getDate() - Math.floor(Math.random() * 30));
    
    generated.push({
      id: `customer-${i + 1}`,
      firstName,
      lastName,
      email,
      phone,
      country,
      tags,
      totalBookings,
      totalSpent,
      currency: "EUR",
      firstBookingDate: firstBookingDate.toISOString().split("T")[0],
      lastBookingDate: lastBookingDate.toISOString().split("T")[0],
      notes: Math.random() > 0.8 ? "Prefers morning tours" : undefined,
    });
  }
  
  return generated;
}

function generateBookingHistory(customers: Customer[]): BookingHistory[] {
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
  
  const history: BookingHistory[] = [];
  
  customers.forEach((customer) => {
    for (let i = 0; i < customer.totalBookings; i++) {
      const date = new Date(customer.firstBookingDate);
      date.setDate(date.getDate() + Math.floor(i * (30 / customer.totalBookings)));
      
      const statusRand = Math.random();
      let status: "confirmed" | "completed" | "cancelled" = "completed";
      if (statusRand < 0.1) status = "cancelled";
      else if (date > new Date()) status = "confirmed";
      
      history.push({
        id: `booking-${customer.id}-${i}`,
        customerId: customer.id,
        productName: products[Math.floor(Math.random() * products.length)],
        date: date.toISOString().split("T")[0],
        time: `${Math.floor(9 + Math.random() * 10)}:00`,
        guests: Math.floor(1 + Math.random() * 5),
        status,
        totalPrice: Math.floor(50 + Math.random() * 300),
        currency: customer.currency,
      });
    }
  });
  
  return history;
}

function generateMessageHistory(customers: Customer[]): MessageHistory[] {
  const platforms: ("email" | "whatsapp" | "phone")[] = ["email", "whatsapp", "phone"];
  const messages: MessageHistory[] = [];
  
  customers.forEach((customer) => {
    const messageCount = Math.floor(1 + Math.random() * 5);
    for (let i = 0; i < messageCount; i++) {
      const date = new Date(customer.firstBookingDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const direction = Math.random() > 0.5 ? "inbound" : "outbound";
      
      messages.push({
        id: `msg-${customer.id}-${i}`,
        customerId: customer.id,
        platform,
        subject: direction === "inbound" ? "Question about booking" : "Booking confirmation",
        content: direction === "inbound"
          ? "Hi, I have a question about my upcoming booking..."
          : "Thank you for your booking! Here are the details...",
        direction,
        timestamp: date.toISOString(),
        read: direction === "outbound" || Math.random() > 0.3,
      });
    }
  });
  
  return messages;
}

export function seedCustomersData() {
  customers = generateCustomers();
  bookingHistory = generateBookingHistory(customers);
  messageHistory = generateMessageHistory(customers);
}

export function getAllCustomers(): Customer[] {
  if (customers.length === 0) {
    seedCustomersData();
  }
  return [...customers].sort((a, b) => {
    // Sort by last booking date (most recent first)
    return b.lastBookingDate.localeCompare(a.lastBookingDate);
  });
}

export function getCustomerById(id: string): Customer | undefined {
  return getAllCustomers().find((c) => c.id === id);
}

export function getCustomersByTag(tag: CustomerTag): Customer[] {
  return getAllCustomers().filter((c) => c.tags.includes(tag));
}

export function getBookingHistoryByCustomer(customerId: string): BookingHistory[] {
  if (bookingHistory.length === 0) {
    seedCustomersData();
  }
  return bookingHistory
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getMessageHistoryByCustomer(customerId: string): MessageHistory[] {
  if (messageHistory.length === 0) {
    seedCustomersData();
  }
  return messageHistory
    .filter((m) => m.customerId === customerId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function searchCustomers(query: string): Customer[] {
  const lowerQuery = query.toLowerCase();
  return getAllCustomers().filter(
    (c) =>
      c.firstName.toLowerCase().includes(lowerQuery) ||
      c.lastName.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      (c.phone && c.phone.includes(lowerQuery))
  );
}

function generateSalesOpportunities(customers: Customer[]): SalesOpportunity[] {
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
    "Group Tour (20+ people)",
    "Corporate Team Building",
  ];
  
  const stages: SalesStage[] = ["inquiry", "quoted", "followup", "booked", "completed"];
  const opportunities: SalesOpportunity[] = [];
  
  // Generate 30-40 opportunities
  for (let i = 0; i < 35; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const productName = products[Math.floor(Math.random() * products.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const guests = Math.floor(1 + Math.random() * 15);
    const basePrice = 50 + Math.random() * 300;
    const estimatedValue = Math.round(basePrice * guests);
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60));
    
    const updatedAt = new Date(createdAt);
    updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * 30));
    
    const preferredDate = new Date();
    preferredDate.setDate(preferredDate.getDate() + Math.floor(7 + Math.random() * 60));
    
    opportunities.push({
      id: `opp-${i + 1}`,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      productName,
      stage,
      estimatedValue,
      currency: "EUR",
      guests,
      preferredDate: stage !== "completed" ? preferredDate.toISOString().split("T")[0] : undefined,
      notes: Math.random() > 0.7 ? "Interested in group discount" : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  }
  
  return opportunities;
}

export function seedSalesOpportunities() {
  if (customers.length === 0) {
    seedCustomersData();
  }
  salesOpportunities = generateSalesOpportunities(customers);
}

export function getAllSalesOpportunities(): SalesOpportunity[] {
  if (salesOpportunities.length === 0) {
    seedSalesOpportunities();
  }
  return [...salesOpportunities];
}

export function getSalesOpportunitiesByStage(stage: SalesStage): SalesOpportunity[] {
  return getAllSalesOpportunities().filter((opp) => opp.stage === stage);
}

export function updateSalesOpportunityStage(id: string, newStage: SalesStage): void {
  const opp = salesOpportunities.find((o) => o.id === id);
  if (opp) {
    opp.stage = newStage;
    opp.updatedAt = new Date().toISOString();
  }
}

export function addSalesOpportunity(opportunity: Omit<SalesOpportunity, "id" | "createdAt" | "updatedAt">): SalesOpportunity {
  const newOpp: SalesOpportunity = {
    ...opportunity,
    id: `opp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  salesOpportunities.push(newOpp);
  return newOpp;
}

// Initialize on import
seedCustomersData();
seedSalesOpportunities();
