import { getMicrosoftClarityBootstrapScript } from "~/lib/analytics/clarity";

interface MicrosoftClarityProps {
  projectId?: string;
}

export function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  if (!import.meta.env.PROD) return null;
  if (!projectId) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: getMicrosoftClarityBootstrapScript(projectId),
      }}
    />
  );
}
