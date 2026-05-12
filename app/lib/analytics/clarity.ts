export const MICROSOFT_CLARITY_PROJECT_ID = "wpx83zcz3r";

export const getMicrosoftClarityBootstrapScript = (projectId: string) => {
  const serializedProjectId = JSON.stringify(projectId);

  return [
    "(function(c,l,a,r,i,t,y){",
    "c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};",
    "t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;",
    "y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);",
    `})(window, document, "clarity", "script", ${serializedProjectId});`,
  ].join("\n");
};
