// ---- Tour ----

export interface TourStop {
  order: number
  name: string
  description: string | null
  duration_minutes: number | null
}

export interface PricingRule {
  passenger_type: 'adult' | 'child' | 'senior'
  price_cad: string // Decimal serialised as string
  season_label: string | null
}

export interface Tour {
  id: number
  name: string
  slug: string
  description: string | null
  duration_hours: number
  max_seats: number
  vehicle_type: string
  departure_office: 'canada' | 'us' | 'both'
  stops: TourStop[]
  pricing_rules: PricingRule[]
}

// ---- Availability ----

export interface AvailabilityResponse {
  tour_id: number
  tour_date: string
  max_seats: number
  seats_booked: number
  seats_available: number
}

// ---- Booking ----

export interface CustomerCreate {
  first_name: string
  last_name: string
  email: string
  phone?: string
  country?: string
}

export interface BookingRequest {
  tour_id: number
  tour_date: string
  adults: number
  children: number
  seniors: number
  special_requests?: string
  customer: CustomerCreate
}

export interface BookingResponse {
  reservation_id: number
  reference: string
  status: string
  total_amount_cad: string
  checkout_url: string
}

export interface ReservationRead {
  id: number
  reference: string
  tour_id: number
  tour_date: string
  adults: number
  children: number
  seniors: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  special_requests: string | null
  cancelled_at: string | null
  cancel_reason: string | null
}
