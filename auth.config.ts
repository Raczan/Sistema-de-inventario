import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicRoutes = ['/login', '/register'];
      const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

      if (isPublicRoute) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl));
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
