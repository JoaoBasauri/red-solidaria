import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RecoveryRedirect() {
  const navigate=useNavigate()

  useEffect(()=>{
    if (window.location.hash.includes('type=recovery')) navigate('/actualizar-contrasena',{replace:true})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==='PASSWORD_RECOVERY') navigate('/actualizar-contrasena',{replace:true})
    })
    return ()=>subscription.unsubscribe()
  },[navigate])

  return null
}
