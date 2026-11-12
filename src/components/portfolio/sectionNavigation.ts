export const navigationEvent = "portfolio:navigate";
export function navigateToSection(href: string) {
  window.dispatchEvent(new CustomEvent(navigationEvent, { detail: href }));
}
