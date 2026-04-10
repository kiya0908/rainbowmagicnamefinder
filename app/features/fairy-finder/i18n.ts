export const FAIRY_FINDER_PRODUCT_NAME = "Rainbow Magic Fairy Name Finder";

export type FairyFinderLocale = "en";

interface FairyFinderNavLink {
  label: string;
  href: string;
}

interface FairyFinderFooterLink {
  to: string;
  label: string;
  target?: string;
}

interface FairyFinderFooterNavGroup {
  label: string;
  list: FairyFinderFooterLink[];
}

interface FairyFinderFAQItem {
  question: string;
  answer: string;
}

interface FairyFinderHomeCopy {
  navbar: {
    logoAlt: string;
    signIn: string;
    credits: string;
    navLinks: FairyFinderNavLink[];
  };
  footer: {
    description: string;
    directoryBadgeTitle: string;
    navLinks: FairyFinderFooterNavGroup[];
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    submitLabel: string;
  };
  howItWorks: {
    title: string;
    steps: string[];
  };
  whatIs: {
    title: string;
    paragraphs: string[];
  };
  faq: {
    title: string;
    items: FairyFinderFAQItem[];
  };
  cta: {
    title: string;
    buttonLabel: string;
  };
}

const EN_HOME_COPY: FairyFinderHomeCopy = {
  navbar: {
    logoAlt: "Rainbow Magic Fairy Name Finder logo",
    signIn: "Sign in",
    credits: "Credits",
    navLinks: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "What Is", href: "#what-is" },
      { label: "FAQ", href: "#faq" },
      { label: "Blog", href: "/blog" },
    ],
  },
  footer: {
    description:
      "Discover your Rainbow Magic fairy identity in seconds and share it with friends.",
    directoryBadgeTitle: "Featured on directories",
    navLinks: [
      {
        label: "Explore",
        list: [
          { to: "#how-it-works", label: "How It Works" },
          { to: "#what-is", label: "What Is" },
          { to: "#faq", label: "FAQ" },
        ],
      },
      {
        label: "Legal",
        list: [
          { to: "/legal/privacy", label: "Privacy Policy" },
          { to: "/legal/terms", label: "Terms of Service" },
          { to: "/legal/cookie", label: "Cookie Policy" },
        ],
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
    ],
  },
  hero: {
    eyebrow: "✨ Rainbow Magic",
    title: "Find Your Rainbow Magic Fairy Name",
    subtitle: "Enter your name and discover your fairy identity!",
    inputLabel: "Your name",
    inputPlaceholder: "Type your name",
    submitLabel: "Find My Fairy",
  },
  howItWorks: {
    title: "How It Works",
    steps: [
      "Enter your name",
      "Get your fairy identity",
      "Share with friends",
    ],
  },
  whatIs: {
    title: "What Is Rainbow Magic Fairy Name Finder?",
    paragraphs: [
      "Rainbow Magic Fairy Name Finder is a quick identity game that maps your name to a fairy character.",
      "Each result is deterministic, so the same name always returns the same fairy identity.",
      "You can share your match and compare results with your friends.",
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "Is this free to use?",
        answer: "Yes. The name matching tool is free in Phase 1.",
      },
      {
        question: "Will I always get the same fairy?",
        answer: "Yes. The same name always maps to the same fairy result.",
      },
      {
        question: "Can I create my own fairy?",
        answer: "Not in Phase 1. Custom generation is planned for Phase 2.",
      },
    ],
  },
  cta: {
    title: "Ready to Find Your Fairy Name?",
    buttonLabel: "Find My Fairy",
  },
};

export const getFairyFinderHomeCopy = (
  locale: FairyFinderLocale = "en"
): FairyFinderHomeCopy => {
  if (locale === "en") return EN_HOME_COPY;
  return EN_HOME_COPY;
};
