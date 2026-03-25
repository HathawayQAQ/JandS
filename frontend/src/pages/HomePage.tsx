import { useEffect, useState } from 'react'
import TourCard from '../components/TourCard'
import { listTours } from '../services/tourService'
import type { Tour } from '../types'

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listTours()
      .then(setTours)
      .catch(() => setError('Failed to load tours. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Niagara Falls Tours</h1>
        <p className="mt-2 text-gray-500">
          Guided tours departing from Canada and the US — book your spot today.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !error && tours.length === 0 && (
        <p className="text-gray-500">No tours available at the moment.</p>
      )}

      {!loading && tours.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </main>
  )
}
