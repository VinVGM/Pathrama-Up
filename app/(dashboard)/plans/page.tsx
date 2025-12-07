import { updatePlan } from './actions'
import { Check, HardDrive } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import PlanButton from '@/components/plans/plan-button'

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let currentPlan = 'Basic'
  if (user) {
      const { data } = await supabase.from('profiles').select('plan_name').eq('id', user.id).single()
      if (data) currentPlan = data.plan_name
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter decoration-wavy decoration-indigo-500">
          Membership Plans
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <PlanCard 
            name="Basic" 
            size="50 GB" 
            price="Free" 
            current={currentPlan === 'Basic'}
            color="bg-white"
        />

        {/* Standard Plan */}
        <PlanCard 
            name="Standard" 
            size="100 GB" 
            price="$9.99/mo" 
            current={currentPlan === 'Standard'} 
            color="bg-indigo-50"
        />

        {/* Pro Plan */}
        <PlanCard 
            name="Pro" 
            size="150 GB" 
            price="$19.99/mo" 
            current={currentPlan === 'Pro'} 
            color="bg-yellow-300"
            popular
        />
      </div>
    </div>
  )
}

function PlanCard({ name, size, price, current, color, popular }: any) {
    return (
        <div className={`border-neo shadow-neo p-8 flex flex-col gap-6 relative ${color}`}>
            {popular && (
                <div className="absolute -top-4 -right-4 bg-black text-white px-4 py-2 font-bold uppercase rotate-6 shadow-neo-sm border-2 border-white">
                    Most Popular
                </div>
            )}
            <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{name}</h3>
                <div className="text-4xl font-black mt-2">{size}</div>
                <div className="text-neutral-600 font-bold font-mono">{price}</div>
            </div>

            <ul className="flex flex-col gap-2 flex-1">
                
                <li className="flex items-center gap-2 font-bold text-sm">
                    <Check size={16} strokeWidth={4} /> Glacier Deep Archive
                </li>
                <li className="flex items-center gap-2 font-bold text-sm">
                    <Check size={16} strokeWidth={4} /> Secure Encryption
                </li>
            </ul>

            <PlanButton planName={name} isCurrent={current} />
        </div>
    )
}
