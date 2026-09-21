import { cookies } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { rawFetch } from "../lib/fetcher/rawFetch";

const refreshAccessToken = async (token) => {
  try {
    const result = await rawFetch("/api/customer/refresh-token", {
      method: "POST",
      headers: { Cookie: cookies().toString() },
    });

    if (!result.ok) {
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    const newAccessToken = result.data?.accessToken;

    if (!newAccessToken) {
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
      error: undefined,
    };
  } catch (error) {
    console.error(
      `RefreshTokenError (authOptions/refreshAccessToken): ${error.message || "Failed to refresh access token."}`,
    );
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
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
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          if (!result.ok)
            throw new Error(
              result.message || "Invalid credentials. Please try again.",
            );

          const { customer, accessToken, refreshToken } = result.data;

          return {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            accessToken,
            refreshToken,
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

          // Backend returns: { customer, accessToken, refreshToken }
          const { customer, accessToken, refreshToken } = result.data;

          return {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            image: profile.picture,
            accessToken,
            refreshToken,
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
      // Initial sign-in: tokens are already returned from authorize / profile
      if (user && account) {
        try {
          if (user.refreshToken) {
            cookies().set("refreshToken", user.refreshToken, {
              httpOnly: true,
              secure: true,
              sameSite: "None",
              maxAge: 7 * 24 * 60 * 60, // 7 days
            });
          }
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.accessToken = user.accessToken;
          token.accessTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
          return token;
        } catch (error) {
          console.error(
            `TokenError (authOptions/callbacks/jwt): ${error.message || "Failed to set user tokens."}`,
          );
          throw new Error(error.message);
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};