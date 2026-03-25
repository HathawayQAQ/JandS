import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import BookingForm from '../components/BookingForm'
import { getTour } from '../services/tourService'
import type { Tour } from '../types'

export default function BookingPage() {
  const { tourId } = useParams<{ tourId: string }>()
  const [searchParams] = useSearchParams()
  const initialDate = searchParams.get('date') ?? ''

  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tourId) return
    getTour(Number(tourId))
      .then(setTour)
      .catch(() => setError('Could not load tour details.'))
      .finally(() => setLoading(false))
  }, [tourId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-red-600">{error || 'Tour not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline text-sm">
          ← Back to tours
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link
        to={`/tours/${tour.id}`}
        className="text-sm text-brand-600 hover:underline mb-6 inline-block"
      >
        ← {tour.name}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <BookingForm tour={tour} initialDate={initialDate} />
      </div>
    </main>
  )
}
