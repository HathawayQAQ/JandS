import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import TourDetailPage from './pages/TourDetailPage'
import BookingPage from './pages/BookingPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import BookingCancelPage from './pages/BookingCancelPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/book/:tourId" element={<BookingPage />} />
          <Route path="/bookings/:reservationId/success" element={<BookingSuccessPage />} />
          <Route path="/bookings/:reservationId/cancel" element={<BookingCancelPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
