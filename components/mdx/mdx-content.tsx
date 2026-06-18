import Link from "next/link";
import type { ComponentType } from "react";

/* Custom MDX element mapping. Internal links go through next/link; the rest of
   the styling is handled by the `.prose` wrapper in globals.css. */
const components = {
  a: ({ href = "", children, ...props }: { href?: string; children?: React.ReactNode }) => {
    if (href.startsWith("/") || href.startsWith("#")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MDXContent({ body: Body }: { body: ComponentType<any> }) {
  return (
    <div className="prose">
      <Body components={components} />
    </div>
  );
}
