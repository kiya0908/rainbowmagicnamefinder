import type { Route } from "./+types/profile";
import { useOutletContext } from "react-router";
import type { User } from "~/.server/libs/db";
import { Image } from "~/components/common";
import { createSeoDescriptors } from "~/utils/meta";
import {
  PageIntro,
  StatTile,
  formatDate,
} from "./components/workspace";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Profile | Rainbow Magic Fairy Name Finder Account";
  const description =
    "View your Rainbow Magic Fairy Name Finder Account profile details, sign-in identity, and member status.";

  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/base/profile",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      robots: "noindex, nofollow",
    }),
  ];
};

export default function Profile() {
  const { user, isGuestPreview } = useOutletContext<{
    user: User | null;
    isGuestPreview: boolean;
  }>();

  const displayName = user?.nickname?.trim() || "Local Preview User";
  const accountEmail = user?.email ?? "--";
  const memberSince = user ? formatDate(user.created_at) : "--";
  const avatar =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Profile"
        description={
          isGuestPreview
            ? "Local preview mode is enabled. Sign in to view your real account identity."
            : "Review your account identity and sign-in details."
        }
        action={
          isGuestPreview
            ? { label: "Sign in to continue", to: "/?login=true" }
            : { label: "Credit history", to: "/base/credits" }
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Account Email"
          value={accountEmail}
          helper={
            isGuestPreview
              ? "Guest preview mode; no account is signed in."
              : "Primary login identity"
          }
        />
        <StatTile
          label="Member Since"
          value={memberSince}
          helper={
            isGuestPreview
              ? "Sign in to load your actual account timeline."
              : "First successful sign-in"
          }
        />
        <StatTile
          label="Auth Provider"
          value={isGuestPreview ? "Guest Preview" : "Google"}
          helper={
            isGuestPreview
              ? "This page is rendered without authentication."
              : "Profile fields are synced from your provider"
          }
        />
      </div>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="avatar">
            <div className="w-20 rounded-full ring ring-primary/30 ring-offset-base-100 ring-offset-2">
              <Image loading="eager" src={avatar} alt={`${displayName} avatar`} />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">{displayName}</h2>
            <p className="text-sm text-base-content/70 truncate">{accountEmail}</p>
            <div
              className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                isGuestPreview ? "bg-warning/20 text-warning" : "bg-success/15 text-success"
              }`}
            >
              {isGuestPreview ? "Local preview mode" : "Account active"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-base-300 p-4">
            <div className="text-xs uppercase tracking-wide text-base-content/60">Nickname</div>
            <div className="mt-2 text-sm font-medium break-all">{displayName}</div>
          </div>
          <div className="rounded-xl border border-base-300 p-4">
            <div className="text-xs uppercase tracking-wide text-base-content/60">Email</div>
            <div className="mt-2 text-sm font-medium break-all">{accountEmail}</div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-base-300 bg-base-200/45 p-4 text-sm text-base-content/75">
          {isGuestPreview
            ? "This is a local guest preview. Sign in with Google to load your real profile and account details."
            : "Profile name and avatar are sourced from your login provider. If you update those on Google, sign in again to refresh this page."}
        </div>
      </section>
    </div>
  );
}
