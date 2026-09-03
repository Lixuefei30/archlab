/* evolution.js — 架构演进时间线渲染 */
(function () {
  function resolve(id) {
    if (id && typeof MODELS !== "undefined" && MODELS[id])
      return { href: "model.html?id=" + id, name: MODELS[id].name, ok: true };
    if (id && typeof ARCH !== "undefined" && ARCH[id])
      return { href: "arch.html?id=" + id, name: ARCH[id].name, ok: true };
    return { href: null, name: null, ok: false };
  }
  function node(item) {
    const r = resolve(item.id);
    const label = item.label || (r.ok ? r.name : "?");
    if (r.ok)
      return `<a class="tl-node ok" href="${r.href}">${label}<span class="y">${item.year || ""}</span></a>`;
    return `<span class="tl-node todo" title="规划中">${label}<span class="y">${item.year || ""}</span></span>`;
  }
  function chain(era, items) {
    const inner = items.map((it, i) =>
      node(it) + (i < items.length - 1 ? '<span class="tl-arrow">→</span>' : "")
    ).join("");
    return `<div class="tl-era"><div class="tl-era-tag">${era}</div><div class="tl-chain">${inner}</div></div>`;
  }

  // Backbone 演进：CNN 时代 + Transformer 时代
  const backbone = [
    { era: "CNN 时代", items: [
      {id:"lenet",label:"LeNet",year:1998},{id:"alexnet",label:"AlexNet",year:2012},
      {id:"vgg",label:"VGG",year:2014},{id:"resnet",label:"ResNet",year:2015},
      {id:"densenet",label:"DenseNet",year:2017},{id:"convnext",label:"ConvNeXt",year:2022},
    ]},
    { era: "Transformer 时代", items: [
      {id:"vit",label:"ViT",year:2020},{id:null,label:"DeiT",year:2021},
      {id:"swin",label:"Swin",year:2021},{id:"dinov2",label:"DINOv2",year:2023},
    ]},
  ];
  document.getElementById("backbone").innerHTML = backbone.map(c => chain(c.era, c.items)).join("");

  // Detection 演进：两阶段 + 单阶段 + Transformer
  const detection = [
    { era: "Two-stage", items: [
      {id:null,label:"R-CNN",year:2014},{id:null,label:"Fast R-CNN",year:2015},
      {id:"fasterrcnn",label:"Faster R-CNN",year:2015},
    ]},
    { era: "One-stage", items: [
      {id:"yolo",label:"YOLO",year:2016},{id:null,label:"SSD",year:2016},
    ]},
    { era: "Transformer Detection", items: [
      {id:"detr",label:"DETR",year:2020},{id:null,label:"Deformable DETR",year:2021},
      {id:null,label:"DINO",year:2022},{id:"rtdetr",label:"RT-DETR",year:2024},
    ]},
  ];
  document.getElementById("detection").innerHTML = detection.map(c => chain(c.era, c.items)).join("");
})();
