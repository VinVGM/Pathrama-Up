import { signout } from "@/app/(auth)/signout/actions";
import Link from "next/link";
import { Folder, Home, Upload, LogOut, HardDrive } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-neutral-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-4 border-black fixed h-full flex flex-col justify-between z-10">
        <div>
          <div className="p-6 border-b-4 border-black bg-indigo-700 text-white">
            <h1 className="text-2xl font-black tracking-tighter uppercase">
              Archive.OS
            </h1>
          </div>
          <nav className="flex flex-col p-4 gap-2">
            <NavLink href="/dashboard" icon={<Home />} label="Overview" />
            <NavLink href="/upload" icon={<Upload />} label="Upload" />
            <NavLink href="/files" icon={<Folder />} label="Files" />
          </nav>
        </div>

        <div className="p-4 border-t-4 border-black bg-indigo-50">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-700 rounded-full border-2 border-black flex items-center justify-center text-white font-bold">
                  U
              </div>
              <div className="flex flex-col">
                  <span className="font-bold text-sm uppercase">User</span>
                  <span className="text-xs text-neutral-600 font-mono">Plan: Pro</span>
              </div>
           </div>
          <form action={signout}>
            <button className="w-full flex items-center gap-3 px-4 py-3 font-bold border-2 border-black bg-red-500 text-white hover:bg-red-600 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <LogOut size={20} />
              SIGN OUT
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
             {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 font-bold border-2 border-transparent hover:border-black hover:bg-yellow-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase"
    >
      {icon}
      {label}
    </Link>
  );
}
