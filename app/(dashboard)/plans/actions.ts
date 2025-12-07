'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const PLANS = {
  'Basic': 53687091200,      // 50 GB
  'Standard': 107374182400,  // 100 GB
  'Pro': 161061273600        // 150 GB
}

export async function updatePlan(planName: 'Basic' | 'Standard' | 'Pro') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const limit = PLANS[planName]

  const { error } = await supabase
    .from('profiles')
    .update({ 
        plan_name: planName, 
        storage_limit: limit 
    })
    .eq('id', user.id)

  if (error) {
      console.error(error)
      return { success: false, message: 'Failed to update plan' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/plans')
  return { success: true, message: `Switched to ${planName} Plan` }
}
