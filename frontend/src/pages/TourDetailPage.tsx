import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AvailabilityChecker from '../components/AvailabilityChecker'
import PricingTable from '../components/PricingTable'
import TourStopList from '../components/TourStopList'
import { getTour } from '../services/tourService'
import type { Tour } from '../types'

const officeLabel: Record<Tour['departure_office'], string> = {
  canada: 'Canada',
  us: 'United States',
  both: 'Canada & United States',
}

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getTour(Number(id))
      .then(setTour)
      .catch(() => setError('Tour not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-red-600">{error || 'Tour not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline text-sm">
          ← Back to tours
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-brand-600 hover:underline mb-6 inline-block">
        ← All tours
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tour.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="bg-gray-100 rounded-full px-3 py-1">{tour.duration_hours}h duration</span>
              <span className="bg-gray-100 rounded-full px-3 py-1 capitalize">{tour.vehicle_type}</span>
              <span className="bg-gray-100 rounded-full px-3 py-1">
                Departs: {officeLabel[tour.departure_office]}
              </span>
              <span className="bg-gray-100 rounded-full px-3 py-1">
                Max {tour.max_seats} seats
              </span>
            </div>
            {tour.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{tour.description}</p>
            )}
          </div>

          {tour.stops.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h2>
              <TourStopList stops={tour.stops} />
            </div>
          )}

          {tour.pricing_rules.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <PricingTable rules={tour.pricing_rules} />
              </div>
            </div>
          )}
        </div>

        {/* Right column — sticky sidebar */}
        <div className="lg:sticky lg:top-6 self-start">
          <AvailabilityChecker tourId={tour.id} />
        </div>
      </div>
    </main>
  )
}
