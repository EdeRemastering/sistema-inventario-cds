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
          console.log('revisando lo que viene del formulario:', credentials);
          if (!credentials?.username || !credentials?.password) return null;

          const user = await prisma.usuarios.findUnique({
            where: { username: credentials.username },
          });
          console.log('revisando lo que viene de la base de datos:', user);

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('revisando si la contraseña es válida:', isValid);

          if (!isValid) return null;

          console.log('retornando el usuario:', {
            id: String(user.id),
            name: user.nombre,
          });

          return {
            id: String(user.id),
            name: user.nombre,
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
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};


