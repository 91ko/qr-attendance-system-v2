import NextAuth from "next-auth"
import KakaoProvider from "next-auth/providers/kakao"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile_nickname profile_image"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { user, account, profile })
      return true
    },
    async jwt({ token, user, account, profile }) {
      console.log("JWT callback:", { token, user, account, profile })
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
        // Force HTTPS for Kakao profile images
        if (user.image && user.image.startsWith('http://')) {
          token.image = user.image.replace('http://', 'https://')
        } else {
          token.image = user.image
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token })
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          name: token.name as string | null,
          email: token.email as string | null,
          image: token.image as string | null,
        },
      }
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: true,
})

export { handler as GET, handler as POST }
