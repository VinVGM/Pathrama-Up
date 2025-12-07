'use client'

import { updatePlan } from '@/app/(dashboard)/plans/actions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function PlanButton({ planName, isCurrent }: { planName: any, isCurrent: boolean }) {
    const [loading, setLoading] = useState(false)

    const handleSwitch = async () => {
        setLoading(true)
        await updatePlan(planName)
        setLoading(false)
    }

    if (isCurrent) {
        return (
            <div className="bg-black text-white p-4 font-bold text-lg text-center uppercase border-2 border-black opacity-50 cursor-not-allowed">
                Current Plan
            </div>
        )
    }

    return (
        <button 
            onClick={handleSwitch}
            disabled={loading}
            className="bg-white text-black p-4 font-bold text-lg hover:bg-black hover:text-white transition-all border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 uppercase"
        >
            {loading && <Loader2 className="animate-spin" />}
            Subscribe
        </button>
    )
}
