import api from './api'
import type { AvailabilityResponse, Tour } from '../types'

export async function listTours(): Promise<Tour[]> {
  const { data } = await api.get<Tour[]>('/tours')
  return data
}

export async function getTour(id: number): Promise<Tour> {
  const { data } = await api.get<Tour>(`/tours/${id}`)
  return data
}

export async function getAvailability(
  tourId: number,
  date: string,
): Promise<AvailabilityResponse> {
  const { data } = await api.get<AvailabilityResponse>(
    `/tours/${tourId}/availability`,
    { params: { date } },
  )
  return data
}
