"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Edit, Trash2, ArrowLeft, Plus, Share2 } from "react-feather"
import DashboardLayout from "../../components/layout/DashboardLayout"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import Card from "../../components/ui/Card"
import Tabs from "../../components/ui/Tabs"
import Modal from "../../components/ui/Modal"
import CustomerForm from "../../components/customers/CustomerForm"
import ConsultationForm from "../../components/customers/ConsultationForm"
import ConsultationList from "../../components/customers/ConsultationList"
import PropertyRecommendations from "../../components/customers/PropertyRecommendations"
import { formatDate, formatPhoneNumber } from "../../utils/format"
import { useToast } from "../../context/ToastContext"
import type { Customer } from "../../types/customer"
import type { Consultation } from "../../types/consultation"

// 임시 데이터 (실제로는 API에서 가져옴)
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "김철수",
    email: "kim@example.com",
    phone: "010-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    createdAt: "2023-01-15T09:30:00Z",
    updatedAt: "2023-03-20T14:45:00Z",
    status: "active",
    interests: {
      propertyTypes: ["아파트", "오피스텔"],
      locations: ["강남구", "서초구"],
      priceRange: {
        min: 50000,
        max: 100000,
      },
      size: {
        min: 20,
        max: 40,
      },
    },
    consultationCount: 3,
    lastConsultation: "2023-03-20T14:45:00Z",
    tags: ["VIP", "급매물 관심"],
    memo: "자녀 교육 환경을 중요시하며, 역세권 선호. 투자 목적보다는 실거주 목적.",
    ageGroup: 30,
    gender: "MALE",
  },
  {
    id: "2",
    name: "이영희",
    email: "lee@example.com",
    phone: "010-9876-5432",
    address: "서울시 서초구 서초대로 456",
    createdAt: "2023-02-10T11:20:00Z",
    updatedAt: "2023-04-05T10:15:00Z",
    status: "active",
    interests: {
      propertyTypes: ["빌라", "단독주택"],
      locations: ["마포구", "용산구"],
      priceRange: {
        min: 30000,
        max: 70000,
      },
      size: {
        min: 30,
        max: 60,
      },
    },
    consultationCount: 2,
    lastConsultation: "2023-04-05T10:15:00Z",
    tags: ["투자자"],
    memo: "투자 목적으로 수익률이 좋은 매물 선호. 월세 수익 중요시.",
    ageGroup: 40,
    gender: "FEMALE",
  },
]

