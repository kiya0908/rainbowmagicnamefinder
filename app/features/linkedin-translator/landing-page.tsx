/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  ArrowRight,
  ArrowRightLeft,
  Check,
  ChevronDown,
  Clock,
  Cpu,
  Eye,
  FileText,
  Languages,
  MessageSquare,
  RefreshCcw,
  Search,
  Settings2,
  Shield,
  Sliders,
  Target,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { PublicSiteLayout } from "~/features/layout/base-layout/public-site-layout";
import { GoogleOAuth } from "~/features/oauth/google";
import { useUser } from "~/store";

import {
  getLinkedinTranslatorHomePageCopy,
  type LinkedinTranslatorLocale,
} from "./i18n";
import {
  getLinkedinTranslatorPricingCards,
  LINKEDIN_TRANSLATOR_PRIMARY_PRICING_CARD_ID,
  LINKEDIN_TRANSLATOR_SUPPORT_EMAIL,
} from "./pricing";
import { TranslationInterface } from "./translation-interface";

interface LazyGoogleOAuthProps {
  className?: string;
  label: string;
}

interface LandingPageProps {
  locale: LinkedinTranslatorLocale;
}

function LazyGoogleOAuth({ className, label }: LazyGoogleOAuthProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  if (shouldLoad) {
    return <GoogleOAuth />;
  }

  return (
    <button
      type="button"
      className={`btn btn-primary ${className ?? ""}`.trim()}
      onClick={() => setShouldLoad(true)}
    >
      {label}
    </button>
  );
}

