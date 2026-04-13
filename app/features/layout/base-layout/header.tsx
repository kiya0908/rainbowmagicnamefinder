////base路由 用户面板header组件
import clsx from "clsx";
import { Fragment } from "react";

import { useUser } from "~/store";
import { useWindowScroll } from "~/hooks/dom";
import { GoogleOAuth } from "~/features/oauth";

import { Logo, Link } from "~/components/common";
import { Image } from "~/components/common";

export interface HeaderProps {
  navLinks: Array<{
    to: string;
    label: string;
    target?: React.HTMLAttributeAnchorTarget;
  }>;
}
export const Header = ({ navLinks }: HeaderProps) => {
  const user = useUser((state) => state.user);
  const credits = useUser((state) => state.credits);

  const { y } = useWindowScroll();
  const isScroll = y >= 30;

  return (
    <Fragment>
      <header
        data-scroll={isScroll}
        className={clsx(
          "sticky top-0 left-0 w-full z-50 transition-all duration-300",
          "bg-transparent h-24 data-[scroll=true]:h-16 max-md:h-16",
          "data-[scroll=true]:bg-white/90 data-[scroll=true]:shadow data-[scroll=true]:backdrop-blur"
        )}
      >
        <div className="container flex h-full items-center">
          <Link to="/">
            <Logo
              label="Rainbow Magic Fairy Name Finder"
              imageAlt="Rainbow Magic Fairy Name Finder logo"
            />
          </Link>
          <nav className="mx-8 [&>a]:hover:underline flex items-center gap-6 whitespace-nowrap max-md:hidden">
            {navLinks.map((link, i) => (
              <Link key={i} to={link.to} target={link.target}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="grow" />
          <div className="flex items-center justify-center gap-4">
            {user !== void 0 && (
              <>
                {user ? (
                  <div className="flex items-center gap-2 max-w-32">
                    <div className="avatar">
                      <div className="w-8 rounded-full bg-base-300">
                        {user.avatar && (
                          <Image loading="eager" src={user.avatar} />
                        )}
                      </div>
                    </div>
                    <div className="text-xs leading-none flex-1 min-w-0 whitespace-nowrap">
                      <div className="font-bold mb-0.5 overflow-hidden overflow-ellipsis">
                        {user.name}
                      </div>
                      <div className="opacity-70 overflow-hidden overflow-ellipsis">
                        Credits: {credits}
                      </div>
                    </div>
                  </div>
                ) : (
                  <GoogleOAuth useOneTap />
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </Fragment>
  );
};
