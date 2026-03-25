import type { TourStop } from '../types'

interface Props {
  stops: TourStop[]
}

export default function TourStopList({ stops }: Props) {
  if (stops.length === 0) return null

  return (
    <ol className="relative border-l border-brand-200 ml-3 space-y-6">
      {stops.map((stop) => (
        <li key={stop.order} className="ml-6">
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold ring-4 ring-white">
            {stop.order}
          </span>
          <h3 className="font-semibold text-gray-900">{stop.name}</h3>
          {stop.description && (
            <p className="text-sm text-gray-500 mt-0.5">{stop.description}</p>
          )}
          {stop.duration_minutes != null && (
            <span className="mt-1 inline-block text-xs text-brand-600 bg-brand-50 rounded-full px-2 py-0.5">
              ~{stop.duration_minutes} min
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
