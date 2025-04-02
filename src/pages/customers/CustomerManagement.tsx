"use client"

import { useState } from "react"
import { Download, Plus, ChevronLeft, ChevronRight } from "react-feather"
import MainLayout from "../../components/layout/MainLayout"
import Card from "../../components/ui/Card"
import Table from "../../components/ui/Table"
import Button from "../../components/ui/Button"

interface Customer {
  id: string
  name: string
  phone: string
  propertyInterest: string
  lastConsultation: string
}

const CustomerManagement = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(33)

  // 샘플 데이터
  const customers: Customer[] = [
    {
      id: "1",
      name: "홍길동",
      phone: "010-1234-5678",
      propertyInterest: "아파트 매매",
      lastConsultation: "2024-02-20",
    },
    {
      id: "2",
      name: "김철수",
      phone: "010-8765-4321",
      propertyInterest: "오피스텔 전세",
      lastConsultation: "2024-02-19",
    },
  ]

  const columns = [
    {
      key: "name",
      header: "고객명",
      render: (customer: Customer) => <span>{customer.name}</span>,
    },
    {
      key: "phone",
      header: "연락처",
      render: (customer: Customer) => <span>{customer.phone}</span>,
    },
    {
      key: "propertyInterest",
      header: "관심 매물",
      render: (customer: Customer) => <span>{customer.propertyInterest}</span>,
    },
    {
      key: "lastConsultation",
      header: "최근 상담일",
      render: (customer: Customer) => <span>{customer.lastConsultation}</span>,
    },
    {
      key: "actions",
      header: "관리",
      render: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            수정
          </Button>
          <Button variant="danger" size="sm">
            삭제
          </Button>
        </div>
      ),
    },
  ]

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">총 고객 수</div>
            <div className="flex items-end">
              <span className="text-2xl font-bold">324</span>
              <span className="ml-2 text-sm text-green-500">+12%</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">매도 고객</div>
            <div className="flex items-end">
              <span className="text-2xl font-bold">156</span>
              <span className="ml-2 text-sm text-green-500">+8%</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">매수 고객</div>
            <div className="flex items-end">
              <span className="text-2xl font-bold">168</span>
              <span className="ml-2 text-sm text-red-500">-3%</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-1">전월 대비</div>
            <div className="flex items-end">
              <span className="text-2xl font-bold">+5.2%</span>
            </div>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">고객 관리</h2>
            <div className="flex space-x-2">
              <Button variant="outline" leftIcon={<Download size={16} />}>
                엑셀 다운로드
              </Button>
              <Button variant="outline" leftIcon={<Download size={16} />}>
                엑셀 업로드
              </Button>
              <Button leftIcon={<Plus size={16} />}>고객 등록</Button>
            </div>
          </div>

          <Table columns={columns} data={customers} keyExtractor={(customer) => customer.id} />

          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">총 324 명 중 1 - 10</div>
            <div className="flex">
              <button
                className="px-2 py-1 border border-gray-300 rounded-l-md"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 border-t border-b border-r border-gray-300 ${
                    currentPage === page ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-1 border-t border-b border-r border-gray-300">...</button>
              <button
                className="px-3 py-1 border-t border-b border-r border-gray-300"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
              <button
                className="px-2 py-1 border-t border-b border-r border-gray-300 rounded-r-md"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CustomerManagement

