/**
 * V1 Prototype Disclaimer Text
 *
 * This disclaimer is shown persistently in the UI to inform users about the prototype status and limitations.
 * Loaded from the PROTOTYPE_DISCLAIMER_TEXT environment variable, with a sensible default.
 */
export const V1_PROTOTYPE_DISCLAIMER: string =
  process.env.PROTOTYPE_DISCLAIMER_TEXT ||
  'Disclaimer: Global Pulse is an early prototype. Insights are experimental and may be inaccurate. Not a substitute for professional advice.'; 