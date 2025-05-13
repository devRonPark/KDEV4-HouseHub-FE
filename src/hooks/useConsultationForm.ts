import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/useToast';
import { useAuth } from '../context/useAuth';
import {
  ConsultationReqDto,
  ConsultationType,
  ConsultationStatus,
  UpdateConsultationReqDto,
} from '../types/consultation';
import { CustomerResDto } from '../types/customer';
import { getConsultationById, createConsultation, updateConsultation } from '../api/consultation';
import useCustomerSelection from './useCustomerSelection';
import { FindPropertyResDto } from '../types/property';

const useConsultationForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ConsultationReqDto>({
    agentId: user?.id ? Number(user.id) : 0,
    customerId: undefined,
    consultationType: ConsultationType.PHONE,
    content: '',
    consultationDate: new Date().toISOString(),
    status: ConsultationStatus.RESERVED,
  });

  const [initialData, setInitialData] = useState<ConsultationReqDto | null>(null);
  const [initialShownProperties, setInitialShownProperties] = useState<FindPropertyResDto[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalStatus, setOriginalStatus] = useState<ConsultationStatus>(
    ConsultationStatus.RESERVED
  );

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResDto | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    contact: '',
    email: '',
  });

  const handleCustomerSelect = useCallback(
    (customer: CustomerResDto) => {
      setSelectedCustomer(customer);
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
      }));
      setIsNewCustomer(false);
      if (errors.customerId) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.customerId;
          return newErrors;
        });
      }
      showToast('고객이 성공적으로 선택되었습니다.', 'success');
    },
    [errors, setFormData, setIsNewCustomer, setSelectedCustomer, showToast]
  );

  const {
    isCustomerModalOpen,
    handleOpenCustomerModal,
    handleCloseCustomerModal,
    handleCustomerSelect: handleSelectCustomer,
  } = useCustomerSelection({ onSelectCustomer: handleCustomerSelect });

  const handleChangeCustomer = useCallback(() => {
    handleOpenCustomerModal();
  }, [handleOpenCustomerModal]);

  const handleToggleNewCustomer = useCallback(() => {
    setIsNewCustomer((prev) => !prev);
    if (!isNewCustomer) {
      setSelectedCustomer(null);
    } else {
      setSelectedCustomer(null);
      setNewCustomerData({ name: '', contact: '', email: '' });
    }
  }, [isNewCustomer, setSelectedCustomer, setNewCustomerData]);

  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        agentId: Number(user.id),
      }));
    }

    if (isEditMode && id) {
      const fetchConsultation = async () => {
        setLoading(true);
        try {
          const response = await getConsultationById(Number(id));

          if (response.success && response.data) {
            const consultation = response.data;
            const consultationData = {
              agentId: consultation.agentId,
              customerId: consultation.customer.id,
              consultationType: consultation.consultationType.toUpperCase() as ConsultationType,
              content: consultation.content || '',
              consultationDate: consultation.consultationDate || new Date().toISOString(),
              status: consultation.status.toUpperCase() as ConsultationStatus,
              shownProperties: consultation.shownProperties.map((property) => property.id),
            };

            setFormData(consultationData);
            setInitialData(consultationData);
            setInitialShownProperties(consultation.shownProperties);
            setOriginalStatus(consultationData.status);
            if (consultation.customer) {
              setSelectedCustomer(consultation.customer);
            }
          } else {
            showToast(response.error || '상담 정보를 불러오는데 실패했습니다.', 'error');
            navigate('/consultations', { replace: true });
          }
        } catch (error) {
          console.error('상담 정보를 불러오는 중 오류가 발생했습니다:', error);
          showToast('상담 정보를 불러오는 중 오류가 발생했습니다.', 'error');
          navigate('/consultations', { replace: true });
        } finally {
          setLoading(false);
        }
      };
      fetchConsultation();
    }
  }, [id, isEditMode, navigate, showToast, user, setSelectedCustomer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'status' && isEditMode) {
      const newStatus = value as ConsultationStatus;

      if (originalStatus !== ConsultationStatus.RESERVED && newStatus !== originalStatus) {
        showToast('예약 상태에서만 상태를 변경할 수 있습니다.', 'error');
        return;
      }
      if (
        originalStatus === ConsultationStatus.RESERVED &&
        newStatus !== ConsultationStatus.RESERVED &&
        newStatus !== ConsultationStatus.COMPLETED &&
        newStatus !== ConsultationStatus.CANCELED
      ) {
        showToast('예약 상태에서는 완료 또는 취소 상태로만 변경할 수 있습니다.', 'error');
        return;
      }
    }

    if (
      name === 'consultationDate' &&
      isEditMode &&
      originalStatus !== ConsultationStatus.RESERVED
    ) {
      showToast('예약 상태의 상담만 일자를 수정할 수 있습니다.', 'error');
      return;
    }

    if (name === 'consultationType') {
      setFormData((prev) => ({ ...prev, [name]: value as ConsultationType }));
    } else if (name === 'status') {
      setFormData((prev) => ({ ...prev, [name]: value as ConsultationStatus }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomerData((prev) => ({ ...prev, [name]: value }));
    if (errors[`newCustomer.${name}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`newCustomer.${name}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isNewCustomer && !formData.customerId) {
      newErrors.customerId = '고객을 선택해주세요.';
    }

    if (isNewCustomer) {
      const { name, contact, email } = newCustomerData;

      // 연락처 필수 + 형식 검사
      if (!contact) {
        newErrors['newCustomer.contact'] = '연락처를 입력해주세요.';
      } else if (!/^010-\d{4}-\d{4}$/.test(contact)) {
        newErrors['newCustomer.contact'] = '연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)';
      }

      // 이름: 입력한 경우에만 2자 이상
      if (name && name.trim().length < 2) {
        newErrors['newCustomer.name'] = '이름은 2자 이상 입력해주세요.';
      }

      // 이메일: 입력한 경우에만 이메일 형식 검사
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors['newCustomer.email'] = '이메일 형식이 올바르지 않습니다.';
      }
    }

    if (!formData.consultationDate) {
      newErrors.consultationDate = '상담 일자를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isEqualSet = (a?: number[], b?: number[]): boolean => {
    const setA = new Set(a ?? []);
    const setB = new Set(b ?? []);

    if (setA.size !== setB.size) return false;

    for (const item of setA) {
      if (!setB.has(item)) return false;
    }

    return true;
  };

  const getChangedFields = (requestData: ConsultationReqDto): Partial<UpdateConsultationReqDto> => {
    if (!initialData) return { agentId: requestData.agentId };

    const changedFields: Partial<UpdateConsultationReqDto> = {
      agentId: requestData.agentId,
    };

    if (requestData.consultationType !== initialData.consultationType) {
      changedFields.consultationType = requestData.consultationType;
    }

    if (requestData.content !== initialData.content) {
      changedFields.content = requestData.content === '' ? undefined : requestData.content;
    }

    if (requestData.consultationDate !== initialData.consultationDate) {
      changedFields.consultationDate = requestData.consultationDate;
    }

    if (requestData.status !== initialData.status) {
      changedFields.status = requestData.status;
    }

    const hasShownPropertyChanged = !isEqualSet(
      requestData.shownPropertyIds,
      initialData.shownPropertyIds
    );

    if (hasShownPropertyChanged) {
      changedFields.shownPropertyIds = requestData.shownPropertyIds;
    }

    return changedFields;
  };

  const handleSubmit = async (e: React.FormEvent, selectedPropertyIds: number[] = []) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode && id) {
        const requestData = {
          ...formData,
          shownPropertyIds: selectedPropertyIds,
        };
        const updateData = getChangedFields(requestData);
        const hasRealChanges = Object.keys(updateData).length > 1;
        if (!hasRealChanges) {
          showToast('변경된 내용이 없습니다.', 'info');
          setIsSubmitting(false);
          return;
        }
        updateData.shownPropertyIds = selectedPropertyIds;
        response = await updateConsultation(Number(id), updateData);
      } else {
        const consultationData = {
          ...formData,
          shownPropertyIds: selectedPropertyIds,
          newCustomer: isNewCustomer
            ? {
                name: newCustomerData.name || undefined,
                contact: newCustomerData.contact,
                email: newCustomerData.email || undefined,
              }
            : undefined,
        };
        response = await createConsultation(consultationData);
      }

      if (response.success) {
        showToast(
          isEditMode
            ? '상담 정보가 성공적으로 수정되었습니다.'
            : '상담이 성공적으로 등록되었습니다.',
          'success'
        );
        navigate('/consultations');
      } else {
        showToast(
          response.error ||
            (isEditMode ? '상담 정보 수정에 실패했습니다.' : '상담 등록에 실패했습니다.'),
          'error'
        );
      }
    } catch (error) {
      console.error('상담 정보를 저장하는 중 오류가 발생했습니다:', error);
      showToast('상담 정보를 저장하는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateFieldDisabled = isEditMode && originalStatus !== ConsultationStatus.RESERVED;
  const isStatusChangeRestricted = isEditMode && originalStatus !== ConsultationStatus.RESERVED;
  // 상담 수정 불가 여부 (취소된 상담)
  const isConsultationImmutable = isEditMode && originalStatus === ConsultationStatus.CANCELED;

  // 완료된 상담 여부 (일부 필드만 수정 가능)
  const isCompletedConsultation = isEditMode && originalStatus === ConsultationStatus.COMPLETED;

  return {
    formData,
    loading,
    isSubmitting,
    errors,
    originalStatus,
    isEditMode,
    handleChange,
    handleNewCustomerChange,
    handleSubmit,
    isDateFieldDisabled,
    isStatusChangeRestricted,
    isConsultationImmutable,
    isCompletedConsultation,
    setFormData,
    setErrors,
    selectedCustomer,
    isNewCustomer,
    newCustomerData,
    shownProperties: initialShownProperties,
    setSelectedCustomer,
    setNewCustomerData,
    setIsNewCustomer,
    isCustomerModalOpen,
    handleOpenCustomerModal,
    handleCloseCustomerModal,
    handleChangeCustomer,
    handleToggleNewCustomer,
    handleSelectCustomer,
  };
};

export default useConsultationForm;
