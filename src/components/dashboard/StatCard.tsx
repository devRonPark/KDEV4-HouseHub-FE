import type React from 'react';
import { ArrowUp, ArrowDown } from 'react-feather';

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  formatter?: (value: number) => string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  formatter = (val) => val.toString(),
}) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{formatter(value)}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className="flex items-center">
            {isPositive ? (
              <ArrowUp className="mr-1 h-4 w-4 flex-shrink-0 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4 flex-shrink-0 text-red-500" />
            )}
            <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1 text-gray-500">전월 대비</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
