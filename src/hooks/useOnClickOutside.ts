'use client';

import { useEffect, type RefObject } from 'react';

/**
 * 지정된 요소 외부 클릭을 감지하는 훅
 * @param ref 감지할 요소의 ref
 * @param handler 외부 클릭 시 실행할 핸들러
 */
function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // ref가 없거나 클릭한 요소가 ref 내부에 있으면 무시
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // 이벤트 리스너 등록
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default useOnClickOutside;
