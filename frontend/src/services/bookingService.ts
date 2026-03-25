import api from './api'
import type { BookingRequest, BookingResponse, ReservationRead } from '../types'

export async function createBooking(payload: BookingRequest): Promise<BookingResponse> {
  const { data } = await api.post<BookingResponse>('/bookings', payload)
  return data
}

export async function getBooking(reservationId: number): Promise<ReservationRead> {
  const { data } = await api.get<ReservationRead>(`/bookings/${reservationId}`)
  return data
}
