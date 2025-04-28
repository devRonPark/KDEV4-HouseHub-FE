import { formatDate } from '../../utils/format';
import { MessageSquare, Phone, Mail, Calendar } from 'react-feather';
<<<<<<< HEAD
import { ConsultationType, type ConsultationResDto } from '../../types/consultation';
=======
import type { Consultation } from '../../types/consultation';
>>>>>>> develop

interface ConsultationListProps {
  consultations: ConsultationResDto[];
}

const ConsultationList = ({ consultations }: ConsultationListProps) => {
  // 상담 유형에 따른 아이콘 반환
  const getConsultationIcon = (type: string) => {
    switch (type) {
<<<<<<< HEAD
      case ConsultationType.VISIT:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case ConsultationType.PHONE:
        return <Phone className="h-5 w-5 text-green-500" />;
      case ConsultationType.EMAIL:
        return <Mail className="h-5 w-5 text-purple-500" />;
=======
      case 'PHONE':
        return <Phone className="h-5 w-5 text-blue-500" />;
      case 'VISIT':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
>>>>>>> develop
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  // 상담 유형에 따른 텍스트 반환
  const getConsultationTypeText = (type: string) => {
    switch (type) {
<<<<<<< HEAD
      case ConsultationType.VISIT:
        return '방문 상담';
      case ConsultationType.PHONE:
        return '전화 상담';
      case ConsultationType.EMAIL:
        return '이메일 상담';
=======
      case 'PHONE':
        return '전화 상담';
      case 'VISIT':
        return '방문 상담';
>>>>>>> develop
      default:
        return '이메일 상담';
    }
  };

  if (consultations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">상담 이력 없음</h3>
        <p className="mt-1 text-sm text-gray-500">아직 기록된 상담 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {consultations.map((consultation, consultationIdx) => (
          <li key={consultation.id}>
            <div className="relative pb-8">
              {consultationIdx !== consultations.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
<<<<<<< HEAD
                    {getConsultationIcon(consultation.consultationType)}
=======
                    {getConsultationIcon(consultation.type as string)}
>>>>>>> develop
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
<<<<<<< HEAD
                        {getConsultationTypeText(consultation.consultationType)}
=======
                        {getConsultationTypeText(consultation.type as string)}
>>>>>>> develop
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
<<<<<<< HEAD
                      <span>{formatDate(consultation.consultationDate)}</span>
=======
                      <span>{formatDate(consultation.date)}</span>
                      {consultation.agent && (
                        <div className="flex items-center space-x-2">
                          <span>{consultation.agent.name}</span>
                        </div>
                      )}
>>>>>>> develop
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p className="whitespace-pre-line">{consultation.content}</p>
                  </div>
<<<<<<< HEAD
=======
                  {consultation.relatedProperties && consultation.relatedProperties.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500">관련 매물</h4>
                      <div className="mt-1">
                        {consultation.relatedProperties.map(
                          (property: { id: number; name: string }) => (
                            <span key={property.id} className="text-sm text-gray-500">
                              {property.name}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
>>>>>>> develop
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultationList;
