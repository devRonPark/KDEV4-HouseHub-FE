/**
 * 두 객체 간의 차이점을 찾아 변경된 필드만 포함하는 객체를 반환하는 함수
 * @param original 원본 객체
 * @param updated 업데이트된 객체
 * @returns 변경된 필드만 포함하는 객체
 */
export const getObjectDiff = <T extends Record<string, any>>(
  original: T,
  updated: T
): Partial<T> => {
  const diff: Partial<T> = {};

  // 기본 필드 비교
  Object.keys(updated).forEach((key) => {
    const typedKey = key as keyof T;

    // 배열인 경우 (예: questions)
    if (Array.isArray(updated[typedKey])) {
      // 배열이 다른 경우에만 포함
      if (JSON.stringify(updated[typedKey]) !== JSON.stringify(original[typedKey])) {
        diff[typedKey] = updated[typedKey];
      }
    }
    // 객체인 경우 (중첩된 객체)
    else if (
      typeof updated[typedKey] === 'object' &&
      updated[typedKey] !== null &&
      typeof original[typedKey] === 'object' &&
      original[typedKey] !== null
    ) {
      const nestedDiff = getObjectDiff(original[typedKey], updated[typedKey]);
      if (Object.keys(nestedDiff).length > 0) {
        diff[typedKey] = nestedDiff as T[keyof T];
      }
    }
    // 기본 타입인 경우
    else if (updated[typedKey] !== original[typedKey]) {
      diff[typedKey] = updated[typedKey];
    }
  });

  return diff;
};
