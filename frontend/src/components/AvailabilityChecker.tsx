import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailability } from '../services/tourService'
import type { AvailabilityResponse } from '../types'

interface Props {
  tourId: number
}

export default function AvailabilityChecker({ tourId }: Props) {
  const navigate = useNavigate()
  const [date, setDate] = useState('')
  const [result, setResult] = useState<AvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleCheck() {
    if (!date) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await getAvailability(tourId, date)
      setResult(data)
    } catch {
      setError('Could not check availability. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleBook() {
    navigate(`/book/${tourId}?date=${date}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Check Availability</h3>

      <div className="flex gap-3">
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={handleCheck}
          disabled={!date || loading}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Seats available</span>
            <span
              className={`font-semibold ${result.seats_available > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {result.seats_available} / {result.max_seats}
            </span>
          </div>

          {result.seats_available > 0 ? (
            <button
              onClick={handleBook}
              className="w-full py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
            >
              Book for {date}
            </button>
          ) : (
            <p className="text-sm text-center text-red-600 font-medium">
              Fully booked — please try another date.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
