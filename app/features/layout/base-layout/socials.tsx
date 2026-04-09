//base路由 用户面板socials组件
import clsx from "clsx";
import { Link } from "react-router";

import {
  UserDetail,
} from "~/components/icons";

interface SocialsProps extends React.ComponentProps<"div"> {
  iconSize?: number;
  strokeWidth?: number;
}
export const Socials = ({
  iconSize,
  strokeWidth = 1,
  className,
  ...props
}: SocialsProps) => {
  return (
    <div
      className={clsx("flex items-center justify-center gap-3 mb-4", className)}
      {...props}
    >
      <Link to="mailto:support@linkedinspeaktranslator.top" title="Support Email">
        <UserDetail
          strokeWidth={strokeWidth}
          width={iconSize}
          height={iconSize}
          className="w-6 h-6"
        />
      </Link>
    </div>
  );
};
