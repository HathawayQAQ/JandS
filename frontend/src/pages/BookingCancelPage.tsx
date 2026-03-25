import { Link, useParams } from 'react-router-dom'

export default function BookingCancelPage() {
  const { reservationId } = useParams<{ reservationId: string }>()

  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✕</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
      <p className="text-gray-500 mb-8">
        Your payment was not completed. Your reservation (#{reservationId}) has been held
        for a short period — return to the booking page to try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Browse tours
        </Link>
      </div>
    </main>
  )
}
