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
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log("Token refresh error:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export default NextAuth({
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
  debug: true, // Enable debug logs
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.copypastecalendar.com' : 'localhost'
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.copypastecalendar.com' : 'localhost'
      }
    }
  },
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("JWT Callback - Initial token:", {
        hasAccessToken: !!token.accessToken,
        hasRefreshToken: !!token.refreshToken,
        hasError: !!token.error
      });

      // Initial sign in
      if (account && user) {
        console.log("JWT Callback - New sign in detected");
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          user,
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        console.log("JWT Callback - Existing token still valid");
        return token
      }

      console.log("JWT Callback - Token expired, refreshing...");
      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      console.log("Session Callback - Token:", {
        hasAccessToken: !!token.accessToken,
        hasError: !!token.error
      });

      session.accessToken = token.accessToken
      session.error = token.error
      session.user = token.user

      console.log("Session Callback - Final session:", {
        hasAccessToken: !!session.accessToken,
        userEmail: session.user?.email,
        hasError: !!session.error
      });

      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect Callback:", { url, baseUrl });
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    }
  },
  events: {
    async signIn(message) {
      console.log("SignIn event:", message)
    },
    async signOut(message) {
      console.log("SignOut event:", message)
    },
    async error(message) {
      console.error("Error event:", message)
    }
  },
  logger: {
    error(code, ...message) {
      console.error("NextAuth Error:", { code, message })
    },
    warn(code, ...message) {
      console.warn("NextAuth Warning:", { code, message })
    },
    debug(code, ...message) {
      console.log("NextAuth Debug:", { code, message })
    }
  }
})