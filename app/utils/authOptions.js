// import { cookies } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { rawFetch } from "../lib/fetcher/rawFetch";

let refreshPromise = null;

const refreshAccessToken = async (token) => {

  console.log(">>> REFRESH ACCESS TOKEN CALLED");
  console.log("TIME:", Date.now());

  if (!token.refreshToken) {
    console.log("NO REFRESH TOKEN FOUND");
    throw new Error("Missing refresh token");
  }

  if (!refreshPromise) {
    console.log("CREATING NEW REFRESH PROMISE");
    refreshPromise = (async () => {
      const result = await rawFetch("/api/customer/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: token.refreshToken,
        }),
      });

      console.log("REFRESH RESPONSE:", result);

      if (!result.ok) {
        console.log("REFRESH FAILED");
        throw new Error("Failed to refresh access token");
      }

      return {
        accessToken: result.data.accessToken,
        accessTokenExpires: Date.now() + 15 * 60 * 1000,
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

      console.log("=== JWT CALLBACK ===");
      console.log("NOW:", Date.now());
      console.log("TOKEN EXPIRES:", token.accessTokenExpires);

      if (token.accessTokenExpires) {
        console.log(
          "IS EXPIRED:",
          Date.now() > token.accessTokenExpires
        );
      }

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

          // cookies().set("refreshToken", userData.refreshToken, {
          //   httpOnly: true,
          //   secure: true,
          //   sameSite: "None",
          //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          // });

          token._id = userData._id;
          token.email = userData.email;
          token.accessToken = userData.accessToken;
          token.refreshToken = userData.refreshToken;
          token.accessTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

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
        console.log("TOKEN STILL VALID - RETURNING OLD TOKEN");
        return token;
      }

      console.log("TOKEN EXPIRED - REFRESHING");
      // expired — refresh
      const refreshedToken = await refreshAccessToken(token);

      console.log("REFRESH COMPLETE");
      console.log("NEW EXPIRY:", refreshedToken.accessTokenExpires);

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