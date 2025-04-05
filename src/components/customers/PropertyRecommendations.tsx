"use client"

import { useState, useEffect } from "react"
import { Heart, Share2, ExternalLink } from "react-feather"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import type { Customer } from "../../types/customer"

// 타입 정의 업데이트
interface Property {
  id: string
  name: string
  type: string
  location: string
  price: number
  size: number
  description: string
  images: string[]
}

interface PriceRange {
  min: number
  max: number
}

interface SizeRange {
  min: number
  max: number
}

interface CustomerInterests {
  propertyTypes?: string[]
  locations?: string[]
  priceRange?: PriceRange
  size?: SizeRange
}

interface PropertyRecommendationsProps {
  customer: Customer & { interests?: CustomerInterests }
}

// 임시 매물 데이터 (실제 구현에서는 API 연동)
const MOCK_PROPERTIES: Property[] = [/* 기존 데이터 유지 */]

const PropertyRecommendations = ({ customer }: PropertyRecommendationsProps) => {
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 고급 필터링 로직
  const applyFilters = (properties: Property[]): Property[] => {
    return properties.filter(property => {
      const matchesType = !customer.interests?.propertyTypes?.length || 
        customer.interests.propertyTypes.includes(property.type)
      
      const matchesLocation = !customer.interests?.locations?.length || 
        customer.interests.locations.includes(property.location)

      const matchesPrice = !customer.interests?.priceRange || 
        (property.price >= customer.interests.priceRange.min && 
         property.price <= customer.interests.priceRange.max)

      const matchesSize = !customer.interests?.size || 
        (property.size >= customer.interests.size.min && 
         property.size <= customer.interests.size.max)

      return matchesType && matchesLocation && matchesPrice && matchesSize
    })
  }

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true)
      
      // 실제 구현시 API 호출로 교체
      const filtered = applyFilters(MOCK_PROPERTIES)
      
      setRecommendedProperties(filtered.slice(0, 6))
      setIsLoading(false)
    }

    loadRecommendations()
  }, [customer])

  // 로딩 및 빈 상태 처리
  if (isLoading) {
    return <div className="loader">Loading...</div>
  }

  return (
    <div className="recommendation-grid">
      {recommendedProperties.map(property => (
        <div key={property.id} className="property-card">
          {/* 이미지 섹션 */}
          <div className="image-section">
            <img src="/placeholder.svg" alt={property.name} />
            <div className="action-buttons">
              <button><Heart size={16} /></button>
              <button><Share2 size={16} /></button>
            </div>
          </div>

          {/* 정보 표시 섹션 */}
          <div className="info-section">
            <div className="header">
              <div>
                <h3>{property.name}</h3>
                <p>{property.location}</p>
              </div>
              <Badge variant="primary">{property.type}</Badge>
            </div>

            <div className="price-info">
              <p>{property.price.toLocaleString()}만원</p>
              <p>{property.size}평</p>
            </div>

            <p className="description">{property.description}</p>

            <div className="action-buttons">
              <Button variant="outline" leftIcon={<Share2 />}>
                공유하기
              </Button>
              <Button variant="primary" leftIcon={<ExternalLink />}>
                상세보기
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PropertyRecommendations
