interface DetailCardProps {
  title: string;
  children: React.ReactNode;
}

export function DetailCard({ title, children }: DetailCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

interface AttributeListProps {
  title: string;
  attributes: Array<{
    key: string;
    value: { Value: { StringValue: string } };
  }>;
}

export function AttributeList({ title, attributes }: AttributeListProps) {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <DetailCard title={title}>
      <div className="space-y-2">
        {attributes.map((attr) => (
          <div key={attr.key} className="flex items-start">
            <span className="font-medium w-40 text-gray-700">{attr.key}:</span>
            <span className="text-gray-600 break-all">{attr.value.Value.StringValue}</span>
          </div>
        ))}
      </div>
    </DetailCard>
  );
} 