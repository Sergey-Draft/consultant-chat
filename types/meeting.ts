export type MeetingStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
}