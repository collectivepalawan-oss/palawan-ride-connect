// Pricing rules for Palawan Collective Transport

export type TransportType = "shared_van" | "private_van" | "boat" | "speedboat" | "4x4";

interface PricingResult {
  total: number;
  perPerson?: number;
  error?: string;
  warning?: string;
  maxCapacity: number;
  minPassengers?: number;
}

// Private van and 4x4 flat rates
const PRIVATE_RATES: Record<string, number> = {
  "Puerto Princesa-El Nido": 6500,
  "El Nido-Puerto Princesa": 6500,
  "Puerto Princesa-Port Barton": 4500,
  "Port Barton-Puerto Princesa": 4500,
  "Puerto Princesa-San Vicente": 4500,
  "San Vicente-Puerto Princesa": 4500,
  "Puerto Princesa-Lumambong Beach": 4500,
  "Lumambong Beach-Puerto Princesa": 4500,
  "Port Barton-El Nido": 4500,
  "El Nido-Port Barton": 4500,
  "Port Barton-San Vicente": 4500,
  "San Vicente-Port Barton": 4500,
  "Port Barton-Lumambong Beach": 4500,
  "Lumambong Beach-Port Barton": 4500,
  "San Vicente-El Nido": 4500,
  "El Nido-San Vicente": 4500,
  "San Vicente-Lumambong Beach": 4500,
  "Lumambong Beach-San Vicente": 4500,
  "Lumambong Beach-El Nido": 4500,
  "El Nido-Lumambong Beach": 4500,
};

export function calculatePrice(
  transportType: TransportType,
  pickup: string,
  dropoff: string,
  passengers: number
): PricingResult {
  const route = `${pickup}-${dropoff}`;

  switch (transportType) {
    case "private_van":
    case "4x4": {
      const flatRate = PRIVATE_RATES[route];
      if (!flatRate) {
        return {
          total: 0,
          error: "Route not available for this transport type",
          maxCapacity: 8,
        };
      }
      if (passengers > 8) {
        return {
          total: 0,
          error: "Maximum 8 passengers. Please book a second vehicle or reduce passenger count.",
          maxCapacity: 8,
        };
      }
      return {
        total: flatRate,
        maxCapacity: 8,
      };
    }

    case "shared_van": {
      const perPerson = 750;
      return {
        total: passengers * perPerson,
        perPerson,
        maxCapacity: 8,
      };
    }

    case "boat": {
      const perPerson = 3500;
      if (passengers < 8) {
        return {
          total: 0,
          error: "Minimum 8 people required for a shared boat.",
          maxCapacity: 20,
          minPassengers: 8,
        };
      }
      return {
        total: passengers * perPerson,
        perPerson,
        maxCapacity: 20,
        minPassengers: 8,
        warning: "Lunch included",
      };
    }

    case "speedboat": {
      const flatRate = 30000;
      if (passengers > 20) {
        return {
          total: 0,
          error: "Maximum 20 passengers. Please book a second speedboat or reduce passenger count.",
          maxCapacity: 20,
        };
      }
      return {
        total: flatRate,
        maxCapacity: 20,
        warning: "Full day rate, up to 20 passengers",
      };
    }

    default:
      return {
        total: 0,
        error: "Invalid transport type",
        maxCapacity: 0,
      };
  }
}
