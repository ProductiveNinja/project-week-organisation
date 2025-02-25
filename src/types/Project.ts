export type Project = {
  id: number;
  title: string;
  maxParticipants: number;
  remainingSeats?: number;
  cancelled?: boolean;
};
