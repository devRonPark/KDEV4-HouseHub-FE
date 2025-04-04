export interface Property {
    id: string
    name: string
    type: string
    location: string
    price: number
    size: number
    description?: string
    images?: string[]
    status?: "available" | "pending" | "sold"
    features?: string[]
  }
  
  