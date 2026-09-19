/**
 * Helpers for the few places that must emit raw HTML.
 *
 * Astro escapes everything inside curly braces, but `set:html` deliberately
 * bypasses that, so anything handed to it has to arrive already safe.
 */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character]);
}

/**
 * Renders `backticked` spans as <code>, escaping everything else first so a
 * bullet can contain "<" or ">" without it reaching the parser as markup.
 */
export function inlineCode(text: string) {
  return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

/**
 * JSON destined for a <script> tag. JSON.stringify leaves "</script>" intact,
 * which would close the tag early and let the rest of the string be parsed as
 * markup; escaping "<" as < keeps the value inert and still valid JSON.
 */
export function jsonForScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
