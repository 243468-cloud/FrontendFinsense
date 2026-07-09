import apiClient from '../lib/apiClient';

export interface CalendarEvent {
  id: string;
  title: string;
  amount?: number;
  date: string;
  emoji?: string;
  type: string;
}

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const response = await apiClient.get('/calendar-events');
  return response.data;
};

export const addCalendarEvent = async (data: Omit<CalendarEvent, 'id' | 'type'>): Promise<CalendarEvent> => {
  const response = await apiClient.post('/calendar-events', data);
  return response.data;
};

export const deleteCalendarEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/calendar-events/${id}`);
};
