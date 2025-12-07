import { createClient } from "@/utils/supabase/server";

export default async function StorageUsed() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let used = 0;
  
  if (user) {
    const { data } = await supabase
      .from("files")
      .select("size")
      .eq("user_id", user.id);
      
    if (data) {
        used = data.reduce((acc, curr) => acc + curr.size, 0);
    }
  }

  // Convert bytes to GB
  const usedGB = parseFloat((used / (1024 * 1024 * 1024)).toFixed(2));
  const total = 100; // GB (Hardcoded plan limit for now)
  const percentage = Math.min((usedGB / total) * 100, 100);

  return (
    <div className="bg-white border-neo shadow-neo p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-black uppercase tracking-tight">
          Storage Used
        </h2>
        <span className="font-mono font-bold bg-black text-white px-2 py-1 text-xs">
          GLACIER
        </span>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-5xl font-black text-indigo-700">{usedGB}</span>
        <span className="text-xl font-bold mb-2 text-neutral-500">
          / {total} GB
        </span>
      </div>

      <div className="w-full h-8 border-2 border-black p-1 bg-white relative">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          >
             {/* Striped pattern overlay */}
             <div className="w-full h-full bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px]"></div>
          </div>
      </div>
      
      <p className="text-sm font-bold text-neutral-600 mt-2">
        {(total - usedGB).toFixed(2)} GB remaining in your Pro Plan.
      </p>
    </div>
  );
}
