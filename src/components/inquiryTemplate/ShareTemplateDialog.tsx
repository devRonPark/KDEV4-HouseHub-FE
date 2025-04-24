'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Copy, Download, Share2 } from 'react-feather';
import Button from '../ui/Button';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useToast } from '../../context/useToast';

interface ShareTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  shareToken: string;
}

const ShareTemplateDialog: React.FC<ShareTemplateDialogProps> = ({
  open,
  onClose,
  templateId,
  templateName,
  shareToken,
}) => {
  const { showToast } = useToast();
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // 공유 링크 생성
  const shareUrl = `http://localhost:3000/inquiry/share/${shareToken}`;

  // 링크 복사 핸들러
  const handleCopyLink = async (e: React.MouseEvent) => {
    // 이벤트 전파 방지
    e.preventDefault();
    e.stopPropagation();

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      // 토스트 메시지 표시 전에 약간의 지연 추가
      setTimeout(() => {
        showToast('링크가 클립보드에 복사되었습니다.', 'success');
      }, 100);
    } catch {
      setTimeout(() => {
        showToast('링크 복사에 실패했습니다.', 'error');
      }, 100);
    } finally {
      setIsCopying(false);
    }
  };

  // QR 코드 다운로드 핸들러
  const handleDownloadQR = async () => {
    if (!qrCodeRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(qrCodeRef.current, {
        quality: 0.95,
        backgroundColor: 'white',
        width: 300,
        height: 300,
        style: {
          margin: '20px',
          padding: '20px',
        },
      });

      saveAs(dataUrl, `inquiry_qr_${templateId}.png`);
      showToast('QR 코드가 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('QR 코드 다운로드 실패:', error);
      showToast('QR 코드 다운로드에 실패했습니다.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div className="flex items-center">
          <Share2 className="mr-2 text-blue-500" size={20} />
          <span>문의 템플릿 공유</span>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="py-2 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">템플릿 이름</h3>
            <p className="text-base font-semibold text-gray-900">{templateName}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">공유 링크</h3>
            <div className="flex items-center">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyLink}
                disabled={isCopying}
                className="ml-2 p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                title="링크 복사"
              >
                <Copy size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              이 링크를 공유하여 고객이 문의 양식에 접근할 수 있습니다.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">QR 코드</h3>
            <div className="flex flex-col items-center">
              <div
                ref={qrCodeRef}
                className="bg-white p-4 rounded-lg border border-gray-200 inline-block"
              >
                <QRCode value={shareUrl} size={200} />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                QR 코드를 스캔하면 문의 양식으로 바로 이동합니다.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <div className="flex justify-between w-full px-3 pb-3">
          <Button
            variant="outline"
            onClick={handleDownloadQR}
            isLoading={isDownloading}
            className="flex items-center"
          >
            <Download size={16} className="mr-1" />
            QR 다운로드
          </Button>
          <Button variant="primary" onClick={onClose}>
            닫기
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ShareTemplateDialog;
