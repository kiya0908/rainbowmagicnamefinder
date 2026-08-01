import { useEffect, useRef } from "react";

import { scheduleNonCriticalTask } from "~/lib/performance/schedule-non-critical-task";
import { useThirdPartyServices } from "~/features/document/third-party-services";

const ADSTERRA_CONTAINER_ID = "container-e0a2c2d5cd021d061225f250ddbee435";
const ADSTERRA_SCRIPT_SRC =
  "https://pl29392357.profitablecpmratenetwork.com/e0a2c2d5cd021d061225f250ddbee435/invoke.js";

export const AdsterraNativeAd = () => {
  const { advertisingEnabled } = useThirdPartyServices();
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!import.meta.env.PROD || !advertisingEnabled) return;

    const section = sectionRef.current;
    if (!section) return;

    let observer: IntersectionObserver | undefined;
    let cancelScheduledTask: (() => void) | undefined;
    let injectedScript: HTMLScriptElement | undefined;

    const loadScript = () => {
      const existingScript = document.querySelector(
        `script[data-adsterra-native-ad="${ADSTERRA_CONTAINER_ID}"]`
      );
      if (existingScript) return;

      injectedScript = document.createElement("script");
      injectedScript.async = true;
      injectedScript.dataset.cfasync = "false";
      injectedScript.dataset.adsterraNativeAd = ADSTERRA_CONTAINER_ID;
      injectedScript.src = ADSTERRA_SCRIPT_SRC;

      document.body.appendChild(injectedScript);
    };

    const scheduleLoad = (timeoutMs: number) => {
      cancelScheduledTask?.();
      cancelScheduledTask = scheduleNonCriticalTask(loadScript, { timeoutMs });
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          scheduleLoad(1000);
        },
        { rootMargin: "400px 0px" }
      );
      observer.observe(section);
    } else {
      scheduleLoad(4000);
    }

    return () => {
      observer?.disconnect();
      cancelScheduledTask?.();
      injectedScript?.remove();
    };
  }, [advertisingEnabled]);

  if (!import.meta.env.PROD || !advertisingEnabled) return null;

  return (
    <section
      ref={sectionRef}
      aria-label="Advertisement"
      className="bg-surface px-6 py-8"
    >
      <div className="mx-auto w-full max-w-5xl overflow-hidden">
        <div id={ADSTERRA_CONTAINER_ID} />
      </div>
    </section>
  );
};
