import type React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Activity } from '../../types/dashboard';
import { Users, Home, MessageSquare, HelpCircle } from 'react-feather';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'customer':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'property':
        return <Home className="h-5 w-5 text-green-500" />;
      case 'consultation':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'inquiry':
        return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-400" />;
    }
  };

  const getTypeText = () => {
    switch (activity.type) {
      case 'customer':
        return '고객';
      case 'property':
        return '매물';
      case 'consultation':
        return '상담';
      case 'inquiry':
        return '문의';
      default:
        return '활동';
    }
  };

  return (
    <div className="relative pb-8">
      <div className="relative flex space-x-3">
        <div>
          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
            {getIcon()}
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{activity.createdBy.name}</span>님이{' '}
              <span className="font-medium text-gray-900">{getTypeText()}</span> {activity.title}
            </p>
            <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time dateTime={activity.createdAt}>
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ko })}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
