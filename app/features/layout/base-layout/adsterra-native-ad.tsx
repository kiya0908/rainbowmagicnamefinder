import { useEffect } from "react";

const ADSTERRA_CONTAINER_ID = "container-e0a2c2d5cd021d061225f250ddbee435";
const ADSTERRA_SCRIPT_SRC =
  "https://pl29392357.profitablecpmratenetwork.com/e0a2c2d5cd021d061225f250ddbee435/invoke.js";

export const AdsterraNativeAd = () => {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.dataset.adsterraNativeAd = ADSTERRA_CONTAINER_ID;
    script.src = ADSTERRA_SCRIPT_SRC;

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  if (!import.meta.env.PROD) return null;

  return (
    <section
      aria-label="Advertisement"
      className="bg-surface px-6 py-8"
    >
      <div className="mx-auto w-full max-w-5xl overflow-hidden">
        <div id={ADSTERRA_CONTAINER_ID} />
      </div>
    </section>
  );
};
