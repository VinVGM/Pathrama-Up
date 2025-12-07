import StorageUsed from "@/components/dashboard/storage-used";
import RecentFiles from "@/components/dashboard/recent-files";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
           <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
            Dashboard
            </h1>
            <p className="font-bold text-neutral-500">Welcome back, User.</p>
        </div>
        <div className="font-mono font-bold text-xs bg-yellow-300 border-2 border-black px-3 py-1 shadow-neo-sm transform -rotate-2">
            SYSTEM STATUS: ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <StorageUsed />
        </div>
        <div className="lg:col-span-2">
            <RecentFiles />
        </div>
      </div>
    </div>
  );
}
