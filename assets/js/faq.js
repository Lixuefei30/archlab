/* ============================================================
 * faq.js — 高频问题 渲染 + 分类筛选
 * 依赖 faq-data.js 的 FAQ 数组
 * ============================================================ */
(function () {
  const root = document.getElementById("faq");
  const filters = document.getElementById("filters");
  if (!root || !FAQ) return;

  const cats = FAQ.map((g) => g.cat);

  // 分类筛选 chips：全部 + 各分类
  filters.innerHTML =
    '<span class="chip active" data-cat="all">全部</span>' +
    cats.map((c) => `<span class="chip" data-cat="${c}">${c}</span>`).join("");

  function render(cat) {
    const groups = cat === "all" ? FAQ : FAQ.filter((g) => g.cat === cat);
    root.innerHTML = groups
      .map(
        (g) => `
      <div class="faq-group">
        <div class="sec-head"><div class="k">${g.cat}</div><h2>${g.cat}</h2></div>
        <div class="faq-list">
          ${g.items
            .map(
              (it) => `
            <details class="faq-item">
              <summary><span class="q">${it.q}</span><span class="chev">▾</span></summary>
              <div class="faq-a">${it.a}</div>
            </details>`
            )
            .join("")}
        </div>
      </div>`
      )
      .join("");
  }

  render("all");

  filters.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    render(chip.dataset.cat);
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
