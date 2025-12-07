import { login, signup } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; error: string }
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md bg-white border-neo shadow-neo p-8">
        <h1 className="text-4xl font-bold mb-8 uppercase tracking-tighter">
          Archive<span className="text-primary">.OS</span>
        </h1>
        
        {searchParams?.message && (
             <div className="bg-green-100 border-2 border-black p-4 mb-6 font-bold text-sm">
                {searchParams.message}
             </div>
        )}
         {searchParams?.error && (
             <div className="bg-red-100 border-2 border-black p-4 mb-6 font-bold text-sm text-red-600">
                {searchParams.error}
             </div>
        )}

        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-sm" htmlFor="email">
              Email
            </label>
            <input
              className="border-2 border-black p-3 font-medium outline-none focus:bg-indigo-50 transition-colors rounded-none"
              id="email"
              name="email"
              type="email"
              required
              placeholder="user@example.com"
            />
          </div>
          
          <div className="flex flex-col gap-2">
             <label className="font-bold uppercase text-sm" htmlFor="password">
              Password
            </label>
            <input
              className="border-2 border-black p-3 font-medium outline-none focus:bg-indigo-50 transition-colors rounded-none"
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              formAction={login}
              className="bg-black text-white p-4 font-bold text-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo-sm transition-all border-2 border-black"
            >
              LOG IN
            </button>
            <button
              formAction={signup}
              className="bg-white text-black p-4 font-bold text-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-neo-sm transition-all border-2 border-black"
            >
              SIGN UP
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 font-bold text-xs uppercase tracking-widest text-neutral-400">
        Secure Glacier Storage System v1.0
      </div>
    </div>
  )
}
