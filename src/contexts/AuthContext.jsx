import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [perfil, setPerfil] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setPerfil(null)
      setRole(null)
      return
    }

    const userId = session.user.id

    async function carregarPerfil() {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', userId)
        .maybeSingle()

      if (adminData) {
        setRole('admin')
        setPerfil({ ...session.user, tipo: 'admin' })
        return
      }

      const { data: restauranteData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('auth_id', userId)
        .maybeSingle()

      if (restauranteData) {
        setRole('parceiro')
        setPerfil(restauranteData)
        return
      }

      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('auth_id', userId)
        .maybeSingle()

      setRole('cliente')
      setPerfil(clienteData ?? { auth_id: userId, email: session.user.email })
    }

    carregarPerfil()
  }, [session])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const carregando = session === undefined

  return (
    <AuthContext.Provider
      value={{
        session,
        perfil,
        role,
        carregando,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return ctx
}