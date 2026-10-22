

type StatCardProps = {
  title: string;
  value: string | number;

};

export const StatCard = ({
  title,
  value,

}: StatCardProps) => {
  return (
    <div className="rounded-card border border-gray-200 bg-white p-5 shadow-sm  transition-all duration-300">
    

      <div className="mt-1 text-sm text-body ">{title}</div>
      <div className="text-2xl font-bold text-heading">{value}</div>

    </div>
  );
};