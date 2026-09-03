/* model-detail.js — 模型详情渲染（上结构图 下代码 + 要点解读） */
(function () {
  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(location.search).get("id");
  const a = MODELS && MODELS[id];

  if (!a) {
    $("title").textContent = "未找到该模型";
    $("lead").textContent = "请检查 model-data.js 中是否存在 id=" + id;
    $("diagram").innerHTML = '<div class="placeholder">结构图待补充</div>';
    $("code").textContent = "# 代码待补充";
    $("points-block").style.display = "none";
    return;
  }

  const groupLabel = (MODEL_GROUP_LABEL && MODEL_GROUP_LABEL[a.group]) || a.group;

  // 标题 + 标签
  $("title").innerHTML =
    a.name + `<span class="tag">${groupLabel}</span>` +
    (a.family ? `<span class="tag" style="background:rgba(34,211,238,.16);color:#7dd3fc;border-color:rgba(34,211,238,.4)">${a.family}</span>` : "");

  // 元信息
  $("meta").innerHTML =
    (a.year ? `<span>年份 <b>${a.year}</b></span>` : "") +
    `<span>类别 <b>${groupLabel}</b></span>`;

  // 简介
  $("lead").textContent = a.desc || "";

  // 模型身份证
  renderIdentity(a);
  // Tensor 形状流
  renderShapes(a);

  // 结构图
  $("diagram").innerHTML = a.diagram
    ? a.diagram
    : '<div class="placeholder">结构图待补充（在 model-data.js 给该模型填 diagram 字段）</div>';

  // 代码
  $("code").textContent = a.code || "# 代码待补充";
  $("copy").onclick = () => {
    navigator.clipboard.writeText(a.code || "").then(() => {
      const b = $("copy");
      b.textContent = "已复制";
      setTimeout(() => (b.textContent = "复制"), 1400);
    });
  };

  // 要点解读
  const pb = $("points");
  if (a.points && a.points.length) {
    a.points.forEach((p) => {
      if (typeof p === "string") {
        const d = document.createElement("p");
        d.innerHTML = p;
        pb.appendChild(d);
      } else {
        if (p.h) {
          const h = document.createElement("h3");
          h.textContent = p.h;
          pb.appendChild(h);
        }
        const d = document.createElement("div");
        d.innerHTML = p.body || "";
        pb.appendChild(d);
      }
    });
  } else {
    $("points-block").style.display = "none";
  }

  // 补充说明
  if (a.note) {
    $("note").innerHTML = '<div class="note">💡 ' + a.note + "</div>";
  }

  // ---- 模型身份证 / Tensor 形状流 渲染 ----
  function renderIdentity(a) {
    const el = $("idcard");
    if (!a.identity) {
      el.className = "placeholder";
      el.innerHTML = "🪪 身份证待补充 —— 在 model-data.js 的 <code>" + a.id +
        ".identity</code> 中填字段即可显示。";
      return;
    }
    const f = a.identity;
    const rows = [
      ["任务 / Task", f.task], ["解决问题", f.problem], ["核心思想", f.idea],
      ["输入", f.input], ["输出", f.output], ["参数量", f.params],
      ["FLOPs", f.flops], ["优势", f.pros, "pros"], ["缺点", f.cons, "cons"],
    ];
    el.className = "idcard";
    el.innerHTML = rows.map(r =>
      r[1] ? `<div class="row"><div class="k">${r[0]}</div><div class="v${r[2] ? " " + r[2] : ""}">${r[1]}</div></div>` : ""
    ).join("");
  }

  function renderShapes(a) {
    const el = $("shapes");
    if (!a.shapes || !a.shapes.length) {
      el.className = "placeholder";
      el.innerHTML = "📊 Tensor 形状流待补充 —— 在 model-data.js 的 <code>" + a.id +
        ".shapes</code> 中填 [{label, shape}] 即可显示。";
      return;
    }
    el.className = "shape-flow";
    let html = "";
    a.shapes.forEach((s, i) => {
      html += `<div class="shape-node"><div class="l">${s.label}</div><div class="s">${s.shape}</div></div>`;
      if (i < a.shapes.length - 1) html += '<span class="shape-arrow">→</span>';
    });
    if (a.shapeNote) html += `<div class="shape-note">${a.shapeNote}</div>`;
    el.innerHTML = html;
  }

  document.title = a.name + " · 网络架构实验室";
})();
