import type { NextAuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) return null;

          const user = await prisma.usuarios.findUnique({
            where: { username: credentials.username },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) return null;

          const fullName = `${user.nombre}${user.apellido ? ` ${user.apellido}` : ""}`.trim();

          return {
            id: String(user.id),
            name: fullName,
            username: user.username,
            rol: user.rol,
            nombre: user.nombre,
            apellido: user.apellido ?? null,
            firma_url: user.firma_url ?? null,
          } as User;
        } catch (error) {
          console.error('Error en autenticación:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      // Persistir datos extra en el JWT (solo cuando hay login)
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.rol = (user as any).rol;
        token.nombre = (user as any).nombre;
        token.apellido = (user as any).apellido;
        token.firma_url = (user as any).firma_url;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponer datos en session.user para auto-completar formularios
      if (session.user) {
        (session.user as any).id = token.id ?? token.sub ?? null;
        (session.user as any).username = (token as any).username ?? null;
        (session.user as any).rol = (token as any).rol ?? null;
        (session.user as any).nombre = (token as any).nombre ?? null;
        (session.user as any).apellido = (token as any).apellido ?? null;
        (session.user as any).firma_url = (token as any).firma_url ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};


