import type { Property } from "./property"

export type ConsultationType = "visit" | "phone" | "email" | "other"

export interface Consultation {
  id: string
  customerId: string
  date: string
  type: ConsultationType
  content: string
  agent?: {
    id: string
    name: string
  }
  relatedProperties?: Property[]
}

