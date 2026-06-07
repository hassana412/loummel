import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AdminEmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-xl border border-dashed border-slate-300">
      <div className="w-16 h-16 rounded-full bg-[#E8500A]/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#E8500A]" />
      </div>
      <h3 className="font-semibold text-slate-900 text-lg mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
