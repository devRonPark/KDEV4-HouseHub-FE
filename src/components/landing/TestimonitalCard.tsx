interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatarSrc: string;
}

function TestimonialCard({ quote, name, role, avatarSrc }: TestimonialCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 text-gray-600">"{quote}"</div>
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <img
            src={avatarSrc || 'https://via.placeholder.com/150'}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;
