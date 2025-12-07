import { createClient } from "@/utils/supabase/server";
import { formatBytes } from "@/utils/format"; 
import { FileText, Image, Archive, Film } from "lucide-react";
import FileActions from "@/components/dashboard/file-actions";

export default async function FilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500 font-bold">Error loading files</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter decoration-wavy decoration-indigo-500">
          All Files
        </h1>
        <div className="font-bold font-mono">
            TOTAL ITEMS: {files?.length || 0}
        </div>
      </div>

      <div className="bg-white border-neo shadow-neo min-h-[500px] flex flex-col">
         {/* File Header */}
         <div className="grid grid-cols-12 gap-4 p-4 border-b-2 border-black bg-indigo-50 font-black uppercase text-sm">
             <div className="col-span-5">Name</div>
             <div className="col-span-2">Type</div>
             <div className="col-span-2">Size</div>
             <div className="col-span-3 text-right">Actions</div>
         </div>
            
         <div className="flex flex-col">
            {files?.length === 0 ? (
                <div className="p-12 text-center text-neutral-400 font-bold italic text-lg">
                    No files found. Start uploading!
                </div>
            ) : (
                files?.map((file) => (
                     <div key={file.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors group">
                        <div className="col-span-5 flex items-center gap-3 font-bold truncate">
                            <div className="w-8 h-8 flex shrink-0 items-center justify-center bg-white border border-black shadow-[2px_2px_0px_0px_#000]">
                                {getFileIcon(file.type)}
                            </div>
                            <span className="truncate">{file.name}</span>
                        </div>
                        <div className="col-span-2 font-mono text-xs text-neutral-500 uppercase truncate">
                             {file.type}
                        </div>
                         <div className="col-span-2 font-mono font-bold text-sm">
                            {formatBytes(file.size)}
                        </div>
                        <div className="col-span-3 flex justify-end gap-2">
                             <FileActions file={file} />
                        </div>
                     </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
}

function getFileIcon(type: string) {
    if (type.includes('image')) return <Image size={16} />;
    if (type.includes('video')) return <Film size={16} />;
    if (type.includes('zip') || type.includes('rar')) return <Archive size={16} />;
    return <FileText size={16} />;
}
