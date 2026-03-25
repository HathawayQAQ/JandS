import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBooking } from '../services/bookingService'
import type { ReservationRead } from '../types'

const statusColour: Record<ReservationRead['status'], string> = {
  pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  confirmed: 'text-green-700 bg-green-50 border-green-200',
  completed: 'text-brand-700 bg-brand-50 border-brand-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
}

export default function BookingSuccessPage() {
  const { reservationId } = useParams<{ reservationId: string }>()
  const [reservation, setReservation] = useState<ReservationRead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reservationId) return
    getBooking(Number(reservationId))
      .then(setReservation)
      .finally(() => setLoading(false))
  }, [reservationId])

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mx-auto" />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Booking not found.</p>
        <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline text-sm">
          Back to tours
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✓</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Received!</h1>
      <p className="text-gray-500 mb-8">
        Your payment is being processed. You'll receive a confirmation email shortly.
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left space-y-3">
        <Row label="Reference" value={reservation.reference} />
        <Row label="Tour date" value={reservation.tour_date} />
        <Row
          label="Passengers"
          value={[
            reservation.adults > 0 && `${reservation.adults} adult(s)`,
            reservation.children > 0 && `${reservation.children} child(ren)`,
            reservation.seniors > 0 && `${reservation.seniors} senior(s)`,
          ]
            .filter(Boolean)
            .join(', ')}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColour[reservation.status]}`}
          >
            {reservation.status}
          </span>
        </div>
      </div>

      <Link
        to="/"
        className="mt-8 inline-block text-brand-600 hover:underline text-sm font-medium"
      >
        ← Browse more tours
      </Link>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}
