/* ============================================================
 * model-data.js — 大模型 / 小模型 架构数据
 * 分组：large = 多模态大模型(VLM)  small = 视觉基础小模型
 * 补充结构图/代码只需改这里；新增模型在 MODELS 加一项 + 在 MODELS_LIST 追加 key
 * ============================================================ */
const MODELS = {

  /* ====================== 大模型 (VLM) ====================== */
  qwen2vl: {
    id: "qwen2vl",
    name: "Qwen2-VL",
    group: "large",
    year: 2024,
    family: "Vision-Language Model",
    desc: "阿里通义千问视觉语言大模型。原生支持图像/视频/文本统一输入，用带 2D-RoPE 的 ViT 提取视觉特征，经一个极简 MLP（VL Merger）把相邻 4 个 patch 合并成 1 个 token 后送入 Qwen 语言模型，全程用 M-RoPE 统一位置编码。",
    diagram: `<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,sans-serif">
      <defs><marker id="a_q2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7dd3fc"/></marker></defs>
      <g fill="none" stroke="#7dd3fc" stroke-width="1.6" marker-end="url(#a_q2)">
        <line x1="130" y1="68" x2="172" y2="68"/><line x1="308" y1="68" x2="352" y2="68"/>
        <line x1="488" y1="68" x2="528" y2="68"/><line x1="130" y1="208" x2="172" y2="208"/>
        <line x1="392" y1="96" x2="448" y2="190"/><line x1="308" y1="208" x2="352" y2="208"/><line x1="538" y1="208" x2="560" y2="208"/>
      </g>
      <g>
        <rect x="20" y="40" width="110" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="75" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">图像 / 视频</text><text x="75" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">任意分辨率</text>
        <rect x="180" y="40" width="128" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="244" y="62" fill="#e8eef7" font-size="13" text-anchor="middle">ViT 编码器</text><text x="244" y="80" fill="#9fb0c3" font-size="11" text-anchor="middle">2D-RoPE</text>
        <rect x="360" y="40" width="128" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="424" y="62" fill="#e8eef7" font-size="13" text-anchor="middle">VL Merger</text><text x="424" y="80" fill="#9fb0c3" font-size="11" text-anchor="middle">2×2→1 (MLP)</text>
        <rect x="540" y="40" width="118" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="599" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">视觉 Token</text><text x="599" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">压缩 1/4</text>
        <rect x="20" y="180" width="110" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="75" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">文本</text>
        <rect x="180" y="180" width="128" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="244" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">Text Embed</text>
        <rect x="360" y="180" width="178" height="56" rx="10" fill="rgba(251,113,133,.08)" stroke="#fb7185"/>
        <text x="449" y="202" fill="#e8eef7" font-size="13" text-anchor="middle">Qwen LLM</text><text x="449" y="220" fill="#9fb0c3" font-size="11" text-anchor="middle">自回归解码</text>
        <rect x="560" y="180" width="100" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="610" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">文本输出</text>
      </g>
      <text x="20" y="276" fill="#f59e0b" font-size="12">M-RoPE：图像=(h,w)，视频加 time 维；文本位置在对角线上</text>
    </svg>`,
    code: `from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info

model = Qwen2VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2-VL-7B-Instruct", device_map="auto", torch_dtype="auto")
processor = AutoProcessor.from_pretrained("Qwen/Qwen2-VL-7B-Instruct")

messages = [{
    "role": "user",
    "content": [
        {"type": "image", "image": "demo.jpg"},
        {"type": "text",  "text": "图里有什么？"},
    ],
}]
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
img_inputs, vid_inputs = process_vision_info(messages)   # 动态分辨率自动处理
inputs = processor(text=[text], images=img_inputs, videos=vid_inputs,
                   padding=True, return_tensors="pt").to("cuda")

out = model.generate(**inputs, max_new_tokens=128)
print(processor.decode(out[0], skip_special_tokens=True))`,
    note: "关键创新：原生动态分辨率（任意尺寸图→动态数量视觉 token）+ 2D-RoPE + M-RoPE + 极简 MLP 融合。视觉 token 数经 merger 变为原 1/4。",
    identity: {
      task: "视觉语言理解 / 多模态对话（图像·视频·文本 → 文本）",
      problem: "如何让单模型统一理解图像/视频/文本，并支持任意分辨率而不失真",
      idea: "ViT 提视觉特征 + 极简 MLP(VL Merger, 2×2→1) 压缩为视觉 token + M-RoPE 统一位置编码，送入 Qwen LLM 自回归生成",
      input: "图像 / 视频 / 文本（原生动态分辨率）",
      output: "文本（自回归解码）",
      params: "2B / 7B / 72B（7B 约 8B）",
      flops: "随输入 token 数动态变化（无固定 FLOPs）",
      pros: "原生动态分辨率；视觉 token 仅原始 1/4；统一 M-RoPE；支持长视频",
      cons: "超长视频 token 爆炸；依赖 merger 对齐；长上下文受 LLM 长度限制"
    },
    shapes: [
      {label:"输入图像",shape:"3 × 448 × 448"},
      {label:"Patch(14)",shape:"32×32 = 1024 token"},
      {label:"ViT (2D-RoPE)",shape:"B × 1024 × 1280"},
      {label:"VL Merger 2×2→1",shape:"B × 256 × 3584"},
      {label:"+ 文本 token",shape:"B × (256+Tₜ) × 3584"},
      {label:"LLM 输出",shape:"文本 logits B×Tₒ×Vocab"}
    ],
    shapeNote: "视觉 token 数 = ViT patch 数 / 4（spatial_merge_size=2 → 2×2=4 合并）；ViT hidden=1280，经 merger MLP 投影到 LLM 维度 3584。",
    points: [
      { h: "整体结构", body: "<p>三块：<b>视觉编码器(ViT)</b> → <b>融合模块(Connector, 仅一个 MLP)</b> → <b>语言模型(LLM)</b>。Qwen2-VL 没有复杂跨模态结构，ViT 末端用 PatchMerger 把视觉特征投影到 LLM 维度。</p>" },
      { h: "动态分辨率 (Naive Dynamic Resolution)", body: "<p>图片打成 patch(=14)，并把相邻 4 个 patch(2×2) 预先重排；输入尺寸需是 28 的倍数(spatial_merge_size=2)。视频则动态采样 FPS。</p><p>最终送入 LLM 的视觉 token 数 = ViT 输出 / spatial_merge_unit(=4)，即<b>变为原来的 1/4</b>。</p>" },
      { h: "M-RoPE 多模态旋转位置编码", body: "<p>在 LM 的位置编码上比 ViT 多一个<b>时间方向</b>，形成三维 (height, width, time) 位置编码；文本位置编码出现在矩阵对角线上。图像/视频/文本共用一套 RoPE，天然统一。</p>" },
      { h: "与 Qwen2.5-VL 的关系", body: "<p>Qwen2-VL 是奠基版本；Qwen2.5-VL 在其上把 ViT 的 LayerNorm 换成 RMSNorm、MLP 换成 SwiGLU，并引入<b>窗口注意力</b>与<b>绝对时间编码</b>，详见 Qwen2.5-VL 条目。</p>" }
    ]
  },

  qwen25vl: {
    id: "qwen25vl",
    name: "Qwen2.5-VL",
    group: "large",
    year: 2025,
    family: "Vision-Language Model",
    desc: "Qwen2-VL 的升级版。ViT 用 RMSNorm + SwiGLU，并引入窗口注意力(仅 4 层全注意力)以降低长视频计算；M-RoPE 加入绝对时间编码对齐时间流速；仍用 2×2 PatchMerger(MLP) 衔接 LLM。预训练扩到 4.1T token，视频最长可理解约 1 小时（评测限 768 帧）。参考：知乎《Qwen2.5-VL 解剖》。",
    diagram: `<svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,sans-serif">
      <defs><marker id="a_q25" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7dd3fc"/></marker></defs>
      <g fill="none" stroke="#7dd3fc" stroke-width="1.6" marker-end="url(#a_q25)">
        <line x1="130" y1="68" x2="172" y2="68"/><line x1="320" y1="68" x2="364" y2="68"/>
        <line x1="500" y1="68" x2="540" y2="68"/><line x1="130" y1="218" x2="172" y2="218"/>
        <line x1="404" y1="96" x2="462" y2="200"/><line x1="320" y1="218" x2="364" y2="218"/><line x1="560" y1="218" x2="582" y2="218"/>
      </g>
      <g>
        <rect x="20" y="40" width="110" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="75" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">图像 / 视频</text><text x="75" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">动态分辨率</text>
        <rect x="180" y="40" width="140" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="250" y="60" fill="#e8eef7" font-size="13" text-anchor="middle">ViT 编码器</text><text x="250" y="78" fill="#9fb0c3" font-size="11" text-anchor="middle">RMSNorm+SwiGLU</text>
        <rect x="364" y="40" width="136" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="432" y="62" fill="#e8eef7" font-size="13" text-anchor="middle">VL Merger</text><text x="432" y="80" fill="#9fb0c3" font-size="11" text-anchor="middle">2×2→1 (MLP)</text>
        <rect x="540" y="40" width="118" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="599" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">视觉 Token</text><text x="599" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">压缩 1/4</text>
        <rect x="20" y="190" width="110" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="75" y="220" fill="#e8eef7" font-size="13" text-anchor="middle">文本</text>
        <rect x="180" y="190" width="140" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="250" y="220" fill="#e8eef7" font-size="13" text-anchor="middle">Text Embed</text>
        <rect x="364" y="190" width="196" height="56" rx="10" fill="rgba(251,113,133,.08)" stroke="#fb7185"/>
        <text x="462" y="212" fill="#e8eef7" font-size="13" text-anchor="middle">Qwen2.5 LLM</text><text x="462" y="230" fill="#9fb0c3" font-size="11" text-anchor="middle">28 层 / d=3584</text>
        <rect x="582" y="190" width="86" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="625" y="220" fill="#e8eef7" font-size="13" text-anchor="middle">输出</text>
      </g>
      <text x="180" y="120" fill="#f59e0b" font-size="11">⚡ 窗口注意力</text><text x="180" y="134" fill="#9fb0c3" font-size="10">仅 4 层全注意力</text>
      <text x="364" y="120" fill="#f59e0b" font-size="11">⏱ 绝对时间编码</text>
      <text x="20" y="290" fill="#f59e0b" font-size="12">M-RoPE 绝对时间：t_id = range(t) × second_per_grid_t × tokens_per_second</text>
    </svg>`,
    code: `from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info

model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2.5-VL-7B-Instruct", device_map="auto", torch_dtype="auto")
processor = AutoProcessor.from_pretrained("Qwen/Qwen2.5-VL-7B-Instruct")

# 视频：动态 FPS + 绝对时间编码由 processor 自动处理
messages = [{
    "role": "user",
    "content": [
        {"type": "video", "video": "clip.mp4", "max_pixels": 360*420, "fps": 1.0},
        {"type": "text",  "text": "这段视频在做什么？"},
    ],
}]
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
img_inputs, vid_inputs = process_vision_info(messages)
inputs = processor(text=[text], images=img_inputs, videos=vid_inputs,
                   padding=True, return_tensors="pt").to("cuda")
out = model.generate(**inputs, max_new_tokens=256)
print(processor.decode(out[0], skip_special_tokens=True))`,
    note: "相比 Qwen2-VL：ViT 用 RMSNorm 替换 LayerNorm、MLP 换成 SwiGLU；引入窗口注意力(仅 4 层全注意力)与绝对时间编码 M-RoPE；预训练 4.1T token；窗口注意力使 ViT 复杂度由 O((HW)²) 降到 O(HW)，可处理更长视频。",
    identity: {
      task: "视觉语言理解 / 多模态对话 + 长视频·文档·定位（图像·视频·文本 → 文本）",
      problem: "Qwen2-VL 超长视频算力爆炸；M-RoPE 时间编码忽略采样率",
      idea: "ViT 换 RMSNorm+SwiGLU + 窗口注意力(仅4层全注意力)降复杂度；M-RoPE 加绝对时间编码对齐采样率；动态分辨率 + 2×2 merger 不变",
      input: "图像 / 视频 / 文本（动态分辨率；视频 ≤768 帧）",
      output: "文本（自回归解码）",
      params: "3B / 7B / 72B",
      flops: "随输入 token 数动态变化（窗口注意力使长视频 O(HW)）",
      pros: "窗口注意力省 5.82× 算力；绝对时间编码；4.1T 预训练；视觉 token 1/4",
      cons: "视频仍受 768 帧 / 24576 token 上限；ViT 结构更复杂"
    },
    shapes: [
      {label:"输入图像",shape:"3 × 1024 × 1024"},
      {label:"Patch(14)",shape:"≈73×73 ≈ 5329 token"},
      {label:"ViT (WindowAttn)",shape:"B × 5329 × 1280"},
      {label:"VL Merger 2×2→1",shape:"B × 1332 × 3584"},
      {label:"+ 文本 token",shape:"B × (1332+T) × 3584"},
      {label:"LLM (28层 d=3584)",shape:"文本 logits"}
    ],
    shapeNote: "ViT 仅 4 层全注意力，其余用 window_size=112 窗口注意力；1024² 上 Window 比 Global 省 5.82× 算力。视频 token ≤ 24576（768 帧）。",
    points: [
      { h: "整体结构（与 Qwen2-VL 一致）", body: "<p>三块：<b>视觉编码器(ViT)</b> + <b>融合模块(Connector，仅一个 MLP)</b> + <b>语言模型(LLM)</b>。ViT 含 patch_embed(Conv3d)、32 个 VisionBlock、merger；LLM 为 28 层 Decoder，隐藏维度 3584，词表 152064。</p>" },
      { h: "动态分辨率与视觉 token 计算", body: "<p>patch=14，相邻 4 个 patch(2×2) 先重排；输入尺寸须为 28 的倍数。PatchMerger 使<b>送入 LLM 的图片 token 数变为原来的 1/4</b>。视频侧 grid_thw=(t,h,w)，LLM 网格 h,w 各 //2，token 数 = t × (h/2) × (w/2)。评测限制：最多 <b>768 帧</b>，视频 token ≤ <b>24,576</b>。</p>" },
      { h: "M-RoPE + 绝对时间编码（关键改进）", body: "<p>Qwen2-VL 时间维每帧间隔固定为 1，忽略采样率。Qwen2.5-VL 引入<b>绝对时间编码</b>：t_index = range(t) × second_per_grid_t × tokens_per_second，使模型通过时间 id 间隔学习节奏，与动态 FPS 对齐。</p>" },
      { h: "窗口注意力（Window Attention，关键改进）", body: "<p>ViT 仅 <b>4 层为全注意力</b>，其余层用窗口注意力(window_size=112，8×8 patch 窗口)，复杂度由全局 O((HW)²) 降到 O(HW)。1024² 上 Window 比 Global 省 <b>5.82×</b> 算力，使 ViT 能处理更多帧（声称可理解超 1 小时视频）。</p>" },
      { h: "VL Merger / 视觉语言融合器", body: "<p>Qwen2_5_VLPatchMerger = ln_q(RMSNorm) + MLP(Linear 5120→5120 → GELU → Linear 5120→3584)。spatial_merge_size=2，把空间相邻 4 个 patch(context_dim×4=5120) 融合为 1 个，既降 ViT 计算也减 LLM token。窗口重排后经 reverse_indices 恢复顺序再送 LLM。</p>" },
      { h: "关键数字", body: "<table><tr><th>项目</th><th>数值</th></tr><tr><td>预训练 token</td><td>Qwen2-VL 1.2T → <b>4.1T</b></td></tr><tr><td>ViT</td><td>32 层, hidden=1280, 从头训练</td></tr><tr><td>SFT 数据</td><td>约 200 万条(50% 文本/50% 多模态)</td></tr><tr><td>全注意力层</td><td>ViT 中仅 4 层</td></tr><tr><td>视频评估</td><td>≤768 帧, token≤24576</td></tr><tr><td>模型尺寸</td><td>72B / 7B / 3B</td></tr></table><small>综合自知乎《Qwen2.5-VL 解剖》及技术报告。</small>" }
    ]
  },

  qwen3vl: {
    id: "qwen3vl",
    name: "Qwen3-VL",
    group: "large",
    year: 2025,
    family: "Vision-Language Model",
    desc: "Qwen 视觉语言系列最新代。延续 Qwen2.5-VL 的 M-RoPE + 动态分辨率 + 窗口注意力主线，进一步加深视觉编码器、拉长上下文（约 256K）、强化长视频理解与 Agent/工具调用能力、提升 OCR 与图文定位精度。公开结构细节相对有限，下列为基于系列演进的架构示意。",
    diagram: `<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,sans-serif">
      <defs><marker id="a_q3" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7dd3fc"/></marker></defs>
      <g fill="none" stroke="#7dd3fc" stroke-width="1.6" marker-end="url(#a_q3)">
        <line x1="130" y1="68" x2="172" y2="68"/><line x1="320" y1="68" x2="364" y2="68"/>
        <line x1="500" y1="68" x2="540" y2="68"/><line x1="130" y1="208" x2="172" y2="208"/>
        <line x1="404" y1="96" x2="462" y2="202"/><line x1="320" y1="208" x2="364" y2="208"/><line x1="560" y1="208" x2="582" y2="208"/>
      </g>
      <g>
        <rect x="20" y="40" width="110" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="75" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">图像 / 视频</text><text x="75" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">动态分辨率</text>
        <rect x="180" y="40" width="140" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="250" y="60" fill="#e8eef7" font-size="13" text-anchor="middle">ViT 编码器</text><text x="250" y="78" fill="#9fb0c3" font-size="11" text-anchor="middle">更深 + Window</text>
        <rect x="364" y="40" width="136" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="432" y="62" fill="#e8eef7" font-size="13" text-anchor="middle">VL Merger</text><text x="432" y="80" fill="#9fb0c3" font-size="11" text-anchor="middle">2×2→1 (MLP)</text>
        <rect x="540" y="40" width="118" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="599" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">视觉 Token</text><text x="599" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">压缩 1/4</text>
        <rect x="20" y="180" width="110" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="75" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">文本</text>
        <rect x="180" y="180" width="140" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="250" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">Text Embed</text>
        <rect x="364" y="180" width="196" height="56" rx="10" fill="rgba(251,113,133,.08)" stroke="#fb7185"/>
        <text x="462" y="202" fill="#e8eef7" font-size="13" text-anchor="middle">Qwen3 LLM</text><text x="462" y="220" fill="#9fb0c3" font-size="11" text-anchor="middle">长上下文 ~256K</text>
        <rect x="582" y="180" width="86" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="625" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">输出</text>
      </g>
      <text x="180" y="120" fill="#f59e0b" font-size="11">⚡ 窗口注意力</text>
      <text x="20" y="276" fill="#f59e0b" font-size="12">M-RoPE(绝对时间) + 更深 ViT + 更强 Agent/视频/OCR（公开细节有限，示意）</text>
    </svg>`,
    code: `# transformers 中类名为 Qwen3VLForConditionalGeneration（与 2.5 调用方式一致）
from transformers import Qwen3VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info

model = Qwen3VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen3-VL-xxx-Instruct", device_map="auto", torch_dtype="auto")
processor = AutoProcessor.from_pretrained("Qwen/Qwen3-VL-xxx-Instruct")

messages = [{
    "role": "user",
    "content": [
        {"type": "image", "image": "doc.jpg"},
        {"type": "text",  "text": "提取图中表格并转成 Markdown"},
    ],
}]
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
img_inputs, vid_inputs = process_vision_info(messages)
inputs = processor(text=[text], images=img_inputs, videos=vid_inputs,
                   padding=True, return_tensors="pt").to(model.device)
out = model.generate(**inputs, max_new_tokens=512)
print(processor.decode(out[0], skip_special_tokens=True))`,
    note: "架构主线与 Qwen2.5-VL 同源（M-RoPE + 动态分辨率 + 窗口注意力 + 2×2 PatchMerger）。公开细节相对有限，调用 API 与 2.5 一致，仅模型类/权重名不同。",
    identity: {
      task: "多模态对话 + Agent/工具调用 + 长视频·OCR·图文定位（图像·视频·文本 → 文本）",
      problem: "上下文长度受限，长视频/文档长程理解不足",
      idea: "延续 2.5 主线（M-RoPE+动态分辨率+窗口注意力+merger），加深 ViT、拉长上下文到约 256K，强化 Agent/OCR/grounding",
      input: "图像 / 视频 / 文本（动态分辨率）",
      output: "文本（自回归解码）",
      params: "系列（公开细节有限）",
      flops: "随输入 token 数动态变化（约 256K 上下文）",
      pros: "更长上下文 ~256K；更强 Agent/OCR/图文定位；2.5 主线成熟",
      cons: "公开结构细节有限；以官方技术报告为准"
    },
    shapes: [
      {label:"输入图像",shape:"3 × H × W"},
      {label:"Patch(14)",shape:"(H/14)×(W/14)"},
      {label:"ViT (更深+Window)",shape:"B × N × 1280"},
      {label:"VL Merger 2×2→1",shape:"B × (N/4) × 3584"},
      {label:"LLM (~256K ctx)",shape:"文本 logits"}
    ],
    shapeNote: "形状与 Qwen2.5-VL 同构（patch=14，merger 2×2→1，token 数 1/4）；差异在 ViT 深度与上下文长度（~256K）。",
    points: [
      { h: "与系列的关系", body: "<p>Qwen3-VL 是 Qwen2.5-VL 的演进代，沿用<b>动态分辨率 + M-RoPE + 窗口注意力 + 极简 MLP 融合</b>的主线，进一步加深视觉编码器、拉长上下文到约 <b>256K</b>。</p>" },
      { h: "能力侧重", body: "<p>强化长视频理解、Agent/工具调用、OCR 与图文定位(grounding)精度；部分版本强化文档解析与多语支持。</p>" },
      { h: "使用注意", body: "<p>公开结构细节有限，下列为基于演进的架构示意。生产请以官方技术报告/配置为准；transformers 调用方式与 2.5 基本一致，仅类名/权重不同。</p>" }
    ]
  },

  /* ====================== 小模型 (视觉基础模型) ====================== */
  dinov2: {
    id: "dinov2",
    name: "DINOv2",
    group: "small",
    year: 2023,
    family: "Self-Supervised Vision Encoder",
    desc: "Meta 的自监督视觉基础模型。标准 ViT  backbone，用 DINO(全局 CLS 对比) + iBOT(局部 mask 像素重建) 双目标训练，Teacher 为 Student 的 EMA。输出高质量的 CLS 与 patch 特征，可直接作为冻结 backbone 用于分类、检测、分割等密集任务。",
    diagram: `<svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,sans-serif">
      <defs>
        <marker id="a_d1" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7dd3fc"/></marker>
        <marker id="a_d2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#f59e0b"/></marker>
      </defs>
      <g fill="none" stroke="#7dd3fc" stroke-width="1.6" marker-end="url(#a_d1)">
        <line x1="130" y1="88" x2="172" y2="88"/>
        <line x1="310" y1="60" x2="344" y2="44"/><line x1="310" y1="116" x2="344" y2="132"/>
        <line x1="130" y1="228" x2="172" y2="228"/>
      </g>
      <g fill="none" stroke="#f59e0b" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#a_d2)">
        <line x1="240" y1="256" x2="300" y2="150"/><line x1="300" y1="44" x2="240" y2="200"/>
        <line x1="300" y1="132" x2="240" y2="210"/>
      </g>
      <g>
        <rect x="20" y="60" width="110" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="75" y="90" fill="#e8eef7" font-size="13" text-anchor="middle">图像</text>
        <rect x="180" y="60" width="130" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="245" y="90" fill="#e8eef7" font-size="13" text-anchor="middle">ViT (Student)</text>
        <rect x="360" y="20" width="150" height="50" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="435" y="42" fill="#e8eef7" font-size="13" text-anchor="middle">DINO 全局头</text><text x="435" y="60" fill="#9fb0c3" font-size="10" text-anchor="middle">CLS 对比</text>
        <rect x="360" y="110" width="150" height="50" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="435" y="132" fill="#e8eef7" font-size="13" text-anchor="middle">iBOT 局部头</text><text x="435" y="150" fill="#9fb0c3" font-size="10" text-anchor="middle">Mask 像素重建</text>
        <rect x="180" y="200" width="130" height="56" rx="10" fill="rgba(245,158,11,.08)" stroke="#f59e0b"/>
        <text x="245" y="222" fill="#e8eef7" font-size="13" text-anchor="middle">Teacher</text><text x="245" y="240" fill="#9fb0c3" font-size="10" text-anchor="middle">EMA 提供目标</text>
        <rect x="540" y="120" width="120" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="600" y="144" fill="#e8eef7" font-size="13" text-anchor="middle">特征</text><text x="600" y="162" fill="#9fb0c3" font-size="10" text-anchor="middle">CLS + patch</text>
      </g>
      <text x="20" y="300" fill="#9fb0c3" font-size="12">自监督：DINO(全局)+iBOT(局部) 双目标；Teacher = Student 的 EMA（橙虚线）</text>
    </svg>`,
    code: `import torch
from transformers import AutoImageProcessor, AutoModel

# 常用规模：dinov2-giant / large / base / small
processor = AutoImageProcessor.from_pretrained("facebook/dinov2-giant")
model = AutoModel.from_pretrained("facebook/dinov2-giant")   # 冻结作 backbone

inputs = processor(images=image, return_tensors="pt")
with torch.no_grad():
    out = model(**inputs)

last_hidden = out.last_hidden_state          # (B, 1+N, D)
cls_token  = last_hidden[:, 0]               # CLS 特征
patch_tokens = last_hidden[:, 1:]            # 空间 patch 特征，可 reshape 回 (H/P, W/P)
# 密集任务用 patch_tokens；分类/检索用 cls_token`,
    note: "无标签自监督。DINO 让 Student 与 EMA Teacher 的全局 CLS 输出一致；iBOT 在随机 mask 的 patch 上做教师蒸馏的像素重建，从而学得局部一致特征。训练数据 LVD-142M（精选）。",
    identity: {
      task: "通用视觉特征提取（自监督 backbone：分类/检测/分割通用）",
      problem: "标注昂贵，如何无标签学通用、可迁移的视觉特征",
      idea: "DINO(全局 CLS 对比)+iBOT(局部 mask 像素重建) 双目标自监督；Teacher = Student 的 EMA 提供稳定目标",
      input: "图像 3 × H × W（常用 224² 或 518²）",
      output: "CLS + patch 特征（B × (1+N) × D）",
      params: "ViT-g/14 ≈ 1.1B；base ≈ 86M",
      flops: "ViT-g/14 @518²：约 1.8T（高）",
      pros: "冻结即用作 backbone；强泛化；CLS+patch 双特征；无标签",
      cons: "自监督预训练需大算力；推理仍 ViT 开销；无监督目标需精调数据"
    },
    shapes: [
      {label:"输入图像",shape:"3 × 518 × 518"},
      {label:"Patch(14)",shape:"≈37×37 ≈ 1369 +CLS"},
      {label:"ViT-g/14",shape:"B × 1370 × 1536"},
      {label:"CLS token",shape:"B × 1536"},
      {label:"patch tokens",shape:"B × 1369 × 1536"}
    ],
    shapeNote: "giant 模型 D=1536；CLS 用于图像级任务，patch 可 reshape 回 (37×37) 用于密集任务；输出即 last_hidden_state 的 [:,0] 与 [:,1:]。",
    points: [
      { h: "双目标自监督", body: "<p><b>DINO</b>：全局 CLS token 的对比（Student 匹配 EMA Teacher 的输出）。<b>iBOT</b>：对随机 mask 的 patch，用 Teacher 提供的目标做像素级重建，使局部特征也一致。</p>" },
      { h: "Teacher = EMA", body: "<p>Teacher 是 Student 参数的指数滑动平均，不反向传播，仅作为稳定的蒸馏目标。橙虚线表示 Teacher 给 DINO/iBOT 两路提供监督。</p>" },
      { h: "作为 backbone", body: "<p>输出 CLS(图像级) + patch(像素级) 两类特征，可直接冻结用于分类/检测/分割，无需微调即可得到强泛化特征。常见规模 base/small/large/giant(ViT-g/14)。</p>" }
    ]
  },

  sam: {
    id: "sam",
    name: "SAM",
    group: "small",
    year: 2023,
    family: "Promptable Segmentation",
    desc: "Meta Segment Anything。三件套：Image Encoder(ViT-H) 一次性编码图像；Prompt Encoder 编码点/框/文字等提示；轻量 Mask Decoder 把图像嵌入与提示嵌入融合解码出掩码。支持 promptable 零样本分割，训练于 SA-1B(11M 图 / 1.1B mask)。",
    diagram: `<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,sans-serif">
      <defs><marker id="a_s" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7dd3fc"/></marker></defs>
      <g fill="none" stroke="#7dd3fc" stroke-width="1.6" marker-end="url(#a_s)">
        <line x1="130" y1="68" x2="172" y2="68"/>
        <line x1="130" y1="208" x2="172" y2="208"/>
        <line x1="320" y1="96" x2="430" y2="138"/>
        <line x1="320" y1="208" x2="430" y2="170"/>
        <line x1="600" y1="138" x2="560" y2="138"/>
      </g>
      <g>
        <rect x="20" y="40" width="110" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="75" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">图像</text><text x="75" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">一次性编码</text>
        <rect x="180" y="40" width="140" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="250" y="62" fill="#e8eef7" font-size="13" text-anchor="middle">Image Encoder</text><text x="250" y="80" fill="#9fb0c3" font-size="11" text-anchor="middle">ViT-H</text>
        <rect x="20" y="180" width="110" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="75" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">Prompt</text><text x="75" y="228" fill="#9fb0c3" font-size="10" text-anchor="middle">点/框/文字</text>
        <rect x="180" y="180" width="140" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="250" y="210" fill="#e8eef7" font-size="13" text-anchor="middle">Prompt Encoder</text>
        <rect x="440" y="110" width="160" height="56" rx="10" fill="rgba(251,113,133,.08)" stroke="#fb7185"/>
        <text x="520" y="132" fill="#e8eef7" font-size="13" text-anchor="middle">Mask Decoder</text><text x="520" y="150" fill="#9fb0c3" font-size="10" text-anchor="middle">轻量 Transformer</text>
        <rect x="600" y="110" width="70" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="635" y="140" fill="#e8eef7" font-size="13" text-anchor="middle">Mask</text>
      </g>
      <text x="20" y="276" fill="#9fb0c3" font-size="12">Promptable 分割：同一图像嵌入 + 不同提示 → 不同掩码；SA-1B 训练，零样本泛化</text>
    </svg>`,
    code: `from transformers import SamModel, SamProcessor
import torch

model = SamModel.from_pretrained("facebook/sam-vit-huge").to("cuda")
processor = SamProcessor.from_pretrained("facebook/sam-vit-huge")

# 用点提示分割
inputs = processor(
    images=image,
    input_points=[[[250, 180]]],          # 单点提示（可多个）
    return_tensors="pt").to("cuda")
with torch.no_grad():
    outputs = model(**inputs)

masks = processor.image_processor.post_process_masks(
    outputs.pred_masks.cpu(),
    inputs["original_sizes"].cpu(),
    inputs["reshaped_input_sizes"].cpu())
scores = outputs.iou_scores
best = masks[0][0][scores[0][0].argmax()]   # 取最高分掩码`,
    note: "Image Encoder 最重(ViT-H)，推理时图像只编码一次；Mask Decoder 很轻，可实时响应不同提示。适合交互式/自动分割，常作检测或分割流水线中的掩码头。",
    identity: {
      task: "Promptable 分割（点/框/文字提示 → 分割掩码）",
      problem: "交互式/零样本分割，需通用地对任意目标出掩码",
      idea: "Image Encoder(ViT-H) 一次性编码图像 + Prompt Encoder 编码提示 + 轻量 Mask Decoder 融合两者解码掩码",
      input: "图像 3 × H × W + prompt（点/框/文字/已有掩码）",
      output: "mask B×1×H×W + IoU 分数",
      params: "ViT-H ≈ 632M；总 ≈ 635M",
      flops: "Image Encoder 重（ViT-H），Decoder 极轻",
      pros: "图像一次编码可换多提示；零样本；实时响应不同提示",
      cons: "Image Encoder 最重；依赖提示质量；自动分割需额外 prompt 生成"
    },
    shapes: [
      {label:"输入图像",shape:"3 × 1024 × 1024"},
      {label:"Image Encoder ViT-H",shape:"B × 256 × 64 × 64"},
      {label:"Prompt Encoder",shape:"sparse+文字 嵌入"},
      {label:"Mask Decoder",shape:"B × 4 × 256 × 256"},
      {label:"上采样",shape:"B × 1 × H × W"}
    ],
    shapeNote: "ViT-H 输出经 Neck 降为 256×64×64 图像嵌入（1024/16=64）；Mask Decoder 输出 4 张多尺度 mask logits 再双线性上采样回原图；取最高 IoU 掩码。",
    points: [
      { h: "三件套", body: "<p><b>Image Encoder(ViT-H)</b> 一次性编码整图；<b>Prompt Encoder</b> 把点/框/文字/已有掩码编码为提示嵌入；<b>Mask Decoder</b> 用轻量 Transformer + 动态掩码 MLP 融合两者输出掩码。</p>" },
      { h: "Promptable 分割", body: "<p>同一图像嵌入配不同提示(点/框/文字)即得不同掩码，支持零样本与交互式分割。无需重编码图像即可换提示。</p>" },
      { h: "数据规模", body: "<p>训练于 SA-1B：11M 图像、约 1.1B 高质量 mask，使模型具备强泛化能力。</p>" }
    ]
  },

  siglip: {
    id: "siglip",
    name: "SigLIP",
    group: "small",
    year: 2023,
    family: "CLIP-style Contrastive Encoder",
    desc: "Google 的图文对比模型。结构同 CLIP：ViT 图像塔 + 文本 Transformer，但用 Sigmoid 对比损失（对 batch 内所有图像-文本配对做 pairwise sigmoid）替代 CLIP 的 Softmax InfoNCE。特征质量更高，常作检测/对齐的视觉 backbone（如 OWL-ViT、SigLIP-2）。",
    diagram: `<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,sans-serif">
      <defs><marker id="a_g" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#7dd3fc"/></marker></defs>
      <g fill="none" stroke="#7dd3fc" stroke-width="1.6" marker-end="url(#a_g)">
        <line x1="130" y1="68" x2="172" y2="68"/><line x1="130" y1="208" x2="172" y2="208"/>
        <line x1="330" y1="68" x2="380" y2="138"/><line x1="330" y1="208" x2="380" y2="170"/>
      </g>
      <g>
        <rect x="20" y="40" width="110" height="56" rx="10" fill="rgba(34,211,238,.08)" stroke="#22d3ee"/>
        <text x="75" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">图像</text>
        <rect x="180" y="40" width="150" height="56" rx="10" fill="rgba(124,92,255,.08)" stroke="#7c5cff"/>
        <text x="255" y="64" fill="#e8eef7" font-size="13" text-anchor="middle">ViT 图像塔</text><text x="255" y="82" fill="#9fb0c3" font-size="11" text-anchor="middle">image emb</text>
        <rect x="20" y="180" width="110" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="75" y="204" fill="#e8eef7" font-size="13" text-anchor="middle">文本</text>
        <rect x="180" y="180" width="150" height="56" rx="10" fill="rgba(52,211,153,.08)" stroke="#34d399"/>
        <text x="255" y="204" fill="#e8eef7" font-size="13" text-anchor="middle">文本 Transformer</text><text x="255" y="222" fill="#9fb0c3" font-size="11" text-anchor="middle">text emb</text>
        <rect x="400" y="110" width="220" height="60" rx="10" fill="rgba(251,113,133,.08)" stroke="#fb7185"/>
        <text x="510" y="134" fill="#e8eef7" font-size="13" text-anchor="middle">Sigmoid 对比损失</text><text x="510" y="152" fill="#9fb0c3" font-size="10" text-anchor="middle">batch 内成对 (i,j) sigmoid</text>
        <rect x="640" y="120" width="30" height="40" rx="6" fill="rgba(245,158,11,.1)" stroke="#f59e0b"/>
        <text x="655" y="144" fill="#f59e0b" font-size="11" text-anchor="middle">t</text>
      </g>
      <text x="20" y="276" fill="#9fb0c3" font-size="12">相对 CLIP 的 Softmax InfoNCE，SigLIP 用 pairwise Sigmoid 损失，特征对齐更稳，常用作检测/多模态 backbone</text>
    </svg>`,
    code: `from transformers import SiglipProcessor, SiglipModel
import torch

model = SiglipModel.from_pretrained("google/siglip-so400m-patch14-384")
processor = SiglipProcessor.from_pretrained("google/siglip-so400m-patch14-384")

inputs = processor(
    images=image,
    texts=["a cat", "a dog", "a car"],
    return_tensors="pt", padding="max_length", max_length=64)
with torch.no_grad():
    out = model(**inputs)

image_embeds = out.image_embeds          # 已归一化
text_embeds  = out.text_embeds
# 相似度（sigmoid 前的 logits）
logits = image_embeds @ text_embeds.t() * model.logit_scale.exp()
probs = torch.sigmoid(logits)            # 每个 (图,文) 配对概率`,
    note: "Sigmoid 损失对 batch 内每对 (i,j) 独立做二分类，不要求归一化，训练更稳定、可利用难负例。SigLIP 的视觉塔常直接替代 CLIP 作检测/分割 backbone。",
    identity: {
      task: "图文对比 / 视觉-文本对齐（zero-shot 分类·检索·backbone）",
      problem: "CLIP 的 Softmax InfoNCE 行内归一化约束强、难负例利用不足",
      idea: "双塔（ViT 图像塔 + 文本 Transformer）+ 对 batch 内所有 (i,j) 配对做 pairwise Sigmoid 对比损失",
      input: "图像 3 × H × W + 文本（≤64 token）",
      output: "图像/文本嵌入（已归一化）+ pairwise 相似度",
      params: "so400m-patch14-384 ≈ 400M",
      flops: "同规模 ViT（图像塔为主）",
      pros: "特征对齐更稳；可作检测/分割 backbone；利用难负例",
      cons: "仍是双塔无深度融合；需大 batch 对比训练；文本侧无图像感知"
    },
    shapes: [
      {label:"输入图像",shape:"3 × 384 × 384"},
      {label:"ViT 图像塔",shape:"B × (1+Nₚ) × D"},
      {label:"全局池化",shape:"B × D (image_emb)"},
      {label:"文本塔",shape:"B × 64 × D (text_emb)"},
      {label:"对比",shape:"logits → sigmoid"}
    ],
    shapeNote: "图像塔输出取 CLS/全局池化为 image_emb，与文本塔 text_emb 点积×logit_scale 得 logits，再过 sigmoid 得到每个 (图,文) 配对概率。",
    points: [
      { h: "结构：双塔 + 对比", body: "<p>ViT 图像塔 + 文本 Transformer 双塔，输出图像/文本嵌入后比对。与 CLIP 同构，区别在<b>损失函数</b>。</p>" },
      { h: "Sigmoid 对比损失（关键）", body: "<p>对 batch 内所有 (图像 i, 文本 j) 配对做 pairwise 二分类 sigmoid 损失，而非 CLIP 的 Softmax InfoNCE(行内归一化)。不强制配对间归一化，可利用难负例，特征对齐更稳。</p>" },
      { h: "用途", body: "<p>常作<b>视觉 backbone</b>用于开放词汇检测(如 OWL-ViT)、分割、多模态对齐；SigLIP-2 进一步加定位/open-vocab 能力。变体含 So400m 大模型与轻量版。</p>" }
    ]
  }
};

const MODELS_LIST = ["qwen2vl", "qwen25vl", "qwen3vl", "dinov2", "sam", "siglip"];

const MODEL_GROUP_LABEL = { large: "大模型 (VLM)", small: "小模型 (视觉基础)" };
