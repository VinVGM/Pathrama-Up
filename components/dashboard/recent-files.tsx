import { createClient } from "@/utils/supabase/server";
import { formatBytes } from "@/utils/format";
import { FileText, Image, Archive, Film } from "lucide-react";
import Link from "next/link";

export default async function RecentFiles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let recentFiles: any[] = [];

  if (user) {
      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (data) recentFiles = data;
  }

  return (
    <div className="bg-white border-neo shadow-neo p-6 flex flex-col h-full">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">
          Recent Uploads
        </h2>
        <Link href="/files" className="text-xs font-bold underline hover:bg-yellow-300 decoration-2 underline-offset-4">
            VIEW ALL
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {recentFiles.length === 0 ? (
             <div className="text-neutral-400 font-bold italic text-sm">No files uploaded yet.</div>
        ) : (
            recentFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-2 border-transparent hover:border-black hover:bg-neutral-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white group-hover:bg-indigo-200 transition-colors shadow-neo-sm group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] shrink-0">
                            {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{file.name}</div>
                            <div className="text-xs font-mono text-neutral-500">{new Date(file.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div className="font-mono font-bold text-sm bg-neutral-200 px-2 py-1 rounded-none whitespace-nowrap">
                        {formatBytes(file.size)}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}

function getFileIcon(type: string) {
    if (type.includes('image')) return <Image size={20} />;
    if (type.includes('video')) return <Film size={20} />;
    if (type.includes('zip') || type.includes('rar')) return <Archive size={20} />;
    return <FileText size={20} />;
}
