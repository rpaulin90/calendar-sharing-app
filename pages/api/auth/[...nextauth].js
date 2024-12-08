import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

async function refreshAccessToken(token) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      })

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.log("Token refresh error:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/directory.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : 'localhost'
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("SignIn Callback:", { 
        userEmail: user?.email,
        hasAccount: !!account,
        hasProfile: !!profile
      });
      return true;
    },
    async jwt({ token, account, user }) {
      console.log("JWT Callback Entry:", {
        hasExistingToken: !!token,
        hasAccount: !!account,
        hasUser: !!user,
        tokenExp: token?.accessTokenExpires,
        currentTime: Date.now()
      });

      // Initial sign in
      if (account && user) {
        console.log("JWT - New sign in processing");
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          user,
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        console.log("JWT - Using existing valid token");
        return token
      }

      console.log("JWT - Attempting token refresh");
      return refreshAccessToken(token)
    },
    async session({ session, token, user }) {
      console.log("Session Callback Entry:", {
        hasSession: !!session,
        hasToken: !!token,
        hasUser: !!user,
        sessionUser: session?.user?.email,
        tokenUser: token?.user?.email
      });

      session.accessToken = token.accessToken
      session.error = token.error
      session.user = token.user

      console.log("Session Callback Exit:", {
        hasAccessToken: !!session.accessToken,
        userEmail: session.user?.email,
        hasError: !!session.error
      });

      return session
    }
  },
  events: {
    async signIn(message) {
      console.log("SignIn Event:", message)
    },
    async signOut(message) {
      console.log("SignOut Event:", message)
    },
    async session(message) {
      console.log("Session Event:", message)
    },
    async error(message) {
      console.error("Error Event:", message)
    }
  }
}

export default NextAuth(authOptions)