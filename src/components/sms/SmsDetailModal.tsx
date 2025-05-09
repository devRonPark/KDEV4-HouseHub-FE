import React from 'react';
import Modal from '../ui/Modal';
import type { SendSmsResDto } from '../../types/sms';

interface SmsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sms: SendSmsResDto | null;
}

const SmsDetailModal: React.FC<SmsDetailModalProps> = ({ isOpen, onClose, sms }) => {
  if (!sms) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="문자 상세 정보" size="md">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">발신 번호</h3>
          <p className="mt-1 text-sm text-gray-900">{sms.sender}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">수신 번호</h3>
          <p className="mt-1 text-sm text-gray-900">{sms.receiver}</p>
        </div>
        {sms.title && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">제목</h3>
            <p className="mt-1 text-sm text-gray-900">{sms.title}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500">메시지 유형</h3>
          <p className="mt-1 text-sm text-gray-900">{sms.msgType}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">발송 상태</h3>
          <div className="mt-1">
            <span
              className={`px-2 py-1 text-xs rounded-full ${sms.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : sms.status === 'PERMANENT_FAIL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
            >
              {sms.status === 'SUCCESS'
                ? '성공'
                : sms.status === 'PERMANENT_FAIL'
                  ? '영구 실패'
                  : '실패'}
            </span>
          </div>
        </div>
        {/* 예약 일시 */}
        {sms.rdate && sms.rtime && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">예약 일시</h3>
            <p className="mt-1 text-sm text-gray-900">
              {sms.rdate.slice(0, 4)}-{sms.rdate.slice(4, 6)}-{sms.rdate.slice(6, 8)} {sms.rtime}
            </p>
          </div>
        )}
        {/* 요청 일시 */}
        {sms.createdAt && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">요청 일시</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(sms.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500">메시지 내용</h3>
          <div className="mt-1 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{sms.msg}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SmsDetailModal;
