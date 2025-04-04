"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, User } from "react-feather"
import Input from "../ui/Input"
import { searchCustomers } from "../../api/customer"
import type { Customer } from "../../types/property"
import { useToast } from "../../context/ToastContext"

interface CustomerSearchInputProps {
  onCustomerSelect: (customer: Customer) => void
  selectedCustomer: Customer | null
}

const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({ onCustomerSelect, selectedCustomer }) => {
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchResultsRef = useRef<HTMLDivElement>(null)

  // 검색 결과 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 검색 쿼리가 변경될 때마다 검색 실행
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return

    setIsSearching(true)
    try {
      const response = await searchCustomers(searchQuery)
      if (response.success && response.data) {
        setSearchResults(response.data.customers)
        setShowResults(true)
      } else {
        showToast(response.error || "고객 검색 중 오류가 발생했습니다.", "error")
      }
    } catch (error) {
      showToast("고객 검색 중 오류가 발생했습니다.", "error")
    } finally {
      setIsSearching(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer)
    setSearchQuery("")
    setShowResults(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (selectedCustomer) {
      onCustomerSelect(null)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Input
            label="고객 검색"
            placeholder="이름 또는 전화번호로 검색 (2글자 이상)"
            value={searchQuery}
            onChange={handleInputChange}
            leftIcon={<Search size={18} />}
            required
          />
        </div>
      </div>

      {selectedCustomer && (
        <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
              {selectedCustomer.email && <p className="text-sm text-gray-500">{selectedCustomer.email}</p>}
            </div>
          </div>
        </div>
      )}

      {showResults && searchResults.length > 0 && (
        <div
          ref={searchResultsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
        >
          <ul className="py-1">
            {searchResults.map((customer) => (
              <li
                key={customer.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCustomerSelect(customer)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isSearching && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg
            className="animate-spin h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  )
}

export default CustomerSearchInput

