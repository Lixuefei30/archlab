/* ============================================================
 * faq-data.js — 高频问题 / 面试题 数据
 * 按分类组织；新增问题只需在对应分类的 items 里加 {q, a}
 * 分类会自动从 FAQ 数组生成，无需手动维护目录
 * ============================================================ */
const FAQ = [
  {
    cat: "基础概念",
    items: [
      { q: "感受野（Receptive Field）是什么？怎么算？",
        a: "输出特征图上一个点，对应输入图像上的区域大小。第 l 层感受野 RF_l = RF_{l-1} + (k_l - 1) × ∏_{i=1}^{l-1} s_i，其中 k 是卷积核、s 是 stride。叠加（堆叠小核）比大核更高效地扩大感受野，所以 VGG 用 3×3 替代 11×11/7×7。" },
      { q: "1×1 卷积有什么用？",
        a: "三点：① 跨通道信息融合（线性组合各 channel）；② 升降维、控制计算量（如 ResNet bottleneck 用 1×1 把 256→64→256）；③ 替代全连接做通道数调整。参数量 = C_in × C_out（无空间参数）。" },
      { q: "池化层的作用？为什么现在越来越少用？",
        a: "作用：下采样降分辨率、提供平移不变性、减小计算。但池化会丢失空间细节，且现代网络多用 stride=2 的卷积做下采样（如 ResNet），靠 stride conv 保留更多可学习信息；全局平均池化(GAP)则常替代全连接做分类头。" },
      { q: "BatchNorm 和 LayerNorm 区别？为什么 Transformer 用 LN？",
        a: "BN 在 batch 维度归一化（依赖 batch size，训练/推理不一致）；LN 在特征(通道)维度归一化（与 batch 无关，稳定）。Transformer 用 LN 是因为自注意力是逐样本的特征变换，且 LN 不依赖 batch 统计、更适合变长序列和小 batch / 自回归生成。" },
      { q: "卷积的参数量和 FLOPs 怎么算？",
        a: "参数量 Params = C_out × (C_in × k² + 1)（bias=1）。FLOPs(乘加) ≈ H_out × W_out × C_out × (C_in × k²)。深度可分离卷积把标准卷积拆成 深度卷积(C_in×k²) + 逐点 1×1(C_in×C_out)，FLOPs 大幅下降，是 MobileNet 系列的核心。" }
    ]
  },
  {
    cat: "训练与评估",
    items: [
      { q: "参数量（Params）和 FLOPs 的区别？",
        a: "Params 是模型固定权重数（决定存储/显存占用，与输入无关）；FLOPs 是单次前向的计算量（随输入分辨率变化，决定推理速度）。小模型常追求低 FLOPs；大模型参数量大但可通过量化压缩。模型身份证里两者都列。" },
      { q: "学习率为什么常用 warmup + 衰减？",
        a: "训练初期权重随机、梯度大，直接大学习率易不稳定；warmup 先线性升 LR 让训练平稳。中后期用 step/cosine 衰减逐步缩小 LR 精细收敛。cosine 衰减比 step 更平滑，是 ViT/大模型常用策略。" },
      { q: "过拟合 / 欠拟合怎么判断和应对？",
        a: "train 低、val 低 → 欠拟合（加容量/训练更久）；train 低、val 高 → 过拟合（正则：Dropout/权重衰减/数据增强/早停）。CV 最常用数据增强（翻转/裁剪/色彩抖动/ Mixup/CutMix）缓解过拟合。" },
      { q: "检测里正负样本极不平衡怎么办？",
        a: "Anchor-based 用难负例挖掘(OHEM)或 Focal Loss（对易分样本降权、难分样本升权，α/γ 调制）；或设计少锚框/无锚框(FCOS/ATSS)。分类里常用加权损失、过采样少数类、Focal Loss 同样适用。" },
      { q: "mAP 是什么？怎么算？",
        a: "mean Average Precision：对每个类别按置信度排序，算不同召回率下的精确率，取 PR 曲线下面积 AP，再对所有类平均。目标检测常用 mAP@0.5（IoU 阈值 0.5）和 mAP@0.5:0.95（COCO 主指标）。" }
    ]
  },
  {
    cat: "结构对比",
    items: [
      { q: "CNN 和 Transformer 核心区别？各自适合什么？",
        a: "CNN 用局部卷积+归纳偏置（平移等变、局部性），小数据/稠密任务高效；Transformer 用全局自注意力，长程建模强但需大数据/大算力，且是排列等变需加位置编码。趋势是 hybrid（如 ConvNeXt 把 CNN 现代化、MobileViT 融合两者）。" },
      { q: "ResNet 为什么能训很深？退化问题是什么？",
        a: "退化：plain 网络层数多了训练误差反而上升（非过拟合，是优化困难）。ResNet 用残差 y=F(x)+x，梯度可经恒等捷径直连浅层，使深层至少不差于浅层。详见 ResNet 身份证与要点。" },
      { q: "ViT 为什么需要大量数据 / 预训练？",
        a: "自注意力缺乏 CNN 的局部归纳偏置，从头在小数据上训练易过拟合；用大规模数据(JFT/ImageNet-21k)预训练才能超越 CNN。DeiT 用蒸馏、ConvNeXt/MAE 等缓解了数据依赖，但 ViT 族本质仍偏数据饥渴。" },
      { q: "自注意力复杂度为什么是 O(n²)？怎么优化？",
        a: "n 个 token 两两算相似度 → 计算与显存都 O(n²)。优化：窗口/局部注意力(Swin, 仅 O(n·w²))、稀疏/低秩注意力、线性注意力(用核技巧近似)、以及把图像 patch 数通过 merger 压缩（如 Qwen-VL 视觉 token 减到 1/4）。" },
      { q: "Anchor-based 和 Anchor-free 检测区别？",
        a: "Anchor-based（Faster R-CNN/RetinaNet）预设多尺度/比例锚框做分类回归；Anchor-free（FCOS/CenterNet）直接预测关键点/中心到边界距离，省锚框超参、更简洁。DETR 则彻底去掉锚框与 NMS，用 query 做集合预测。" }
    ]
  },
  {
    cat: "检测与分割",
    items: [
      { q: "NMS（非极大值抑制）是什么？做什么用？",
        a: "后处理：同一目标常产生多个重叠框，按置信度排序，保留最高分框，剔除与它 IoU 超过阈值的低分框，避免重复检测。缺点是超参敏感、难并行；DETR 类用集合预测天然省去 NMS。" },
      { q: "IoU 是什么？GIoU / DIoU 改进了什么？",
        a: "IoU = 两框交集/并集，衡量定位精度。IoU=0 时梯度消失、无方向信息；GIoU 加最小外接框惩罚、DIoU 加中心点距离、CIoU 再加长宽比，使框回归更快更准，常作检测/分割 loss。" },
      { q: "FPN 解决了什么问题？",
        a: "特征金字塔：把深层强语义与浅层高分辨率特征横向融合，让不同尺度目标都能用合适层级的特征检测。是 Faster R-CNN/RetinaNet 多尺度检测的关键，PAFPN/BiFPN 在其上进一步增强。" },
      { q: "RoI Pooling 和 RoI Align 区别？",
        a: "RoI Pooling 把候选框强制量化到特征网格再做池化，引入像素级错位、损害定位；RoI Align 用双线性插值保留小数坐标、不做量化，定位更准，是 Mask R-CNN 提升掩码质量的关键。" }
    ]
  },
  {
    cat: "多模态与部署",
    items: [
      { q: "CLIP / SigLIP 的对比学习怎么训练？",
        a: "双塔（图像塔+文本塔）对(batch 内 N 个图文对)做对比：拉近匹配对、推远不匹配对。CLIP 用 Softmax InfoNCE（行内归一化）；SigLIP 改用 pairwise Sigmoid 损失，可利用难负例、对齐更稳。详见 SigLIP 身份证。" },
      { q: "视觉 token 为什么要压缩（如 ViT→LLM 的 merger）？",
        a: "ViT 输出 patch 数 = (H/14)×(W/14)，高分辨率图像 token 极多，直接进 LLM 算力爆炸。Qwen-VL 用 2×2 PatchMerger 把相邻 4 个 patch 融合为 1 个，token 数变 1/4，既省 LLM 计算又控上下文长度。" },
      { q: "模型量化（INT8）是什么？为什么能加速？",
        a: "把 FP16/FP32 权重/激活映射到 INT8（或更低位），减少存储与内存带宽、利用整数单元提速，代价是少许精度损失。常用 PTQ(训练后量化) 与 QAT(量化感知训练)；INT8 在 TensorRT 上常显著提速。" },
      { q: "推理优化常见手段有哪些？",
        a: "模型侧：量化、剪枝、蒸馏、轻量结构(MobileNet/Shadow)；引擎侧：TensorRT/ONNX Runtime 的算子融合、kernel 选择、FP16/INT8；系统侧：batch、并发、KV-cache。部署前先在验证集测精度回退是否可接受。" }
    ]
  }
];
