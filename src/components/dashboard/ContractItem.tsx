import { Link } from 'react-router-dom';
import { ExpiringContract } from '../../types/contract';

export default function ContractItem({ item }: { item: ExpiringContract }) {
  return (
    <div className="px-5 py-4 hover:bg-gray-50 transition flex items-center justify-between">
      <div className="flex-1">
        <div className="text-base font-semibold text-gray-800">
          <span className="font-medium text-gray-700">매물 주소: </span>
          {item.propertyAddress}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          <div className="flex gap-x-4">
            <span>
              <span className="font-medium text-gray-700">계약자: </span>
              {item.customerName}
            </span>
            <span>
              <span className="font-medium text-gray-700">계약 유형: </span>
              {item.contractType}
            </span>
          </div>
          <div className="flex gap-x-4 mt-1">
            <span>
              <span className="font-medium text-gray-700">만료일: </span>
              <strong>{item.expiredAt}</strong>
            </span>
            <span
              className={
                item.displayStatus === '만료'
                  ? 'text-red-500 font-medium'
                  : 'text-yellow-600 font-medium'
              }
            >
              <span className="font-medium text-gray-700">상태: </span>
              {item.displayStatus} ({item.dday})
            </span>
          </div>
        </div>
      </div>
      <Link
        to={`/contracts/${item.id}`}
        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
      >
        계약 상세 보기
      </Link>
    </div>
  );
}
