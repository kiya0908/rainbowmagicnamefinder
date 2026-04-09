import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/index";

import { BaseLayout, type BaseLayoutProps } from "~/features/layout";
import { shouldRequireBaseAuth } from "~/.server/libs/base-auth";
import { getSessionHandler } from "~/.server/libs/session";
import { Sidebar } from "./components/sidebar";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const [session] = await getSessionHandler(request);
  const user = session.get("user") ?? null;
  const requireAuth = shouldRequireBaseAuth(context);

  if (!user && requireAuth) {
    throw redirect("/?login=true");
  }

  const header: BaseLayoutProps["header"] = {
    navLinks: [
      { label: "Dashboard", to: "/base/profile" },
      { label: "Pricing", to: "/#pricing" },
      { label: "FAQs", to: "/#faq" },
      {
        label: "Support",
        to: "mailto:support@linkedinspeaktranslator.top",
        target: "_blank",
      },
    ],
  };

  const footer: BaseLayoutProps["footer"] = {
    navLinks: [
      {
        label: "Tools",
        list: [{ to: "/", label: "LinkedIn Translator" }],
      },
      {
        label: "Support",
        list: [
          {
            to: "mailto:support@linkedinspeaktranslator.top",
            label: "support@linkedinspeaktranslator.top",
            target: "_blank",
          },
        ],
      },
      {
        label: "Legal",
        list: [
          { to: "/legal/terms", label: "Terms of Use", target: "_blank" },
          { to: "/legal/privacy", label: "Privacy Policy", target: "_blank" },
          {
            to: "/legal/acceptable-use",
            label: "Acceptable Use Policy",
            target: "_blank",
          },
          { to: "/legal/refund", label: "Refund Policy", target: "_blank" },
        ],
      },
    ],
  };

  return { header, footer, user, isGuestPreview: user === null };
};

export default function Layout({
  loaderData: { header, footer, user, isGuestPreview },
}: Route.ComponentProps) {
  return (
    <BaseLayout header={header} footer={footer}>
      <div className="bg-base-200/35 border-y border-base-300/70">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid items-start gap-6 md:grid-cols-[17rem,minmax(0,1fr)] min-h-[calc(100vh-18rem)]">
            <Sidebar />
            <main className="min-w-0 rounded-2xl border border-base-300 bg-base-100/95 p-5 md:p-8 shadow-sm">
              <Outlet context={{ user, isGuestPreview }} />
            </main>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
