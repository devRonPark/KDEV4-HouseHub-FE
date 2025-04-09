/**
 * ISO 형식의 날짜 문자열을 'YYYY-MM-DD' 형식으로 변환
 * @param dateString ISO 형식의 날짜 문자열
 * @returns 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\. /g, '-')
      .replace('.', '');
  } catch (error) {
    console.error('날짜 형식 변환 오류:', error);
    return '날짜 오류';
  }
};

/**
 * 전화번호 형식 변환 (이미 형식이 맞는 경우 그대로 반환)
 * @param phone 전화번호 문자열
 * @returns 형식화된 전화번호 문자열
 */
export const formatPhoneNumber = (phone: string): string => {
  // 이미 형식이 맞는 경우 (010-1234-5678)
  if (/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)) {
    return phone;
  }

  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '');

  // 숫자가 10-11자리인 경우 형식화
  if (numbers.length >= 10 && numbers.length <= 11) {
    const areaCode = numbers.substring(0, 3);
    const middle = numbers.substring(3, 7);
    const last = numbers.substring(7);
    return `${areaCode}-${middle}-${last}`;
  }

  // 그 외의 경우 원본 반환
  return phone;
};

// 금액 포맷팅 함수
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
};
