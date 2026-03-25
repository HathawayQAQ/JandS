import { useState } from 'react'
import type { BookingRequest, Tour } from '../types'
import { createBooking } from '../services/bookingService'

interface Props {
  tour: Tour
  initialDate: string
}

const defaultPassengers = { adults: 1, children: 0, seniors: 0 }

export default function BookingForm({ tour, initialDate }: Props) {
  const [date, setDate] = useState(initialDate)
  const [passengers, setPassengers] = useState(defaultPassengers)
  const [customer, setCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
  })
  const [specialRequests, setSpecialRequests] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function paxPrice(type: 'adult' | 'child' | 'senior') {
    return parseFloat(
      tour.pricing_rules.find((r) => r.passenger_type === type)?.price_cad ?? '0',
    )
  }

  const estimatedTotal =
    passengers.adults * paxPrice('adult') +
    passengers.children * paxPrice('child') +
    passengers.seniors * paxPrice('senior')

  function setPax(key: keyof typeof defaultPassengers, value: number) {
    setPassengers((prev) => ({ ...prev, [key]: Math.max(0, value) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (passengers.adults + passengers.children + passengers.seniors < 1) {
      setError('At least one passenger is required.')
      return
    }

    setSubmitting(true)
    const payload: BookingRequest = {
      tour_id: tour.id,
      tour_date: date,
      ...passengers,
      special_requests: specialRequests || undefined,
      customer: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || undefined,
        country: customer.country || undefined,
      },
    }

    try {
      const result = await createBooking(payload)
      window.location.href = result.checkout_url
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Booking failed. Please try again.'
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Tour Date</h2>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </section>

      {/* Passengers */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Passengers</h2>
        <div className="grid grid-cols-3 gap-4">
          {(['adults', 'children', 'seniors'] as const).map((type) => (
            <div key={type}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                {type}
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPax(type, passengers[type] - 1)}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold"
                >
                  −
                </button>
                <span className="flex-1 text-center text-sm font-semibold py-2">
                  {passengers[type]}
                </span>
                <button
                  type="button"
                  onClick={() => setPax(type, passengers[type] + 1)}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">
                CA${paxPrice(type === 'adults' ? 'adult' : type === 'children' ? 'child' : 'senior').toFixed(2)} each
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customer.first_name}
              onChange={(e) => setCustomer((p) => ({ ...p, first_name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customer.last_name}
              onChange={(e) => setCustomer((p) => ({ ...p, last_name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={customer.email}
              onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
            <input
              type="text"
              value={customer.country}
              onChange={(e) => setCustomer((p) => ({ ...p, country: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </section>

      {/* Special Requests */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Special Requests</h2>
        <textarea
          rows={3}
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Accessibility needs, dietary requirements, etc."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </section>

      {/* Summary + submit */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-xs text-gray-500">Estimated total</p>
          <p className="text-2xl font-bold text-brand-700">
            CA${estimatedTotal.toFixed(2)}
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Redirecting to payment…' : 'Proceed to Payment'}
        </button>
      </div>
    </form>
  )
}
