import type React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  formatter?: (value: number) => string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  formatter = (val) => val.toString(),
  onClick,
}) => {
  return (
    <div 
      className={`bg-white overflow-hidden shadow rounded-lg ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}`}
      onClick={onClick}
    >
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
    </div>
  );
};

export default StatCard;
