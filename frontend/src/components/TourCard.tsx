import { Link } from 'react-router-dom'
import type { Tour } from '../types'

const officeLabel: Record<Tour['departure_office'], string> = {
  canada: 'Departs: Canada',
  us: 'Departs: US',
  both: 'Departs: Canada & US',
}

interface Props {
  tour: Tour
}

export default function TourCard({ tour }: Props) {
  const adultPrice = tour.pricing_rules.find((r) => r.passenger_type === 'adult')

  return (
    <Link
      to={`/tours/${tour.id}`}
      className="block bg-white rounded-2xl shadow hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{tour.name}</h2>
        {tour.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tour.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="bg-gray-100 rounded-full px-3 py-1">
            {tour.duration_hours}h
          </span>
          <span className="bg-gray-100 rounded-full px-3 py-1 capitalize">
            {tour.vehicle_type}
          </span>
          <span className="bg-gray-100 rounded-full px-3 py-1">
            {officeLabel[tour.departure_office]}
          </span>
        </div>
      </div>
      <div className="px-6 py-3 bg-brand-50 border-t border-brand-100 flex items-center justify-between">
        <span className="text-xs text-brand-700 font-medium">
          {tour.stops.length} stop{tour.stops.length !== 1 ? 's' : ''}
        </span>
        {adultPrice && (
          <span className="text-sm font-bold text-brand-700">
            From CA${adultPrice.price_cad}
          </span>
        )}
      </div>
    </Link>
  )
}
