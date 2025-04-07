import type { FindPropertyResDto } from './property';

export type ConsultationType = 'visit' | 'phone' | 'email' | 'other';

export interface Consultation {
  id: number;
  customerId: number;
  date: string;
  type: ConsultationType;
  content: string;
  agent?: {
    id: string;
    name: string;
  };
  relatedProperties?: FindPropertyResDto[];
}
