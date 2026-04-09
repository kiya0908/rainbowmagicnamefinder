import { useState, forwardRef } from "react";
import { useMatches } from "react-router";
import { useUser } from "~/store";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleOAuthBtn, type GoogleOAuthBtnRef } from "./btn";

export { type GoogleOAuthBtnRef };

interface GoogleOAuthProps {
  useOneTap?: boolean;
  onSuccess?: () => void;
}
export const GoogleOAuth = forwardRef<GoogleOAuthBtnRef, GoogleOAuthProps>(
  ({ useOneTap, onSuccess }, ref) => {
    const matches = useMatches();
    const rootMatch = matches.find((match) => match.id === "root");
    const clientId =
      (rootMatch?.data as { GOOGLE_CLIENT_ID?: string } | undefined)
        ?.GOOGLE_CLIENT_ID ?? "";

    const setUser = useUser((state) => state.setUser);
    const setCredits = useUser((state) => state.setCredits);
    const [signing, setSigning] = useState(false);

    const handleSuccess = async (value: {
      access_token?: string;
      credential?: string;
    }) => {
      const values = {
        type: "google",
        data: value,
      };

      setSigning(true);
      try {
        const res = await fetch("/api/auth", {
          method: "post",
          credentials: "same-origin",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const message = await res.text().catch(() => "");
          console.error("[auth] Google login failed", res.status, message);
          return;
        }

        const { profile, credits } = (await res.json()) as {
          profile: UserInfo;
          credits: number;
        };

        setUser(profile);
        setCredits(credits);

        setTimeout(() => {
          onSuccess?.();
        }, 16);
      } catch (error) {
        console.error("[auth] Google login request error", error);
      } finally {
        setSigning(false);
      }
    };
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleOAuthBtn
          ref={ref}
          loading={signing}
          onSuccess={handleSuccess}
          useOneTap={useOneTap}
        />
      </GoogleOAuthProvider>
    );
  }
);
