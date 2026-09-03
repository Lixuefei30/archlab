/* =========================================================================
 * 网络架构数据  ——  你后续“补充”结构图 / 代码，只改这个文件即可
 * -------------------------------------------------------------------------
 * 每个架构字段说明:
 *   name   显示名
 *   year   年份
 *   cat    分类标签 (Backbone / 轻量 / 检测)
 *   tag    一句话定位
 *   desc   简介
 *   diagram  结构图：可直接写内联 <svg>...</svg>；或写 <img src="assets/diagrams/xxx.svg">
 *            留空(null)则在详情页显示“结构图待补充”占位，待你补充
 *   code    代码：纯文本（建议 PyTorch）。留空则显示占位
 *   note    补充说明（可选）
 *
 * 想新增架构：在 ARCH 里加一项，并在 ARCH_LIST 数组里加上它的 key 即可。
 * 顺序即列表页展示顺序（优先项排前面）。
 * ========================================================================= */

const ARCH = {

  /* ===================== 优先 5 个（已完整） ===================== */

  vgg: {
    name: "VGG", year: 2014, cat: "Backbone", tag: "3×3 小卷积堆叠",
    desc: "由牛津大学 VGG 组与 Google DeepMind 提出（故得名 VGG）。常说的 VGG 指 VGG-16：13 层卷积 + 3 层全连接，全部用 3×3 小卷积 + 2×2 最大池化，靠“重复小卷积”加深网络；结构规整、特征表达强，是经典特征提取骨架。",
    diagram: `<svg viewBox="0 0 980 150" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7dd3fc"/></marker></defs>
      <g font-size="11" fill="#e8eef7" text-anchor="middle">
        <rect x="10" y="55" width="60" height="40" rx="8" fill="#1e2a3d" stroke="#7dd3fc"/><text x="40" y="80">Input 224</text>
        <rect x="90" y="55" width="80" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="130" y="80">conv3×3×64 ×2</text>
        <rect x="190" y="55" width="50" height="40" rx="8" fill="#1e2a3d" stroke="#9fb0c3"/><text x="215" y="80">pool</text>
        <rect x="260" y="55" width="80" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="300" y="80">conv×128 ×2</text>
        <rect x="360" y="55" width="50" height="40" rx="8" fill="#1e2a3d" stroke="#9fb0c3"/><text x="385" y="80">pool</text>
        <rect x="430" y="55" width="80" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="470" y="80">conv×256 ×3</text>
        <rect x="530" y="55" width="50" height="40" rx="8" fill="#1e2a3d" stroke="#9fb0c3"/><text x="555" y="80">pool</text>
        <rect x="600" y="55" width="80" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="640" y="80">conv×512 ×3</text>
        <rect x="700" y="55" width="50" height="40" rx="8" fill="#1e2a3d" stroke="#9fb0c3"/><text x="725" y="80">pool</text>
        <rect x="770" y="55" width="80" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="810" y="80">conv×512 ×3</text>
        <rect x="870" y="55" width="90" height="40" rx="8" fill="#143a2a" stroke="#34d399"/><text x="915" y="80">FC→1000</text>
      </g>
      <g stroke="#7dd3fc" marker-end="url(#a)">
        <line x1="70" y1="75" x2="88" y2="75"/><line x1="170" y1="75" x2="188" y2="75"/>
        <line x1="240" y1="75" x2="258" y2="75"/><line x1="340" y1="75" x2="358" y2="75"/>
        <line x1="410" y1="75" x2="428" y2="75"/><line x1="510" y1="75" x2="528" y2="75"/>
        <line x1="580" y1="75" x2="598" y2="75"/><line x1="680" y1="75" x2="698" y2="75"/>
        <line x1="750" y1="75" x2="768" y2="75"/><line x1="850" y1="75" x2="868" y2="75"/>
      </g>
      <text x="490" y="130" fill="#9fb0c3" font-size="11" text-anchor="middle">特征提取（5 段卷积）→ 分类头</text>
    </svg>`,
    code: `import torch.nn as nn

class VGGBlock(nn.Module):
    def __init__(self, in_ch, out_ch, num_conv=2):
        super().__init__()
        layers = []
        for _ in range(num_conv):
            layers += [nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
                       nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True)]
            in_ch = out_ch
        layers.append(nn.MaxPool2d(2))          # 每段末尾 2×2 下采样
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x)

class VGG16(nn.Module):
    def __init__(self, num_classes=1000):
        super().__init__()
        self.features = nn.Sequential(
            VGGBlock(3, 64, 2), VGGBlock(64, 128, 2),
            VGGBlock(128, 256, 3), VGGBlock(256, 512, 3), VGGBlock(512, 512, 3),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512 * 7 * 7, 4096), nn.ReLU(True), nn.Dropout(),
            nn.Linear(4096, 4096), nn.ReLU(True), nn.Dropout(),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        return self.classifier(self.features(x))`,
    note: "思想：用多个 3×3 替代大卷积（2 个 3×3 ≈ 1 个 5×5 感受野，但参数更少）。检测里常取 features 前几段当作 backbone。",
    identity: {
      task: "图像分类 (ImageNet)",
      problem: "浅网络精度到顶；如何加深又可控",
      idea: "统一 3×3 小卷积堆叠 + 2×2 池化逐级下采样",
      input: "B × 3 × 224 × 224",
      output: "B × 1000",
      params: "≈138M (VGG-16)",
      flops: "≈15.5G",
      pros: "结构规整易扩展；特征表达强",
      cons: "参数量大(多在全连接)；训练/显存要求高",
    },
    shapes: [
      {label:"Input",shape:"B×3×224×224"},
      {label:"5× Conv Blocks",shape:"B×512×7×7"},
      {label:"Flatten",shape:"B×25088"},
      {label:"FC1 / FC2",shape:"B×4096"},
      {label:"FC3",shape:"B×1000"},
    ],
    shapeNote: "5 段卷积逐级下采样 224→112→56→28→14→7，通道 64→128→256→512→512。",
    points: `<h3>① 提出背景与命名</h3>
<p>VGGNet 由牛津大学视觉几何组（Visual Geometry Group）与 Google DeepMind 联合提出，因而冠名 <b>VGG</b>。常说的“VGG”一般指 <b>VGG-16</b>：13 层卷积 + 3 层全连接，共 16 个权重层。</p>

<h3>② 核心思想：block 块状堆叠</h3>
<p>网络由 5 个 <b>vgg-block</b> 串联：每个 block 内为<b>同结构</b>的 3×3 卷积（stride=1, padding=1，输入输出尺寸不变，可堆叠“反复思考”同一尺度特征）；block 之间用 <b>2×2 最大池化(stride=2)</b> 降维，通道数逐级提升以捕捉低级→高级特征。相比 AlexNet 更深、更规整、更易复用扩展。</p>

<h3>③ 为什么统一用 3×3 小卷积？</h3>
<ul>
  <li>全局 kernel 统一为 3×3，尺寸足够小、参数可控；</li>
  <li>2 个 3×3 堆叠 ≈ 1 个 5×5 感受野，但参数更少、非线性更多；</li>
  <li>块内尺寸不变，避免特征图下降过快导致网络无法深入提取。</li>
</ul>

<h3>④ VGG-16 特征图尺寸变化（输入 224×224×3）</h3>
<table>
<tr><th>Block</th><th>输入</th><th>卷积(3×3)</th><th>池化</th><th>输出</th><th>通道</th></tr>
<tr><td>1</td><td>224²</td><td>2 层</td><td>2×2/2</td><td>112²</td><td>64</td></tr>
<tr><td>2</td><td>112²</td><td>2 层</td><td>2×2/2</td><td>56²</td><td>128</td></tr>
<tr><td>3</td><td>56²</td><td>3 层</td><td>2×2/2</td><td>28²</td><td>256</td></tr>
<tr><td>4</td><td>28²</td><td>3 层</td><td>2×2/2</td><td>14²</td><td>512</td></tr>
<tr><td>5</td><td>14²</td><td>3 层</td><td>2×2/2</td><td>7²</td><td>512</td></tr>
</table>
<p>特征图变化：224→112→56→28→14→7，由 pool 2×2 + stride2 实现。</p>

<h3>⑤ 全连接与分类</h3>
<p>将 7×7×512 = 25088 展平，接三层全连接 4096→4096→1000（ImageNet），前两层 ReLU 后接 Dropout，末层 softmax 输出类别。</p>

<h3>⑥ 主要贡献与优缺点</h3>
<p><b>优点：</b>更深的层数带来更优分类；规律、简洁、可堆叠的卷积块设计，易扩展复用；全局统一 3×3 小卷积。</p>
<p><b>缺点：</b>参数量大（且主要集中在全连接层），对训练/存储资源要求高；初始化与 batch size 敏感（初始化不当影响收敛方向，显存不足时大 batch 跑不动，可缩小全连接神经元数）。</p>

<h3>⑦ 常见配置变体（权重层 / 各 block 卷积数）</h3>
<table>
<tr><th>配置</th><th>总权重层</th><th>block1~5 卷积数</th><th>说明</th></tr>
<tr><td>A</td><td>11 (VGG-11)</td><td>1,1,2,2,2</td><td>最浅</td></tr>
<tr><td>B</td><td>13 (VGG-13)</td><td>2,2,2,2,2</td><td>—</td></tr>
<tr><td>D</td><td>16 (VGG-16)</td><td>2,2,3,3,3</td><td>最常用</td></tr>
<tr><td>E</td><td>19 (VGG-19)</td><td>2,2,4,4,4</td><td>最深</td></tr>
</table>
<p><small>注：内容综合自 CSDN 博客《VGG网络》及原论文配置；通道数均为 64→128→256→512→512。</small></p>`,
  },

  resnet: {
    name: "ResNet", year: 2015, cat: "Backbone", tag: "残差连接",
    desc: "用 skip connection 让 y = F(x) + x，解决深层网络退化问题，首次把网络堆到 100+ 层。现代几乎所有视觉 backbone 的基石。",
    diagram: `<svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="b" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7dd3fc"/></marker></defs>
      <rect x="30" y="70" width="60" height="40" rx="8" fill="#1e2a3d" stroke="#7dd3fc"/><text x="60" y="95" fill="#e8eef7" font-size="12" text-anchor="middle">x</text>
      <rect x="120" y="70" width="70" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="155" y="95" fill="#e8eef7" font-size="11" text-anchor="middle">conv-bn</text>
      <rect x="220" y="70" width="70" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="255" y="95" fill="#e8eef7" font-size="11" text-anchor="middle">conv-bn</text>
      <rect x="320" y="70" width="60" height="40" rx="8" fill="#143a2a" stroke="#34d399"/><text x="350" y="95" fill="#e8eef7" font-size="12" text-anchor="middle">y</text>
      <g stroke="#7dd3fc" marker-end="url(#b)">
        <line x1="90" y1="90" x2="118" y2="90"/><line x1="190" y1="90" x2="218" y2="90"/><line x1="290" y1="90" x2="318" y2="90"/>
      </g>
      <path d="M60,70 C50,25 360,25 350,70" fill="none" stroke="#34d399" stroke-width="2" marker-end="url(#b)"/>
      <text x="210" y="48" fill="#34d399" font-size="12" text-anchor="middle">skip connection: +x</text>
      <text x="210" y="150" fill="#9fb0c3" font-size="11" text-anchor="middle">F(x) 学“残差”，梯度可直达浅层</text>
    </svg>`,
    code: `import torch.nn as nn

class BasicBlock(nn.Module):
    expansion = 1
    def __init__(self, in_ch, out_ch, stride=1, downsample=None):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, stride, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_ch)
        self.downsample = downsample          # 通道/分辨率不一致时 1×1 对齐
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        identity = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        if self.downsample is not None:
            identity = self.downsample(x)
        out += identity                        # 残差相加
        return self.relu(out)

# Bottleneck(用于 ResNet50+): 1×1降维 → 3×3 → 1×1升维，expansion=4`,
    note: "你用的 Swin / ConvNeXt / 检测 decoder 都建立在“可堆叠深层 + 梯度直连”的思想上，本质都是残差思路的延伸。",
    identity: {
      task: "图像分类 (ImageNet)",
      problem: "深层网络退化（层多误差反升，非过拟合）",
      idea: "残差连接 y = F(x) + x，学“残差”让梯度直连浅层",
      input: "B × 3 × 224 × 224",
      output: "B × 1000 (ResNet-50)",
      params: "25.6M (ResNet-50)",
      flops: "4.1G (ResNet-50)",
      pros: "可稳定堆 100+ 层；易优化易迁移",
      cons: "计算/显存随深度增；plain 深层仍退化",
    },
    shapes: [
      {label:"Input",shape:"B×3×224×224"},
      {label:"stem 7×7/2+pool",shape:"B×64×56×56"},
      {label:"layer1 (s=1)",shape:"B×256×56×56"},
      {label:"layer2 (s=2)",shape:"B×512×28×28"},
      {label:"layer3",shape:"B×1024×14×14"},
      {label:"layer4",shape:"B×2048×7×7"},
      {label:"GAP + FC",shape:"B×1000"},
    ],
    shapeNote: "ResNet-50 各 stage 通道 [256,512,1024,2048]；下采样在 layer2/3/4 首块 stride=2。",
  },

  swin: {
    name: "Swin Transformer", year: 2021, cat: "Backbone", tag: "分层 + 滑动窗口",
    desc: "把 Transformer 做成“分层 + 移位窗口(shifted window)”的视觉 backbone：局部窗口内算自注意力省算力，跨层逐步下采样得到多尺度特征，检测/分割通用。",
    diagram: `<svg viewBox="0 0 900 160" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="c" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/></marker></defs>
      <g font-size="11" fill="#e8eef7" text-anchor="middle">
        <rect x="10" y="60" width="70" height="40" rx="8" fill="#1e2a3d" stroke="#7dd3fc"/><text x="45" y="85">Image</text>
        <rect x="100" y="60" width="110" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="155" y="85">PatchEmbed 4×</text>
        <rect x="230" y="60" width="120" height="40" rx="8" fill="#2a2440" stroke="#f59e0b"/><text x="290" y="85">Stage1 W-MSA</text>
        <rect x="370" y="60" width="120" height="40" rx="8" fill="#2a2440" stroke="#f59e0b"/><text x="430" y="85">Stage2 SW-MSA</text>
        <rect x="510" y="60" width="120" height="40" rx="8" fill="#2a2440" stroke="#f59e0b"/><text x="570" y="85">Stage3 SW-MSA</text>
        <rect x="650" y="60" width="120" height="40" rx="8" fill="#2a2440" stroke="#f59e0b"/><text x="710" y="85">Stage4 SW-MSA</text>
        <rect x="790" y="60" width="90" height="40" rx="8" fill="#143a2a" stroke="#34d399"/><text x="835" y="85">Features</text>
        <rect x="300" y="112" width="100" height="26" rx="6" fill="#1e2a3d" stroke="#9fb0c3"/><text x="350" y="129" font-size="10">PatchMerge↓2</text>
        <rect x="440" y="112" width="100" height="26" rx="6" fill="#1e2a3d" stroke="#9fb0c3"/><text x="490" y="129" font-size="10">PatchMerge↓2</text>
        <rect x="580" y="112" width="100" height="26" rx="6" fill="#1e2a3d" stroke="#9fb0c3"/><text x="630" y="129" font-size="10">PatchMerge↓2</text>
      </g>
      <g stroke="#f59e0b" marker-end="url(#c)">
        <line x1="80" y1="80" x2="98" y2="80"/><line x1="210" y1="80" x2="228" y2="80"/>
        <line x1="350" y1="80" x2="368" y2="80"/><line x1="490" y1="80" x2="508" y2="80"/>
        <line x1="630" y1="80" x2="648" y2="80"/><line x1="770" y1="80" x2="788" y2="80"/>
      </g>
      <text x="450" y="35" fill="#9fb0c3" font-size="11" text-anchor="middle">W=窗口内注意力，SW=移位窗口（跨窗口交互）</text>
    </svg>`,
    code: `import torch
def window_partition(x, window_size):
    # x: [B, H, W, C]  ->  windows: [B*num_w, window_size, window_size, C]
    B, H, W, C = x.shape
    x = x.view(B, H//window_size, window_size, W//window_size, window_size, C)
    x = x.permute(0,1,3,2,4,5).contiguous()
    return x.view(-1, window_size*window_size, C)

class WindowAttention(nn.Module):
    def __init__(self, dim, window_size, num_heads):
        super().__init__()
        self.window_size = window_size; self.num_heads = num_heads
        self.qkv = nn.Linear(dim, dim*3, bias=False)
        self.proj = nn.Linear(dim, dim)

    def forward(self, x):
        B_, N, C = x.shape
        qkv = self.qkv(x).reshape(B_, N, 3, self.num_heads, C//self.num_heads).permute(2,0,3,1,4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        attn = (q @ k.transpose(-2,-1)) / (C//self.num_heads)**0.5
        attn = attn.softmax(dim=-1)
        out = (attn @ v).transpose(1,2).reshape(B_, N, C)
        return self.proj(out)

# 关键点：Stage 间 PatchMerging 把分辨率减半、通道翻倍（分层多尺度）
# 相邻 Stage 交替使用 W-MSA 与 SW-MSA 实现跨窗口信息交换`,
    note: "Swin 是目标检测里最常用的 Transformer backbone（如 DETR 系列可用 Swin 作 backbone）。窗口注意力把复杂度从 O(N²) 降到 O(N·M²)。",
    identity: {
      task: "通用视觉 backbone（分类/检测/分割）",
      problem: "全局注意力 O(N²) 算力高；Transformer 缺多尺度特征",
      idea: "分层 + 移位窗口（局部注意力省算力，跨层再交互）",
      input: "B × 3 × H × W (如 224)",
      output: "4 级特征图 (56 / 28 / 14 / 7)",
      params: "88M (Swin-B)",
      flops: "15.4G (Swin-B, 224)",
      pros: "线性复杂度；多尺度契合检测/分割",
      cons: "窗口边界损失全局；实现较复杂",
    },
    shapes: [
      {label:"Input",shape:"B×3×224×224"},
      {label:"PatchEmbed 4×4",shape:"B×96×56×56"},
      {label:"Stage1 W-MSA",shape:"B×96×56×56"},
      {label:"PatchMerge",shape:"B×192×28×28"},
      {label:"Stage2 SW-MSA",shape:"B×192×28×28"},
      {label:"Stage3",shape:"B×384×14×14"},
      {label:"Stage4",shape:"B×768×7×7"},
    ],
    shapeNote: "每 Stage 经 PatchMerge 分辨率/2 通道×2；相邻 Stage 交替 W-MSA / SW-MSA 实现跨窗口交互。",
  },

  vit: {
    name: "ViT", year: 2020, cat: "Backbone", tag: "纯 Transformer",
    desc: "把图像切成 patch 当作 token，加位置编码后直接过一堆标准 Transformer block，用 [CLS] token 做分类。大数据下超越 CNN。",
    diagram: `<svg viewBox="0 0 900 160" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="d" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee"/></marker></defs>
      <g font-size="11" fill="#e8eef7" text-anchor="middle">
        <rect x="10" y="60" width="80" height="40" rx="8" fill="#1e2a3d" stroke="#7dd3fc"/><text x="50" y="85">Image 224</text>
        <rect x="110" y="60" width="110" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="165" y="85">Split 16×16</text>
        <rect x="240" y="60" width="120" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="300" y="85">Linear Proj</text>
        <rect x="380" y="55" width="40" height="50" rx="8" fill="#143a2a" stroke="#34d399"/><text x="400" y="85" font-size="10">+Pos</text>
        <rect x="450" y="60" width="150" height="40" rx="8" fill="#2a2440" stroke="#22d3ee"/><text x="525" y="85">Transformer ×L</text>
        <rect x="620" y="60" width="60" height="40" rx="8" fill="#1e2a3d" stroke="#9fb0c3"/><text x="650" y="85">[CLS]</text>
        <rect x="700" y="60" width="160" height="40" rx="8" fill="#143a2a" stroke="#34d399"/><text x="780" y="85">MLP Head → class</text>
      </g>
      <g stroke="#22d3ee" marker-end="url(#d)">
        <line x1="90" y1="80" x2="108" y2="80"/><line x1="220" y1="80" x2="238" y2="80"/>
        <line x1="360" y1="80" x2="378" y2="80"/><line x1="420" y1="80" x2="448" y2="80"/>
        <line x1="600" y1="80" x2="618" y2="80"/><line x1="680" y1="80" x2="698" y2="80"/>
      </g>
      <text x="450" y="135" fill="#9fb0c3" font-size="11" text-anchor="middle">patch 数 N=(224/16)²=196，全局自注意力 O(N²)</text>
    </svg>`,
    code: `import torch.nn as nn

class PatchEmbed(nn.Module):
    def __init__(self, img_size=224, patch=16, in_ch=3, embed=768):
        super().__init__()
        self.n_patches = (img_size // patch) ** 2
        self.proj = nn.Conv2d(in_ch, embed, patch, patch)   # 用卷积切 patch 并升维

    def forward(self, x):
        x = self.proj(x)                 # [B, embed, H/p, W/p]
        return x.flatten(2).transpose(1, 2)   # [B, N, embed]

class ViT(nn.Module):
    def __init__(self, embed=768, num_classes=1000, depth=12, n_heads=12):
        super().__init__()
        self.patch_embed = PatchEmbed()
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed))
        self.pos_embed = nn.Parameter(torch.zeros(1, 1 + self.patch_embed.n_patches, embed))
        enc = nn.TransformerEncoderLayer(embed, n_heads, embed*4, batch_first=True)
        self.blocks = nn.TransformerEncoder(enc, depth)
        self.head = nn.Linear(embed, num_classes)

    def forward(self, x):
        B = x.shape[0]
        x = self.patch_embed(x)
        cls = self.cls_token.expand(B, -1, -1)
        x = torch.cat([cls, x], dim=1) + self.pos_embed
        x = self.blocks(x)
        return self.head(x[:, 0])        # 取 [CLS] 作分类`,
    note: "ViT 是“视觉 + Transformer”的起点；后续 Swin、DeiT、DINO 都在此基础上演进。检测任务里 ViT 常作 backbone 或 Teacher。",
    identity: {
      task: "图像分类 (ImageNet)",
      problem: "CNN 归纳偏置强，难建模长程；大数据下如何超越 CNN",
      idea: "patch 当 token + 标准 Transformer + [CLS] 分类",
      input: "B × 3 × 224 × 224",
      output: "B × 1000",
      params: "86M (ViT-B/16)",
      flops: "17.6G (ViT-B/16)",
      pros: "全局注意力；易扩展；天然多模态友好",
      cons: "数据饥渴(需大数据预训练)；O(N²)；位置编码敏感",
    },
    shapes: [
      {label:"Input",shape:"B×3×224×224"},
      {label:"Patch 16×16",shape:"B×196×768"},
      {label:"+[CLS]+Pos",shape:"B×197×768"},
      {label:"Transformer ×12",shape:"B×197×768"},
      {label:"[CLS]",shape:"B×768"},
      {label:"MLP Head",shape:"B×1000"},
    ],
    shapeNote: "patch 数 N=(224/16)²=196；全局自注意力 O(N²)=196²≈3.8万 对。",
  },

  rtdetr: {
    name: "RT-DETR", year: 2024, cat: "检测", tag: "实时端到端",
    desc: "基于 DETR 的实时端到端检测器：CNN backbone → 高效混合编码器(AIFI+CCFF) → Transformer 解码器(固定 query，一对一匹配)，去掉 NMS，实时且高精度。",
    diagram: `<svg viewBox="0 0 920 170" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="e" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#fb7185"/></marker></defs>
      <g font-size="11" fill="#e8eef7" text-anchor="middle">
        <rect x="10" y="65" width="80" height="40" rx="8" fill="#1e2a3d" stroke="#7dd3fc"/><text x="50" y="90">Image</text>
        <rect x="110" y="65" width="110" height="40" rx="8" fill="#3a2a5d" stroke="#7c5cff"/><text x="165" y="90">CNN Backbone</text>
        <rect x="240" y="45" width="150" height="34" rx="8" fill="#2a2440" stroke="#fb7185"/><text x="315" y="67">AIFI(Transformer)</text>
        <rect x="240" y="85" width="150" height="34" rx="8" fill="#2a2440" stroke="#fb7185"/><text x="315" y="107">CCFF 特征融合</text>
        <rect x="410" y="65" width="170" height="40" rx="8" fill="#2a2440" stroke="#f59e0b"/><text x="495" y="90">Decoder(300 query)</text>
        <rect x="600" y="65" width="130" height="40" rx="8" fill="#143a2a" stroke="#34d399"/><text x="665" y="90">Boxes/Classes</text>
        <rect x="750" y="65" width="150" height="40" rx="8" fill="#143a2a" stroke="#34d399"/><text x="825" y="90">无 NMS 输出</text>
      </g>
      <g stroke="#fb7185" marker-end="url(#e)">
        <line x1="90" y1="85" x2="108" y2="85"/><line x1="220" y1="85" x2="238" y2="85"/>
        <line x1="390" y1="85" x2="408" y2="85"/><line x1="580" y1="85" x2="598" y2="85"/>
        <line x1="730" y1="85" x2="748" y2="85"/>
      </g>
      <text x="460" y="150" fill="#9fb0c3" font-size="11" text-anchor="middle">一对一集合匹配(匈牙利) → 端到端，无需手工 anchor / NMS</text>
    </svg>`,
    code: `import torch.nn as nn

# ===== 混合编码器：AIFI(对最高层做 Transformer) + CCFF(跨尺度融合) =====
class AIFI(nn.Module):
    def __init__(self, dim, n_heads=8):
        super().__init__()
        self.attn = nn.MultiheadAttention(dim, n_heads, batch_first=True)
        self.ffn = nn.Sequential(nn.Linear(dim, dim*2), nn.ReLU(), nn.Linear(dim*2, dim))

    def forward(self, f):                 # f: 最高分辨率特征 [B, N, C]
        a, _ = self.attn(f, f, f)
        return f + self.ffn(a + f)

# ===== 解码器：固定 N 个 object query，端到端预测 =====
class RTDETRDecoder(nn.Module):
    def __init__(self, hidden=256, num_queries=300, num_layers=6, n_heads=8):
        super().__init__()
        self.query = nn.Embedding(num_queries, hidden)
        self.layers = nn.ModuleList([
            nn.TransformerDecoderLayer(hidden, n_heads, hidden*4, batch_first=True)
            for _ in range(num_layers)])

    def forward(self, mem, pos=None):
        q = self.query.weight.unsqueeze(0).repeat(mem.shape[0], 1, 1)
        for layer in self.layers:
            q = layer(q, mem)             # cross-attn: query 看 encoder 记忆
        return q                          # → 接分类/回归头，一对一匹配出框

# 推理：直接输出 N 个框(含背景类)，无需 NMS
# 你正在用的 RF-DETR 即 RT-DETR 系的实时版本；
# Group DETR 用 13 组 query 并行使召回更高(本例 num_queries 可设为 13×基础数)`,
    note: "RT-DETR 的核心优势：端到端、无 NMS、实时。若你的场景多/小目标多，可参考 Group DETR 把 query 复制成 13 组并行解码，提升召回且训练更稳定。",
    identity: {
      task: "实时端到端目标检测",
      problem: "NMS 慢且需调参；两阶段推理慢",
      idea: "CNN backbone + 混合编码器(AIFI+CCFF) + 固定 query 解码器，一对一匹配",
      input: "B × 3 × H × W (如 640×640)",
      output: "N 个框(类别+坐标)，无 NMS",
      params: "≈32M (RT-DETR-L)",
      flops: "≈100G (RT-DETR-L, 640)",
      pros: "端到端无 NMS；实时高精度",
      cons: "需 Transformer 解码；密集小目标可用 Group query 提召回",
    },
    shapes: [
      {label:"Input",shape:"B×3×640×640"},
      {label:"CNN backbone",shape:"B×[256×80²,256×40²,256×20²]"},
      {label:"混合编码器",shape:"B×N×256"},
      {label:"Decoder (300q)",shape:"B×300×256"},
      {label:"分类/回归头",shape:"B×300×(C+4)"},
    ],
    shapeNote: "一对一匈牙利匹配；直接输出 300 框(含背景类) 无需 NMS。RF-DETR 即此系；Group DETR 用 13 组 query 并行。",
  },

  /* ===================== 其余架构（待你补充 diagram/code） ===================== */
  lenet:   {name:"LeNet-5",year:1998,cat:"Backbone",tag:"CNN 雏形",desc:"卷积+池化+全连接开山之作，手写数字识别。",diagram:null,code:null},
  alexnet: {name:"AlexNet",year:2012,cat:"Backbone",tag:"深度学习引爆",desc:"ReLU+Dropout+GPU，ImageNet 夺魁，开启深度学习时代。",diagram:null,code:null},
  googlenet:{name:"GoogLeNet",year:2014,cat:"Backbone",tag:"Inception 多分支",desc:"并行多尺度卷积分支(Inception)，控参下提升表达。",diagram:null,code:null},
  densenet:{name:"DenseNet",year:2017,cat:"Backbone",tag:"密集连接",desc:"每层与之前所有层相连，特征复用充分、更省参。",diagram:null,code:null},
  mobilenet:{name:"MobileNet",year:2017,cat:"轻量",tag:"深度可分离卷积",desc:"拆分深度+逐点卷积，极致轻量，适合端侧实时。",diagram:null,code:null},
  efficientnet:{name:"EfficientNet",year:2019,cat:"轻量",tag:"复合缩放",desc:"统一缩放深度/宽度/分辨率，精度-参数量权衡更优。",diagram:null,code:null},
  convnext:{name:"ConvNeXt",year:2022,cat:"Backbone",tag:"现代 CNN 复兴",desc:"用 Transformer 设计思想重构 CNN，证明卷积仍具竞争力。",diagram:null,code:null},
  fasterrcnn:{name:"Faster R-CNN",year:2015,cat:"检测",tag:"Two-stage",desc:"RPN 生成候选框+分类回归，精度高、相对慢。",diagram:null,code:null},
  yolo:    {name:"YOLO",year:2016,cat:"检测",tag:"One-stage 实时",desc:"整图一次前向直接出框，速度极快；v1→v11 持续演进。",diagram:null,code:null},
  detr:    {name:"DETR",year:2020,cat:"检测",tag:"Transformer 端到端",desc:"Transformer 解码器+集合预测，去 NMS/anchor，端到端开端。",diagram:null,code:null},
};

// 列表展示顺序（优先项在最前）
const ARCH_LIST = [
  "vgg","resnet","swin","vit","rtdetr",
  "lenet","alexnet","googlenet","densenet","mobilenet",
  "efficientnet","convnext","fasterrcnn","yolo","detr"
];
