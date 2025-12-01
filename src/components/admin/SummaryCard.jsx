export function SummaryCard({ label, value, currency = "AUD", variant = "default", onClick }) {
  const variants = {
    default: "bg-white border-gray-200",
    sent: "bg-white border-blue-200",
    accepted: "bg-white border-green-200",
    declined: "bg-white border-red-200",
    invoiced: "bg-white border-purple-200",
  };

  const valueColors = {
    default: "text-gray-900",
    sent: "text-blue-700",
    accepted: "text-green-700",
    declined: "text-red-700",
    invoiced: "text-purple-700",
  };

  return (
    <div
      className={`
        ${variants[variant] || variants.default}
        rounded-lg border p-5 shadow-sm
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}
      `}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${valueColors[variant] || valueColors.default}`}>
        {currency} {typeof value === 'number' ? value.toFixed(2) : value}
      </p>
    </div>
  );
}

