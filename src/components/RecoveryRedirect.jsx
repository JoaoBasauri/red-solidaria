import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialPasswordFlow, supabase } from '../lib/supabase'

export default function RecoveryRedirect() {
  const navigate=useNavigate()

  useEffect(()=>{
    let active = true
    // Esperar a que Auth procese los tokens antes de cambiar la URL.
    if (initialPasswordFlow) {
      supabase.auth.getSession().then(() => {
        if (active) navigate('/actualizar-contrasena', { replace: true })
      })
    }
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==='PASSWORD_RECOVERY') navigate('/actualizar-contrasena',{replace:true})
    })
    return ()=>{active=false;subscription.unsubscribe()}
  },[navigate])

  return null
}
