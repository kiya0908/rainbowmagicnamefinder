import { useEffect } from "react";

import {
  MICROSOFT_CLARITY_BOOTSTRAP_SCRIPT_ID,
  getMicrosoftClarityBootstrapScript,
} from "~/lib/analytics/clarity";
import { scheduleNonCriticalTask } from "~/lib/performance/schedule-non-critical-task";

interface MicrosoftClarityProps {
  projectId?: string;
}

export function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  useEffect(() => {
    if (!import.meta.env.PROD || !projectId) return;

    let cancelScheduledTask: (() => void) | undefined;

    const loadClarity = () => {
      if (document.getElementById(MICROSOFT_CLARITY_BOOTSTRAP_SCRIPT_ID)) {
        return;
      }

      const bootstrapScript = document.createElement("script");
      bootstrapScript.id = MICROSOFT_CLARITY_BOOTSTRAP_SCRIPT_ID;
      bootstrapScript.textContent = getMicrosoftClarityBootstrapScript(projectId);
      document.head.appendChild(bootstrapScript);
    };

    const scheduleLoad = () => {
      cancelScheduledTask = scheduleNonCriticalTask(loadClarity, {
        timeoutMs: 3000,
      });
    };

    if (document.readyState === "complete") {
      scheduleLoad();
    } else {
      window.addEventListener("load", scheduleLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleLoad);
      cancelScheduledTask?.();
    };
  }, [projectId]);

  return null;
}
