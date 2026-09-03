/* models.js — 大模型/小模型 分界面卡片渲染 + tab 筛选 */
(function () {
  const grid = document.getElementById("grid");
  const filters = document.getElementById("filters");
  const groupLabel = (g) => (MODEL_GROUP_LABEL && MODEL_GROUP_LABEL[g]) || g;

  function card(m) {
    const el = document.createElement("div");
    el.className = "card";
    el.onclick = () => (location.href = "model.html?id=" + m.id);
    el.innerHTML = `
      <div class="top"><h3>${m.name}</h3><span class="yr">${m.year || ""}</span></div>
      <span class="cat">${m.family || ""}</span>
      <span class="ready">${groupLabel(m.group)}</span>
      <p>${m.desc || ""}</p>`;
    return el;
  }

  function render(group) {
    grid.innerHTML = "";
    MODELS_LIST.forEach((id) => {
      const m = MODELS[id];
      if (!m) return;
      if (group !== "all" && m.group !== group) return;
      grid.appendChild(card(m));
    });
  }

  filters.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    render(chip.dataset.group);
  });

  render("all");
})();
