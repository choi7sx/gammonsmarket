// Delegated listeners continue working when CloudCannon re-renders the header.
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const dialog = document.querySelector<HTMLDialogElement>("#market-menu");
  if (!dialog) return;
  if (event.target.closest("[data-menu-open]")) {
    dialog.showModal();
    document
      .querySelector("[data-menu-open]")
      ?.setAttribute("aria-expanded", "true");
  }
  if (
    event.target.closest("[data-menu-close]") ||
    event.target === dialog ||
    event.target.closest("#market-menu a")
  )
    dialog.close();
});
document.addEventListener(
  "close",
  (event) => {
    if (
      event.target instanceof HTMLDialogElement &&
      event.target.id === "market-menu"
    ) {
      document
        .querySelector("[data-menu-open]")
        ?.setAttribute("aria-expanded", "false");
      document.querySelector<HTMLButtonElement>("[data-menu-open]")?.focus();
    }
  },
  true,
);
