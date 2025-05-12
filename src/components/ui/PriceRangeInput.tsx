type PriceRangeInputProps = {
  label: string;
  minValue: string;
  maxValue: string;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
};

function PriceRangeInput({
  label,
  minValue,
  maxValue,
  onChangeMin,
  onChangeMax,
}: PriceRangeInputProps) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={minValue}
          onChange={(e) => onChangeMin(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="최소"
        />
        <span className="text-gray-500">~</span>
        <input
          type="text"
          value={maxValue}
          onChange={(e) => onChangeMax(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="최대"
        />
        <span className="text-gray-500 w-20">만원</span>
      </div>
    </div>
  );
}

export default PriceRangeInput;
