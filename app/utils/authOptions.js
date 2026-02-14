import { cookies } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { rawFetch } from "../lib/fetcher/rawFetch";
import { jwtDecode } from "jwt-decode";

let refreshPromise = null;

const refreshAccessToken = async (token) => {

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const result = await rawFetch("/api/customer/refresh-token", {
        method: "POST",
        headers: { Cookie: cookies().toString() },
      });

      if (!result.ok) {
        throw new Error("Failed to refresh access token");
      }

      const accessToken = result.data.accessToken;
      const decoded = jwtDecode(accessToken);

      return {
        accessToken: accessToken,
        accessTokenExpires: decoded.exp * 1000,
      };
    })();
  }

  try {
    const refreshed = await refreshPromise;
    return {
      ...token,
      ...refreshed,
      error: undefined,
    };
  } catch (err) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  } finally {
    refreshPromise = null;
  }
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const result = await rawFetch("/api/customer/verify-credentials-login", {
            method: "POST",
            body: JSON.stringify(credentials),
          });

          if (!result.ok)
            throw new Error(
              result.message || "Invalid credentials. Please try again.",
            );

          return {
            email: credentials.email,
          };
        } catch (error) {
          console.error(
            `VerifyError (authOptions/authorize): ${error.message || "Failed to verify login credentials."}`,
          );
          throw new Error(error.message);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        try {
          const result = await rawFetch("/api/customer/verify-google-login", {
            method: "POST",
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
            }),
          });

          if (!result.ok)
            throw new Error(
              result.message || "Failed to authenticate with Google.",
            );

          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
          };
        } catch (error) {
          console.error(
            `VerifyError (authOptions/profile): ${error.message || "Failed to authenticate with Google."}`,
          );
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        try {
          const result = await rawFetch("/api/customer/generate-customer-tokens", {
            method: "POST",
            body: JSON.stringify({ email: user.email }),
          });

          if (!result.ok)
            throw new Error(
              result.message || "Failed to generate customer tokens.",
            );

          const userData = result.data;

          cookies().set("refreshToken", userData.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });

          const decoded = jwtDecode(userData.accessToken);

          token._id = userData._id;
          token.email = userData.email;
          token.accessToken = userData.accessToken;
          token.accessTokenExpires = decoded.exp * 1000;

          return token;
        } catch (error) {
          console.error(
            `TokenError (authOptions/callbacks/jwt): ${error.message || "Failed to generate customer tokens."}`,
          );
          // throw new Error(error.message);
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }

      const REFRESH_BUFFER = 60 * 1000; // 60 seconds

      // Return previous token if the access token has not expired yet
      if (token.accessToken && Date.now() < token.accessTokenExpires - REFRESH_BUFFER) {
        return token;
      }

      // expired — refresh
      const refreshedToken = await refreshAccessToken(token);

      // 🔥 GUARANTEE
      if (!refreshedToken.accessToken) {
        return {
          ...token,
          error: "AccessTokenMissingAfterRefresh",
        };
      }

      return refreshedToken;
    },
    async session({ session, token }) {

      if (!token.accessToken) {
        session.error = "UNAUTHORIZED";
        return session;
      }

      session.user._id = token._id;
      session.user.email = token.email;
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
}