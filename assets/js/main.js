// 列表页：渲染架构卡片，点击进入 arch.html?id=xxx
(function () {
  const grid = document.getElementById("grid");

  function render(f) {
    grid.innerHTML = "";
    ARCH_LIST.forEach((id) => {
      const a = ARCH[id];
      if (!a) return;
      if (f === "ready" && !(a.diagram && a.code)) return;
      if (f !== "all" && f !== "ready" && a.cat !== f) return;

      const ready = a.diagram && a.code;
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML =
        '<div class="top"><h3>' + a.name + "</h3><span class=\"yr\">" + a.year + "</span></div>" +
        '<span class="cat">' + a.cat + "</span>" +
        (ready ? '<span class="ready">已就绪</span>' : "") +
        "<p>" + a.desc + "</p>";
      el.onclick = () => (location.href = "arch.html?id=" + id);
      grid.appendChild(el);
    });
  }

  render("all");

  document.getElementById("filters").onclick = (e) => {
    if (!e.target.classList.contains("chip")) return;
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
    e.target.classList.add("active");
    render(e.target.dataset.f);
  };
})();
