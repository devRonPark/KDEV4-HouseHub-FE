interface MonthTabsProps {
  months: string[];
  selectedMonth: string;
  onSelect: (month: string) => void;
}

export default function MonthTabs({ months, selectedMonth, onSelect }: MonthTabsProps) {
  return (
    <div className="flex space-x-4 mb-4">
      {months.map((month) => {
        const isActive = selectedMonth === month;
        const label = month.replace('-', '년 ') + '월';
        return (
          <button
            key={month}
            onClick={() => onSelect(month)}
            className={`text-lg font-medium py-2 px-4 rounded-full ${
              isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