// 임시 상담 데이터
const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: "1",
    customerId: "1",
    date: "2023-03-20T14:45:00Z",
    type: "visit",
    content: "강남구 아파트 매물 3개 안내. 테헤란로 인근 오피스텔에 관심 표현.",
    agent: {
      id: "agent1",
      name: "박상담",
    },
    relatedProperties: [
      {
        id: "prop1",
        name: "테헤란로 스카이 오피스텔",
        type: "오피스텔",
        location: "강남구",
      },
      {
        id: "prop2",
        name: "강남 센트럴 아파트",
        type: "아파트",
        location: "강남구",
      },
    ],
  },
  {
    id: "2",
    customerId: "1",
    date: "2023-02-15T10:30:00Z",
    type: "phone",
    content: "서초구 신축 아파트 관련 문의. 가격대와 입주 시기 안내.",
    agent: {
      id: "agent2",
      name: "김에이전트",
    },
    relatedProperties: [
      {
        id: "prop3",
        name: "서초 그린 아파트",
        type: "아파트",
        location: "서초구",
      },
    ],
  },
  {
    id: "3",
    customerId: "1",
    date: "2023-01-20T13:15:00Z",
    type: "email",
    content: "초기 상담. 고객의 선호 지역과 예산 파악.",
    agent: {
      id: "agent1",
      name: "박상담",
    },
  },
]

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)

  // 데이터 로딩 (실제로는 API 호출)
  useEffect(() => {
    const loadCustomerData = async () => {
      setIsLoading(true)
      try {
        // 실제 구현에서는 API 호출
        // const response = await fetchCustomer(id);
        // setCustomer(response.data);

        // 임시 데이터 사용
        setTimeout(() => {
          const foundCustomer = MOCK_CUSTOMERS.find((c) => c.id === id)
          if (foundCustomer) {
            setCustomer(foundCustomer)

            // 해당 고객의 상담 이력 로드
            const customerConsultations = MOCK_CONSULTATIONS.filter((c) => c.customerId === id)
            setConsultations(customerConsultations)
          } else {
            showToast("고객 정보를 찾을 수 없습니다.", "error")
            navigate("/customers")
          }
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error("Failed to load customer:", error)
        showToast("고객 정보를 불러오는데 실패했습니다.", "error")
        setIsLoading(false)
        navigate("/customers")
      }
    }

    if (id) {
      loadCustomerData()
    }
  }, [id, navigate, showToast])

  // 고객 정보 수정
  const handleUpdateCustomer = (customerData: Partial<Customer>) => {
    // 실제 구현에서는 API 호출
    // const response = await updateCustomer(id, customerData);

    // 임시 구현
    setCustomer((prev) => {
      if (!prev) return null
      return { ...prev, ...customerData, updatedAt: new Date().toISOString() }
    })

    showToast("고객 정보가 성공적으로 수정되었습니다.", "success")
    setIsEditModalOpen(false)
  }

  // 고객 삭제
  const handleDeleteCustomer = () => {
    // 실제 구현에서는 API 호출
    // await deleteCustomer(id);

    showToast("고객이 성공적으로 삭제되었습니다.", "success")
    navigate("/customers")
  }

  // 상담 기록 추가
  const handleAddConsultation = (consultationData: Partial<Consultation>) => {
    // 실제 구현에서는 API 호출
    // const response = await createConsultation({ ...consultationData, customerId: id });

    // 임시 구현
    const newConsultation: Consultation = {
      id: `${consultations.length + 1}`,
      customerId: id || "",
      date: new Date().toISOString(),
      type: consultationData.type || "visit",
      content: consultationData.content || "",
      agent: {
        id: "agent1",
        name: "박상담",
      },
      relatedProperties: consultationData.relatedProperties || [],
    }

    setConsultations((prev) => [newConsultation, ...prev])

    // 고객 정보 업데이트 (상담 횟수 증가)
    setCustomer((prev) => {
      if (!prev) return null
      return {
        ...prev,
        consultationCount: (prev.consultationCount || 0) + 1,
        lastConsultation: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    showToast("상담 기록이 성공적으로 추가되었습니다.", "success")
    setIsConsultationModalOpen(false)
  }

  if (isLoading || !customer) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/customers")}
          >
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          {customer.status === "active" ? (
            <Badge variant="success" className="ml-2">
              활성
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              비활성
            </Badge>
          )}
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" leftIcon={<Edit size={16} />} onClick={() => setIsEditModalOpen(true)}>
            수정
          </Button>
          <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={() => setIsDeleteModalOpen(true)}>
            삭제
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 고객 정보 카드 */}
        <div className="lg:col-span-1">
          <Card title="고객 정보" className="h-full">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">연락처</h4>
                <p className="mt-1">{formatPhoneNumber(customer.phone)}</p>
                {customer.email && <p className="text-gray-600">{customer.email}</p>}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">인구통계</h4>
                <p className="mt-1">
                  {customer.ageGroup}대 /{" "}
                  {customer.gender === "MALE" ? "남성" : customer.gender === "FEMALE" ? "여성" : "기타"}
                </p>
              </div>

              {customer.address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">주소</h4>
                  <p className="mt-1">{customer.address}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">등록일</h4>
                <p className="mt-1">{formatDate(customer.createdAt)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">최근 업데이트</h4>
                <p className="mt-1">{formatDate(customer.updatedAt)}</p>
              </div>

              {customer.tags && customer.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">태그</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {customer.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant={tag === "VIP" ? "primary" : tag === "신규" ? "success" : "warning"}
                        size="sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {customer.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">메모</h4>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{customer.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 관심 매물 정보 카드 */}
        <div className="lg:col-span-1">
          <Card title="관심 매물 정보" className="h-full">
            <div className="space-y-4">
              {customer.interests?.propertyTypes && customer.interests.propertyTypes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">관심 매물 유형</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {customer.interests.propertyTypes.map((type, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {customer.interests?.locations && customer.interests.locations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">관심 지역</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {customer.interests.locations.map((location, index) => (
                      <Badge key={index} variant="info" size="sm">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {customer.interests?.priceRange && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">가격 범위</h4>
                  <p className="mt-1">
                    {customer.interests.priceRange.min > 0 && customer.interests.priceRange.max > 0
                      ? `${customer.interests.priceRange.min.toLocaleString()} ~ ${customer.interests.priceRange.max.toLocaleString()} 만원`
                      : "설정되지 않음"}
                  </p>
                </div>
              )}

              {customer.interests?.size && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">평수 범위</h4>
                  <p className="mt-1">
                    {customer.interests.size.min > 0 && customer.interests.size.max > 0
                      ? `${customer.interests.size.min} ~ ${customer.interests.size.max} 평`
                      : "설정되지 않음"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 상담 요약 카드 */}
        <div className="lg:col-span-1">
          <Card
            title="상담 요약"
            className="h-full"
            headerAction={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => setIsConsultationModalOpen(true)}
              >
                상담 추가
              </Button>
            }
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">상담 횟수</h4>
                <p className="mt-1 text-2xl font-semibold">{customer.consultationCount || 0}회</p>
              </div>

              {customer.lastConsultation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">최근 상담일</h4>
                  <p className="mt-1">{formatDate(customer.lastConsultation)}</p>
                </div>
              )}

              {consultations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">최근 상담 내용</h4>
                  <p className="mt-1 text-gray-700 line-clamp-3">{consultations[0].content}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: "consultations",
              label: "상담 이력",
              content: (
                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">상담 이력</h3>
                    <Button
                      variant="primary"
                      leftIcon={<Plus size={16} />}
                      onClick={() => setIsConsultationModalOpen(true)}
                    >
                      상담 추가
                    </Button>
                  </div>
                  <ConsultationList consultations={consultations} />
                </div>
              ),
            },
            {
              id: "recommendations",
              label: "추천 매물",
              content: (
                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">추천 매물</h3>
                    <Button variant="outline" leftIcon={<Share2 size={16} />}>
                      추천 매물 공유
                    </Button>
                  </div>
                  <PropertyRecommendations customer={customer} />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* 고객 정보 수정 모달 */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="고객 정보 수정" size="lg">
        <CustomerForm
          initialData={customer}
          onSubmit={handleUpdateCustomer}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* 고객 삭제 확인 모달 */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="고객 삭제" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">
            정말로 <span className="font-semibold">{customer.name}</span> 고객을 삭제하시겠습니까? 이 작업은 되돌릴 수
            없습니다.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              취소
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteCustomer}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 상담 추가 모달 */}
      <Modal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        title="상담 기록 추가"
        size="md"
      >
        <ConsultationForm
          customerId={customer.id}
          onSubmit={handleAddConsultation}
          onCancel={() => setIsConsultationModalOpen(false)}
        />
      </Modal>
    </DashboardLayout>
  )
}

export default CustomerDetailPage

