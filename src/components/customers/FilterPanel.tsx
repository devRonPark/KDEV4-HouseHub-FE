"use client"

import { useState, useEffect } from "react"
import Button from "../../components/ui/Button"
import Select from "../../components/ui/Select"

interface FilterPanelProps {
  initialFilters: {
    status?: string
    propertyTypes?: string[]
    locations?: string[]
    tags?: string[]
  }
  onApply: (filters: any) => void
  onReset: () => void
  onCancel: () => void
}

const FilterPanel = ({ initialFilters, onApply, onReset, onCancel }: FilterPanelProps) => {
  const [status, setStatus] = useState<string>(initialFilters.status || "")
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initialFilters.propertyTypes || [])
  const [locations, setLocations] = useState<string[]>(initialFilters.locations || [])
  const [tags, setTags] = useState<string[]>(initialFilters.tags || [])

  useEffect(() => {
    setStatus(initialFilters.status || "")
    setPropertyTypes(initialFilters.propertyTypes || [])
    setLocations(initialFilters.locations || [])
    setTags(initialFilters.tags || [])
  }, [initialFilters])

  const handleApply = () => {
    const filters: any = {}

    if (status) filters.status = status
    if (propertyTypes.length > 0) filters.propertyTypes = propertyTypes
    if (locations.length > 0) filters.locations = locations
    if (tags.length > 0) filters.tags = tags

    onApply(filters)
  }

  // 관심 매물 유형 토글
  const togglePropertyType = (type: string) => {
    setPropertyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // 관심 지역 토글
  const toggleLocation = (location: string) => {
    setLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  // 태그 토글
  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">고객 상태</label>
          <Select
            value={status}
            onChange={(value) => setStatus(value)}
            options={[
              { value: "", label: "전체" },
              { value: "active", label: "활성" },
              { value: "inactive", label: "비활성" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">관심 매물 유형</label>
          <div className="flex flex-wrap gap-2">
            {["아파트", "오피스텔", "빌라", "단독주택", "상가", "사무실"].map((type) => (
              <button
                key={type}
                type="button"
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  propertyTypes.includes(type)
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => togglePropertyType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">관심 지역</label>
          <div className="flex flex-wrap gap-2">
            {["강남구", "서초구", "송파구", "마포구", "용산구", "성동구", "강서구", "양천구", "강동구"].map(
              (location) => (
                <button
                  key={location}
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    locations.includes(location)
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => toggleLocation(location)}
                >
                  {location}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">태그</label>
          <div className="flex flex-wrap gap-2">
            {["VIP", "투자자", "전세 희망", "급매물 관심", "신규", "외국인"].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tags.includes(tag) ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onReset}>
          초기화
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="button" variant="primary" onClick={handleApply}>
          적용
        </Button>
      </div>
    </div>
  )
}

export default FilterPanel

