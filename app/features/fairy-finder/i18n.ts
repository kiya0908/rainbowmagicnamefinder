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

interface FairyFinderHowItWorksMethod {
  label: string;
  title: string;
  description: string;
  example: string;
}

interface FairyFinderWhatIsHighlight {
  label: string;
  title: string;
  description: string;
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
    eyebrow: string;
    title: string;
    intro: string[];
    spotlight: {
      label: string;
      title: string;
      description: string;
      examples: string[];
    };
    methodsTitle: string;
    methods: FairyFinderHowItWorksMethod[];
    profile: {
      title: string;
      paragraphs: string[];
    };
    highlightsTitle: string;
    highlights: string[];
  };
  whatIs: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    highlights: FairyFinderWhatIsHighlight[];
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
    ],
  },
  footer: {
    description:
      "Discover your Rainbow Magic fairy name in seconds and share it with friends.",
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
    eyebrow: "How It Works",
    title: "How It Works",
    intro: [
      "This homepage uses three linked blocks: How It Works, What Is, and FAQ. The rainbow magici fairy name finder flow is kept direct so a first-time visitor can read the rule and test it immediately. Every rainow magic fairy name lookup follows one visible pattern, which reduces confusion and makes the result easier to trust.",
      "The matching logic is deterministic: normalize input, check first-name index, return exact match card or no-match card. There is no hash fallback and no random substitute card. This fixes the earlier issue where users could type Lily or Apple and see an unrelated title. In daily use, each rainow magic fairy name query is now easier to verify and easier to explain.",
    ],
    spotlight: {
      label: "Core Flow",
      title: "Type -> Match -> Share",
      description:
        "The engine is intentionally narrow: normalize input, check name index, render one stable card state. This keeps the rainbow magici fairy name finder predictable for readers and maintainers. If the input is a valid rainow magic fairy name, the result card shows the exact fairy title and cover image taken from the curated list.",
      examples: [
        "Enter a first name",
        "Get exact match",
        "Share result",
      ],
    },
    methodsTitle: "Quick usage tips",
    methods: [
      {
        label: "Tip 1",
        title: "Use exact first names",
        description:
          "Start with the exact first name printed in official lists. One correct entry gives you a clean baseline before trying variants, nicknames, or uncertain spellings.",
        example:
          "Try Lily, Ruby, Sky, Saffron, or Amber and compare how each rainow magic fairy name maps to a specific card title.",
      },
      {
        label: "Tip 2",
        title: "Check spelling carefully",
        description:
          "When no result appears, treat it as a data-check step. Remove extra spaces, punctuation, and short nicknames, then submit again with the canonical first name.",
        example:
          "For demos or classroom use, keep a short verified list beside the input so users can test the rainbow magici fairy name finder without ambiguity.",
      },
      {
        label: "Tip 3",
        title: "Explore quickly",
        description:
          "Use batch-style exploration: run several names in sequence, record the cards, and note which series family each fairy belongs to.",
        example:
          "This is a practical way to review broad coverage, from early Rainbow Fairies to newer Orchard Series releases in one session.",
      },
    ],
    profile: {
      title: "What appears in each result",
      paragraphs: [
        "Each successful match card includes a concrete fairy title and a book cover image. That pairing matters because many users remember names but not exact titles, and others remember titles but not character spelling.",
        "If there is no hit, the interface states that directly and offers Try Another Name. In practice, this keeps repeated rainow magic fairy name checks fast for fans, teachers, and collectors who are validating long lists.",
      ],
    },
    highlightsTitle: "Why this format works",
    highlights: [
      "Clear state model: match or no-match, with no hidden random fallback.",
      "High scan speed: concise text blocks, predictable actions, and low reading overhead.",
      "Reusable for QA when validating rainbow magici fairy name finder copy updates.",
      "Compatible with mobile and desktop name lookup behavior.",
      "Aligned with the new no-fallback matching rule.",
    ],
  },
  whatIs: {
    eyebrow: "Section 2",
    title: "What Is the Rainbow Magic Fairy Name Finder?",
    paragraphs: [
      "The rainbow magic fairy name finder is a focused platform for the Rainbow Magic universe. It works as both identity generator and compact encyclopedia for readers who want fast, accurate discovery. Input a first name and get an exact card if the name exists. That makes each rainow magic fairy name search a reliable lookup, not a random suggestion.",
      "The project is also a tribute to Fairyland, where fairies protect magic from Jack Frost and his goblins. Because the Orchard Series includes many books, readers often lose track of who belongs to which line. This page gives repeatable title-level identity. It includes classic names like Ruby the Red Fairy and Saffron the Yellow Fairy, and newer groups like Nur the Vlogger Fairy and Zelda the Gamer Fairy.",
      "Every fairy name is tied to a talent, element, or role, so the database can work as a reading guide. New readers can start with Amber the Orange Fairy or Fern the Green Fairy. Collectors can use the same page as a checklist across categories. It also keeps the community tone: friendship, kindness, and imagination, reflected by names like Florence the Friendship Fairy and Esther the Kindness Fairy.",
    ],
    highlights: [
      {
        label: "Origins",
        title: "From classic to modern fairy lines",
        description:
          "Includes classic Rainbow Fairies and newer lines such as Vlogger, Gamer, and other modern themed groups.",
      },
      {
        label: "Reader Value",
        title: "Guide + checklist in one place",
        description:
          "Supports new readers choosing entry points and gives collectors a practical way to track known and unknown names.",
      },
      {
        label: "Community",
        title: "Kindness-centered fan identity",
        description:
          "Frames fairy naming as a shared fan identity built around friendship, imagination, and inclusive discovery.",
      },
    ],
  },
  faq: {
    title: "FAQ: Understanding Your Rainbow Magic Fairy Name",
    items: [
      {
        question: "Where does the rainbow magic fairy name finder get its data?",
        answer:
          "The dataset is curated from official Rainbow Magic / Orchard Series references and verified A-Z style listings. The rainbow magici fairy name finder maps first names to full titles and cover records, so each card points to a real series character.",
      },
      {
        question: "How many characters are in the rainbow magic fairy name finder?",
        answer:
          "The catalog includes hundreds of entries across early and newer releases. This gives users both famous names and less common characters while keeping routine quality checks manageable.",
      },
      {
        question: "Why do I get a no-match result after entering a name?",
        answer:
          "Matching is exact-first-name only. If input does not match a known record, the page returns no-match by design. The old random fallback was removed because strict matching is easier to trust and test.",
      },
      {
        question: "Can I use this tool to discover books to buy or read?",
        answer:
          "Yes. Each matched card points to a real character title, which helps users build a short reading list before checking retailers or libraries.",
      },
      {
        question: "Is my result tied to a specific group or series line?",
        answer:
          "Usually yes. The card title reflects series context, so users can tell whether a match belongs to a classic line, an Early Reader line, or another themed collection.",
      },
      {
        question: "Does the dataset include newer fairies too?",
        answer:
          "Yes. The list is updated when source data is confirmed, so coverage can include newer additions while keeping matching quality stable.",
      },
      {
        question: "Is this free, and can I share the result card?",
        answer:
          "Yes. Phase 1 is free to use. The share action supports native sharing where possible and degrades to copy-link behavior where needed, so posting your result works on both mobile and desktop with minimal friction.",
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
