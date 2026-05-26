function setupCarousel(shell) {
  const slides = Array.from(shell.querySelectorAll(".carousel-slide"));
  const prev = shell.querySelector(".prev");
  const next = shell.querySelector(".next");
  let index = 0;

  function show(nextIndex) {
    slides[index].classList.remove("is-active");
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add("is-active");
  }

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-carousel]").forEach(setupCarousel);
  const authorToggle = document.querySelector(".author-toggle");
  const authorModal = document.querySelector("#author-modal");
  const authorCloseTargets = document.querySelectorAll("[data-close-authors]");

  function openAuthors() {
    if (!authorModal) {
      return;
    }
    authorModal.hidden = false;
    document.body.style.overflow = "hidden";
    const closeButton = authorModal.querySelector(".author-modal-close");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeAuthors() {
    if (!authorModal || authorModal.hidden) {
      return;
    }
    authorModal.hidden = true;
    document.body.style.overflow = "";
    if (authorToggle) {
      authorToggle.focus();
    }
  }

  if (authorToggle) {
    authorToggle.addEventListener("click", openAuthors);
  }

  authorCloseTargets.forEach((target) => {
    target.addEventListener("click", closeAuthors);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAuthors();
    }
  });

  const leaderboard = document.querySelector("#osLeaderboard");
  const leaderboardDropdown = document.querySelector("#osLeaderboardDropdown");
  const leaderboardDropdownBtn = document.querySelector("#osLeaderboardDropdownBtn");
  const leaderboardItems = document.querySelectorAll("#osLeaderboardDropdownMenu .lb-dropdown-item");
  const leaderboardChecks = document.querySelectorAll(".lb-check input");

  if (leaderboard && leaderboardDropdown && leaderboardDropdownBtn) {
    const rows = Array.from(leaderboard.querySelectorAll("tbody tr"));
    let activeGroup = "all";
    let sortColumn = -1;
    let sortAscending = true;

    rows.forEach((row, index) => {
      row.dataset.originalIndex = String(index);
    });

    function applyLeaderboardFilters() {
      const activeTypes = Array.from(leaderboardChecks)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

      rows.forEach((row) => {
        const group = row.dataset.group;
        const groupMatch = activeGroup === "all" || group === activeGroup;
        const typeMatch = activeTypes.includes(group);
        row.classList.toggle("lb-hidden", !(groupMatch && typeMatch));
      });
    }

    leaderboardDropdownBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      leaderboardDropdown.classList.toggle("open");
    });

    leaderboardItems.forEach((item) => {
      item.addEventListener("click", () => {
        leaderboardItems.forEach((candidate) => candidate.classList.remove("active"));
        item.classList.add("active");
        activeGroup = item.dataset.filter || "all";
        const arrow = leaderboardDropdownBtn.querySelector(".lb-arrow");
        leaderboardDropdownBtn.textContent = `${item.textContent} `;
        if (arrow) {
          leaderboardDropdownBtn.appendChild(arrow);
        }
        leaderboardDropdown.classList.remove("open");
        applyLeaderboardFilters();
      });
    });

    document.addEventListener("click", () => {
      leaderboardDropdown.classList.remove("open");
    });

    leaderboardChecks.forEach((checkbox) => {
      checkbox.addEventListener("change", applyLeaderboardFilters);
    });

    leaderboard.querySelectorAll("th.lb-sortable").forEach((header) => {
      header.addEventListener("click", () => {
        const column = Number(header.dataset.col);
        const kind = header.dataset.kind || "number";
        const tbody = leaderboard.querySelector("tbody");

        leaderboard.querySelectorAll(".lb-col-active").forEach((cell) => {
          cell.classList.remove("lb-col-active");
        });

        if (column === 0 && sortColumn === 0) {
          rows.sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));
          sortColumn = -1;
        } else {
          if (sortColumn === column) {
            sortAscending = !sortAscending;
          } else {
            sortColumn = column;
            sortAscending = kind === "text";
          }

          rows.sort((a, b) => {
            const aText = a.children[column].innerText.trim();
            const bText = b.children[column].innerText.trim();
            if (kind === "text") {
              return sortAscending ? aText.localeCompare(bText) : bText.localeCompare(aText);
            }
            const aValue = Number.parseFloat(aText);
            const bValue = Number.parseFloat(bText);
            return sortAscending ? aValue - bValue : bValue - aValue;
          });

          header.classList.add("lb-col-active");
          rows.forEach((row) => {
            if (row.children[column]) {
              row.children[column].classList.add("lb-col-active");
            }
          });
        }

        leaderboard.querySelectorAll("th.lb-sortable .sort-icon").forEach((icon) => {
          icon.textContent = icon.closest("th").dataset.col === "0" ? "↺" : "⇅";
        });
        const icon = header.querySelector(".sort-icon");
        if (icon && sortColumn === column) {
          icon.textContent = sortAscending ? "↑" : "↓";
        }

        rows.forEach((row) => tbody.appendChild(row));
        applyLeaderboardFilters();
      });
    });

    applyLeaderboardFilters();
  }

  function scrollToHash(hash, smooth = true) {
    const target = document.querySelector(hash);
    if (!target) {
      return;
    }
    const y = target.getBoundingClientRect().top + window.pageYOffset - 76;
    window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
  }

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") {
        return;
      }
      const target = document.querySelector(hash);
      if (!target) {
        return;
      }
      event.preventDefault();
      history.pushState(null, "", hash);
      scrollToHash(hash, true);
    });
  });

  if (window.location.hash) {
    window.setTimeout(() => scrollToHash(window.location.hash, false), 250);
    window.setTimeout(() => scrollToHash(window.location.hash, false), 900);
  }
});
