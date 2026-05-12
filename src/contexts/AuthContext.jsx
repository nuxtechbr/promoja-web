import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [perfil, setPerfil] = useState(null);
  const [role, setRole] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, novaSession) => {
      setSession(novaSession ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;

    if (!session?.user) {
      setPerfil(null);
      setRole(null);
      setCarregandoPerfil(false);
      return;
    }

    let cancelado = false;

    async function carregarPerfil() {
      setCarregandoPerfil(true);

      const user = session.user;
      const userId = user.id;
      const emailUsuario = String(user.email || "").toLowerCase();

      const { data: adminData } = await supabase
        .from("admin_users")
        .select("*")
        .or(`auth_id.eq.${userId},email.eq.${emailUsuario}`)
        .maybeSingle();

      if (cancelado) return;

      if (adminData) {
        setRole("admin");
        setPerfil({ ...user, ...adminData, tipo: "admin" });
        setCarregandoPerfil(false);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("auth_id", userId)
        .maybeSingle();

      if (cancelado) return;

      if (!roleData) {
        setRole(null);
        setPerfil(null);
        setCarregandoPerfil(false);
        return;
      }

      const tipo = String(roleData.tipo || "").toLowerCase();

      if (tipo === "parceiro") {
        const { data: restauranteData } = await supabase
          .from("restaurants")
          .select("*")
          .eq("auth_id", userId)
          .maybeSingle();

        if (cancelado) return;

        if (!restauranteData) {
          setRole(null);
          setPerfil(null);
          setCarregandoPerfil(false);
          return;
        }

        setRole("parceiro");
        setPerfil({ ...restauranteData, tipo: "parceiro" });
        setCarregandoPerfil(false);
        return;
      }

      if (tipo === "cliente") {
        const { data: clienteData } = await supabase
          .from("clientes")
          .select("*")
          .eq("auth_id", userId)
          .maybeSingle();

        if (cancelado) return;

        setRole("cliente");
        setPerfil(
          clienteData ?? {
            auth_id: userId,
            email: emailUsuario,
            tipo: "cliente",
          }
        );
        setCarregandoPerfil(false);
        return;
      }

      if (tipo === "admin") {
        setRole("admin");
        setPerfil({ ...user, tipo: "admin" });
        setCarregandoPerfil(false);
        return;
      }

      setRole(null);
      setPerfil(null);
      setCarregandoPerfil(false);
    }

    carregarPerfil();

    return () => {
      cancelado = true;
    };
  }, [session]);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setPerfil(null);
    setRole(null);
  }

  const carregando = session === undefined || carregandoPerfil;

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
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return ctx;
}