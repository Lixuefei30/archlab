/* home.js — CV 算法工程师知识树（总入口）
 * 数据驱动：节点 id 若在 model-data.js(MODELS) 或 arch-data.js(ARCH) 中存在则跳转详情，
 * 否则显示「待补充」。新增模型后，这里会自动出现。 */
(function () {
  const tree = document.getElementById("tree");

  // 章节结构：每项为 {n:章节号, title:标题, sub:副标题, items:[{id,label}]}
  // id 留 null 或不存在于数据 = 待补充（规划中）
  const CHAPTERS = [
    { n: "01", title: "深度学习基础", sub: "从 MLP/CNN/Attention 起点",
      items: [{id:null,label:"MLP 基础"},{id:null,label:"CNN 基础"},{id:null,label:"Attention 基础"},{id:"lenet",label:"LeNet-5"}] },
    { n: "02", title: "CNN Backbone", sub: "卷积网络主干演进",
      items: [{id:"lenet",label:"LeNet-5"},{id:"alexnet",label:"AlexNet"},{id:"vgg",label:"VGG"},{id:"resnet",label:"ResNet"},{id:"densenet",label:"DenseNet"},{id:"mobilenet",label:"MobileNet"},{id:"efficientnet",label:"EfficientNet"},{id:"convnext",label:"ConvNeXt"}] },
    { n: "03", title: "Transformer", sub: "注意力与纯 Transformer 视觉",
      items: [{id:null,label:"Self-Attention"},{id:"vit",label:"ViT"},{id:null,label:"DeiT"},{id:"swin",label:"Swin Transformer"},{id:"dinov2",label:"DINOv2"}] },
    { n: "04", title: "检测 Detection", sub: "从两阶段到端到端",
      items: [{id:"fasterrcnn",label:"Faster R-CNN"},{id:"yolo",label:"YOLO"},{id:"detr",label:"DETR"},{id:null,label:"Deformable DETR"},{id:null,label:"DINO"},{id:"rtdetr",label:"RT-DETR"}] },
    { n: "05", title: "分割 Segmentation", sub: "像素级理解",
      items: [{id:null,label:"FCN"},{id:null,label:"Mask R-CNN"},{id:"sam",label:"SAM"}] },
    { n: "06", title: "视觉基础模型", sub: "自监督 / 对比学习 backbone",
      items: [{id:null,label:"CLIP"},{id:null,label:"MAE"},{id:"dinov2",label:"DINOv2"},{id:"sam",label:"SAM"}] },
    { n: "07", title: "多模态 VLM", sub: "视觉语言大模型",
      items: [{id:null,label:"CLIP"},{id:null,label:"BLIP"},{id:null,label:"BLIP-2"},{id:null,label:"LLaVA"},{id:"qwen2vl",label:"Qwen2-VL"},{id:"qwen25vl",label:"Qwen2.5-VL"},{id:"qwen3vl",label:"Qwen3-VL"},{id:null,label:"InternVL"}] },
    { n: "08", title: "部署 Deployment", sub: "ONNX / TensorRT / 量化",
      items: [{id:null,label:"ONNX"},{id:null,label:"TensorRT"},{id:null,label:"Quantization"}] },
  ];

  function resolve(id) {
    if (id && typeof MODELS !== "undefined" && MODELS[id])
      return { href: "model.html?id=" + id, name: MODELS[id].name, ok: true };
    if (id && typeof ARCH !== "undefined" && ARCH[id])
      return { href: "arch.html?id=" + id, name: ARCH[id].name, ok: true };
    return { href: null, name: null, ok: false };
  }

  function node(item) {
    const r = resolve(item.id);
    if (r.ok) {
      return `<a class="knode ok" href="${r.href}">${r.name}<span class="dot"></span></a>`;
    }
    return `<span class="knode todo" title="规划中，尚未收录">${item.label}<span class="plus">＋</span></span>`;
  }

  CHAPTERS.forEach((ch) => {
    const sec = document.createElement("section");
    sec.className = "chapter";
    sec.innerHTML = `
      <div class="ch-head">
        <span class="ch-no">${ch.n}</span>
        <div><div class="ch-title">${ch.title}</div><div class="ch-sub">${ch.sub}</div></div>
      </div>
      <div class="ch-nodes">${ch.items.map(node).join("")}</div>`;
    tree.appendChild(sec);
  });
})();
