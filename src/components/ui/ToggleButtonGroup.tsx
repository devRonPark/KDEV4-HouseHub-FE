type ToggleButtonGroupProps<T extends string> = {
  label: string;
  options: { id: T; label: string; isSelected: boolean }[];
  onToggle: (id: T) => void;
};

function ToggleButtonGroup<T extends string>({
  label,
  options,
  onToggle,
}: ToggleButtonGroupProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors
              ${
                option.isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToggleButtonGroup;
