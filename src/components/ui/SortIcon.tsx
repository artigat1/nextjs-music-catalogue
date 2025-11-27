interface SortIconProps {
  field: string;
  currentField: string;
  direction: "asc" | "desc";
}

export default function SortIcon({
  field,
  currentField,
  direction,
}: SortIconProps) {
  if (currentField !== field)
    return <span className="ml-2 text-base text-accent/40">↕</span>;
  return (
    <span className="ml-2 text-base text-accent">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}
