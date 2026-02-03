/**
 * Renders the Aktualno cards as accessible, mobile-friendly flip cards.
 * Front: image + title; Back: summary + action.
 */
(function () {
  const placeholder =
    "data:image/svg+xml,%3Csvg%20xmlns%3D'http://www.w3.org/2000/svg'%20width%3D'1'%20height%3D'1'%20viewBox%3D'0%200%201%201'%3E%3Crect%20width%3D'1'%20height%3D'1'%20fill%3D'%23f4f4f4'%20/%3E%3C/svg%3E";
  // Copy and track original index to allow "last-added first" fallback ordering
  const updates = (window.LUPI_UPDATES || []).map((u, i) => ({ ...u, _idx: i }));
  const container = document.getElementById("updatesArticles");
  if (!container || !updates.length) return;

  // Sort: prefer dateSort/date descending; if equal/missing, latest array entry first
  updates.sort((a, b) => {
    const aTime = a.dateSort ? Date.parse(a.dateSort) : (a.date ? Date.parse(a.date) : NaN);
    const bTime = b.dateSort ? Date.parse(b.dateSort) : (b.date ? Date.parse(b.date) : NaN);
    if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
      return bTime - aTime;
    }
    // Fallback: reverse original order (last added first)
    return b._idx - a._idx;
  });

  updates.forEach((update, index) => {
    const badge = update.category
      ? `<span class="update-article-badge">${update.category}</span>`
      : "";
    const actionLabel = update.actionLabel || "Preberi več";
    const rel = update.external ? ' rel="noopener"' : "";
    const target = update.external ? ' target="_blank"' : "";
    const actionLink = update.link
      ? `<p class="update-article-action"><a class="btn-learn-more" href="${update.link}"${target}${rel} data-role="action-link">${actionLabel}</a></p>`
      : "";
    const imageLoading = update.priority ? "eager" : "lazy";

    const article = document.createElement("article");
    article.className = "update-card";
    article.setAttribute("data-aos", "fade-up");
    article.setAttribute("data-aos-delay", String(70 + index * 60));
    // Make the whole card togglable via keyboard
    article.setAttribute("tabindex", "0");
    article.setAttribute("role", "button");
    article.setAttribute("aria-expanded", "false");
    article.innerHTML = `
      <div class="update-card-inner">
        <div class="update-card-face update-card-front">
          <figure class="update-article-media">
            <img
              src="${placeholder}"
              data-src="${update.image}"
              alt="${update.imageAlt || update.title}"
              loading="${imageLoading}"
              decoding="async"
              width="640"
              height="360">
            ${badge}
          </figure>
          <div class="update-card-front-overlay">
            <p class="update-article-meta">
              <span class="update-article-date">${update.date}</span>
              <span aria-hidden="true">&middot;</span>
              <span class="update-article-location">${update.location}</span>
            </p>
            <h3 class="update-card-title">${update.title}</h3>
            <button class="update-card-toggle" type="button" aria-label="Odpri podrobnosti">
              <span>Podrobnosti</span>
            </button>
          </div>
        </div>
        <div class="update-card-face update-card-back">
          <header class="update-card-back-header">
            <h3>${update.title}</h3>
          </header>
          <div class="update-card-back-body">
            <p>${update.summary}</p>
            ${actionLink}
          </div>
          <button class="update-card-toggle back" type="button" aria-label="Zapri podrobnosti">
            <span>Nazaj</span>
          </button>
        </div>
      </div>
    `;

    container.appendChild(article);
  });

  // Interactivity: flip on click/tap and Enter/Space. Keep links working.
  function setFlipped(card, flipped) {
    const inner = card.querySelector(".update-card-inner");
    if (!inner) return;
    inner.classList.toggle("is-flipped", flipped);
    card.setAttribute("aria-expanded", flipped ? "true" : "false");
  }

  container.addEventListener("click", (e) => {
    const actionLink = (e.target instanceof Element) && e.target.closest("[data-role='action-link']");
    if (actionLink) return; // Don't toggle when clicking external link

    const toggleBtn = (e.target instanceof Element) && e.target.closest(".update-card-toggle");
    if (toggleBtn) {
      const card = toggleBtn.closest(".update-card");
      const inner = card && card.querySelector(".update-card-inner");
      if (!card || !inner) return;
      const flipped = !inner.classList.contains("is-flipped");
      setFlipped(card, flipped);
      return;
    }

    const card = (e.target instanceof Element) && e.target.closest(".update-card");
    if (!card) return;
    // Toggle only when clicking empty space on the card faces
    const inner = card.querySelector(".update-card-inner");
    if (!inner) return;
    const flipped = !inner.classList.contains("is-flipped");
    setFlipped(card, flipped);
  });

  container.addEventListener("keydown", (e) => {
    const card = (e.target instanceof Element) && e.target.closest(".update-card");
    if (!card) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const inner = card.querySelector(".update-card-inner");
      const flipped = !inner.classList.contains("is-flipped");
      setFlipped(card, flipped);
    } else if (e.key === "Escape") {
      setFlipped(card, false);
    }
  });
})();