export default function LinkedinTranslatorLandingPage({
  locale,
}: LandingPageProps) {
  const copy = getLinkedinTranslatorHomePageCopy(locale);
  const pricingCards = getLinkedinTranslatorPricingCards(locale);
  const localeSwitchTo = locale === "en" ? "/zh" : "/";

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkouting, setCheckouting] = useState(false);
  const [pricingMessage, setPricingMessage] = useState("");
  const user = useUser((state) => state.user);

  const aboutIcons = [Shield, Zap, MessageSquare, Languages];
  const stepIcons = [FileText, ArrowRightLeft, Sliders];
  const directionIcons = [Wand2, RefreshCcw];
  const technicalIcons = [Cpu, Settings2, Eye];
  const whyUsIcons = [Clock, TrendingUp, Target, Search];

  const handleCheckout = async (productId: string) => {
    setPricingMessage("");
    setCheckouting(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.status === 401) {
        setPricingMessage(copy.pricing.signInBeforeCheckout);
        return;
      }

      if (!response.ok) {
        throw new Error((await response.text()) || copy.pricing.checkoutUnavailable);
      }

      const session = (await response.json()) as { checkout_url?: string };
      if (!session.checkout_url) {
        throw new Error(copy.pricing.invalidCheckout);
      }

      window.location.href = session.checkout_url;
    } catch (error) {
      setPricingMessage(
        error instanceof Error
          ? error.message
          : copy.pricing.checkoutUnavailable
      );
    } finally {
      setCheckouting(false);
    }
  };

  return (
    <PublicSiteLayout locale={locale} localeSwitchTo={localeSwitchTo}>
      <section className="pt-24 pb-32 px-6 bg-surface">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-secondary-fixed text-primary text-[10px] font-bold tracking-widest uppercase rounded-full mb-6">
              {copy.hero.eyebrow}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface mb-8 leading-[1.1]">
              {copy.hero.title}
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              {copy.hero.description}
            </p>
          </div>

          <TranslationInterface locale={locale} />
        </section>

        <section id="about" className="py-32 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                {copy.about.eyebrow}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                {copy.about.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-4xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: copy.about.descriptionHtml }}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {copy.about.cards.map((card, index) => {
                const Icon = aboutIcons[index];

                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white p-8 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col h-full"
                  >
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{card.title}</h3>
                    <p
                      className="text-sm text-on-surface-variant leading-relaxed flex-grow"
                      dangerouslySetInnerHTML={{ __html: card.descriptionHtml }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-32 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                {copy.howItWorks.eyebrow}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                {copy.howItWorks.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: copy.howItWorks.descriptionHtml,
                }}
              />
            </div>

            <div className="mb-32">
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold mb-4">
                  {copy.howItWorks.stepsTitle}
                </h3>
                <p
                  className="text-on-surface-variant"
                  dangerouslySetInnerHTML={{
                    __html: copy.howItWorks.stepsIntroHtml,
                  }}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-12">
                {copy.howItWorks.steps.map((step, index) => {
                  const Icon = stepIcons[index];

                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="text-left p-8 rounded-2xl hover:bg-surface-container-low transition-all border border-transparent hover:border-outline-variant"
                    >
                      <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center mb-6">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-xl font-bold mb-4">{step.title}</h4>
                      <p
                        className="text-on-surface-variant leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: step.descriptionHtml }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mb-32">
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold mb-4">
                  {copy.howItWorks.directionsTitle}
                </h3>
                <p
                  className="text-on-surface-variant max-w-2xl mx-auto"
                  dangerouslySetInnerHTML={{
                    __html: copy.howItWorks.directionsIntroHtml,
                  }}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {copy.howItWorks.directions.map((card, index) => {
                  const Icon = directionIcons[index];
                  const isPrimary = index === 0;

                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, x: isPrimary ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className={[
                        "p-10 rounded-3xl border relative overflow-hidden",
                        isPrimary
                          ? "bg-primary/5 border-primary/10"
                          : "bg-surface-container-high border-outline-variant",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10",
                          isPrimary
                            ? "bg-primary/10"
                            : "bg-surface-container-highest",
                        ].join(" ")}
                      />
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className={[
                            "w-10 h-10 rounded-full flex items-center justify-center text-white",
                            isPrimary ? "bg-primary" : "bg-on-surface",
                          ].join(" ")}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4
                          className={[
                            "text-2xl font-bold",
                            isPrimary ? "text-primary" : "",
                          ].join(" ")}
                        >
                          {card.title}
                        </h4>
                      </div>
                      <p
                        className="text-on-surface-variant leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: card.descriptionHtml }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold mb-4">
                  {copy.howItWorks.technicalTitle}
                </h3>
                <p
                  className="text-on-surface-variant max-w-2xl mx-auto"
                  dangerouslySetInnerHTML={{
                    __html: copy.howItWorks.technicalIntroHtml,
                  }}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {copy.howItWorks.technicalCards.map((card, index) => {
                  const Icon = technicalIcons[index];

                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white p-8 rounded-2xl ambient-shadow border-t-4 border-t-primary border-x border-b border-x-outline-variant border-b-outline-variant"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                        <h4 className="text-lg font-bold">{card.title}</h4>
                      </div>
                      <p
                        className="text-sm text-on-surface-variant leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: card.descriptionHtml }}
                      />
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 text-center max-w-3xl mx-auto bg-primary/5 p-8 rounded-2xl border border-primary/10"
              >
                <p
                  className="text-lg text-on-surface-variant leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: copy.howItWorks.summaryHtml,
                  }}
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-surface-container-low/50">
          <div className="max-w-5xl mx-auto space-y-6">
            {copy.comparisons.items.map((item) => (
              <div key={item.friction} className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full p-8 bg-white rounded-xl border border-outline-variant">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3">
                    {copy.comparisons.frictionLabel}
                  </div>
                  <p className="text-lg font-medium italic text-on-surface-variant">
                    "{item.friction}"
                  </p>
                </div>
                <ArrowRight className="hidden md:block w-6 h-6 text-on-surface-variant/30" />
                <div className="flex-1 w-full p-8 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                    {copy.comparisons.pivotLabel}
                  </div>
                  <p className="text-lg font-semibold text-primary">
                    "{item.pivot}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="why-choose-us" className="py-32 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                {copy.whyUs.eyebrow}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                {copy.whyUs.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-4xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: copy.whyUs.descriptionHtml }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {copy.whyUs.cards.map((card, index) => {
                const Icon = whyUsIcons[index];

                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white p-10 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col"
                  >
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                    <p
                      className={card.bullets ? "text-on-surface-variant leading-relaxed mb-6" : "text-on-surface-variant leading-relaxed"}
                      dangerouslySetInnerHTML={{ __html: card.descriptionHtml }}
                    />
                    {card.bullets ? (
                      <ul className="space-y-4 mt-auto">
                        {card.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span
                              className="text-on-surface-variant leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: bullet }}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto bg-primary text-white p-10 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full -z-10 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-tr-full -z-10 blur-2xl" />
              <p
                className="text-xl md:text-2xl leading-relaxed font-medium relative z-10"
                dangerouslySetInnerHTML={{ __html: copy.whyUs.summaryHtml }}
              />
            </motion.div>
          </div>
        </section>

        <section id="pricing" className="py-32 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">{copy.pricing.title}</h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto">
                {copy.pricing.description}
              </p>
            </div>

            {pricingMessage ? (
              <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-on-surface-variant">
                {pricingMessage}
              </div>
            ) : null}

            <div className="grid md:grid-cols-3 gap-8">
              {pricingCards.map((card) => {
                const isPrimary =
                  card.id === LINKEDIN_TRANSLATOR_PRIMARY_PRICING_CARD_ID;
                const isTeamContactOnly =
                  card.id === "team" && !card.productId;

                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ y: -8 }}
                    className={[
                      "bg-white p-10 rounded-2xl flex flex-col h-full relative",
                      isPrimary
                        ? "border border-primary/30 ambient-shadow"
                        : "border border-outline-variant",
                    ].join(" ")}
                  >
                    {isPrimary ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        {copy.pricing.primaryBadge}
                      </div>
                    ) : null}

                    <div className="mb-8">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
                        {card.name}
                      </h3>
                      <div className="text-4xl font-extrabold text-primary mb-3">
                        {card.priceLabel}
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-2">
                        {card.description}
                      </p>
                      <p className="text-sm text-on-surface-variant font-medium">
                        {card.badge}
                      </p>
                    </div>

                    {isTeamContactOnly ? (
                      <a
                        href={`mailto:${LINKEDIN_TRANSLATOR_SUPPORT_EMAIL}?subject=LinkedIn Translator Team Plan`}
                        className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold text-sm mb-10 transition-all inline-flex items-center justify-center gap-2"
                      >
                        {card.ctaLabel}
                      </a>
                    ) : card.productId ? (
                      user ? (
                        <button
                          type="button"
                          onClick={() => handleCheckout(card.productId!)}
                          disabled={checkouting}
                          className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold text-sm mb-10 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <Zap className="w-4 h-4" />
                          {checkouting
                            ? copy.pricing.checkoutLoading
                            : card.ctaLabel}
                        </button>
                      ) : (
                        <div className="mb-10 space-y-3">
                          <div className="[&_button]:w-full [&_button]:justify-center">
                            <LazyGoogleOAuth
                              className="w-full justify-center"
                              label={copy.navbar.signIn}
                            />
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {copy.pricing.signInFirstHint}
                          </p>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                        className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold text-sm mb-10 transition-all"
                      >
                        {card.ctaLabel}
                      </button>
                    )}

                    <div className="space-y-4 flex-grow">
                      <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
                        {copy.pricing.includesLabel}
                      </div>
                      {card.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-3 text-sm text-on-surface-variant"
                        >
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div
              className="mt-10 rounded-2xl border border-outline-variant bg-white/80 p-6 text-sm leading-7 text-on-surface-variant"
              dangerouslySetInnerHTML={{ __html: copy.pricing.billingNoteHtml }}
            />
          </div>
        </section>

        <section id="faq" className="py-32 px-6 bg-surface-container-low">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                {copy.faq.eyebrow}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                {copy.faq.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: copy.faq.descriptionHtml }}
              />
            </div>

            <div className="space-y-4">
              {copy.faq.items.map((faq, index) => (
                <div
                  key={faq.question}
                  className="bg-white rounded-xl border border-outline-variant overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="font-bold text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === index ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-on-surface-variant leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
                      />
                    ) : null}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-primary text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-extrabold mb-6">{copy.cta.title}</h2>
            <p
              className="text-xl text-white/80 mb-12"
              dangerouslySetInnerHTML={{ __html: copy.cta.descriptionHtml }}
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                className="w-full sm:w-auto bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-lowest transition-all"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {copy.cta.buttonLabel}
              </button>
            </div>
          </div>
      </section>
    </PublicSiteLayout>
  );
}
