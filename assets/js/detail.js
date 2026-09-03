// 详情页：根据 ?id= 渲染 结构图(上) + 代码(下)
(function () {
  const id = new URLSearchParams(location.search).get("id");
  const a = ARCH[id];

  if (!a) {
    document.getElementById("head").innerHTML =
      '<h1>未找到该架构</h1><p class="lead">请检查 arch.html?id= 是否正确。</p>';
    return;
  }

  // 头部
  document.getElementById("head").innerHTML =
    "<h1>" + a.name + ' <span class="tag">' + a.tag + "</span></h1>" +
    '<div class="meta"><div>年份 <b>' + a.year + "</b></div>" +
    "<div>分类 <b>" + a.cat + "</b></div></div>" +
    '<p class="lead">' + a.desc + "</p>";

  // 模型身份证（上，速记卡片）
  renderIdentity(a);
  // Tensor 形状流
  renderShapes(a);

  // 结构图（上）
  const dia = document.getElementById("diagram");
  if (a.diagram) {
    dia.className = "diagram-box";
    dia.innerHTML = a.diagram;
  } else {
    dia.className = "placeholder";
    dia.innerHTML = "📐 结构图待补充 —— 在 arch-data.js 的 <code>" + id +
      ".diagram</code> 中放入内联 &lt;svg&gt; 或 &lt;img&gt; 即可显示。";
  }

  // 代码（下）
  const codeBox = document.getElementById("code");
  if (a.code) {
    codeBox.className = "code-box";
    codeBox.innerHTML =
      '<div class="code-bar"><span class="lang">PyTorch</span>' +
      '<button class="copy" id="copyBtn">复制</button></div>' +
      "<pre><code>" + escapeHtml(a.code) + "</code></pre>";
    const btn = document.getElementById("copyBtn");
    btn.onclick = () => {
      navigator.clipboard.writeText(a.code).then(() => {
        btn.textContent = "已复制 ✓";
        setTimeout(() => (btn.textContent = "复制"), 1500);
      });
    };
  } else {
    codeBox.className = "placeholder";
    codeBox.innerHTML = "💻 代码待补充 —— 在 arch-data.js 的 <code>" + id +
      ".code</code> 中放入纯文本代码即可显示。";
  }

  // 要点解读（结合博客 / 论文）
  if (a.points) {
    const pb = document.getElementById("points");
    pb.className = "block";
    pb.innerHTML = '<h2><span class="bar"></span>要点解读</h2>' +
      '<div class="hint">结合博客 / 论文的补充解读</div>' +
      '<div class="points">' + a.points + "</div>";
  }

  // 补充说明
  if (a.note) {
    document.getElementById("note").innerHTML = '<div class="note">💡 ' + a.note + "</div>";
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 模型身份证渲染
  function renderIdentity(a) {
    const el = document.getElementById("idcard");
    if (!a.identity) {
      el.className = "placeholder";
      el.innerHTML = "🪪 身份证待补充 —— 在 arch-data.js 的 <code>" + id +
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

  // Tensor 形状流渲染
  function renderShapes(a) {
    const el = document.getElementById("shapes");
    if (!a.shapes || !a.shapes.length) {
      el.className = "placeholder";
      el.innerHTML = "📊 Tensor 形状流待补充 —— 在 arch-data.js 的 <code>" + id +
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
})();
