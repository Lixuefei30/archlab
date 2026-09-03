# ArchLab 小程序套壳（web-view）

把已有的 ArchLab 静态站（`D:\000-archlab` 根目录的 `index.html` / `home.html` / `arch.html` / `model.html` / `evolution.html` / `faq.html` + `assets/`）用微信小程序的 `web-view` 包一层，让它在微信里像 App 一样打开。**零改写，SVG 结构图 / 暗色主题 / FAQ 手风琴 / localStorage 全部原样保留。**

---

## 第 0 步：部署静态站到 HTTPS

`web-view` 只能加载 **HTTPS** 地址，所以先把整个 ArchLab 目录部署出去。三个常见选法：

### 选法 A：GitHub Pages（免费，最快）
1. 在 GitHub 新建仓库，例如 `archlab`。
2. 把 `D:\000-archlab` 下**所有文件**（含 `assets/`）推上去（注意：要在仓库根目录，不要套一层 `archlab/` 子文件夹，除非你愿意在路径里多写一级）。
3. 仓库 Settings → Pages → Source 选 `main` 分支 `/root`，保存。
4. 几分钟后得到地址：`https://<你的用户名>.github.io/archlab/`
   - 若你把文件放在仓库子目录 `archlab/`，地址则是 `https://<用户名>.github.io/archlab/` 刚好一致；若放在仓库根，则是 `https://<用户名>.github.io/<仓库名>/`。

### 选法 B：Vercel / Netlify（免费，国内访问更稳可选 Vercel）
- Vercel：装好 CLI 后，在 `D:\000-archlab` 执行 `vercel`，按提示部署，得到一个 `*.vercel.app` 域名。

### 选法 C：国内静态托管（腾讯云静态网站 / 阿里云 OSS，需已备案域名）
- 上传整个目录，开启「静态网站托管」，得到 `https://你的备案域名/archlab/`。

> ⚠️ **国内上线提醒**：微信「业务域名」要求域名已完成 ICP 备案。GitHub Pages 的 `github.io` 通常未在国内备案，开发阶段能跑，但**正式上线**建议用选法 C（已备案域名）。开发阶段不影响，见第 3 步。

---

## 第 1 步：改一行地址

打开 `miniprogram/pages/index/index.js`，把 `BASE` 改成你部署后的地址（**末尾不要斜杠**）：

```js
const BASE = "https://<你的域名>/archlab";   // 例如 https://lixf.github.io/archlab
```

如果想一进小程序就停留在「知识树」首页，把 `data.url` 改成 `BASE + "/home.html"` 即可。

---

## 第 2 步：用微信开发者工具导入

1. 下载安装「微信开发者工具」。
2. 选「小程序」→「导入项目」，目录选 `D:\000-archlab\miniprogram`。
3. AppID：
   - 仅自己调试：选「测试号」即可（或用本项目 `project.config.json` 里占位 `touristappid`）。
   - 要真机预览/上线：填你自己的小程序 AppID（mp.weixin.qq.com 注册）。
4. 导入后右侧模拟器应直接加载出 ArchLab 网页。

---

## 第 3 步：绕过域名校验（开发阶段）

开发者工具右上角「详情」→「本地设置」→ 勾选 **「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**。
这样未备案 / 未加白名单的域名也能直接加载，方便调试。

---

## 第 4 步：正式上线前配置业务域名

1. 登录 [mp.weixin.qq.com](https://mp.weixin.qq.com) → 开发 → 开发管理 → 开发设置 → **业务域名**。
2. 点「下载校验文件」，把该文件放到你静态站的**根目录**（即 `index.html` 同级），确保 `https://<域名>/<校验文件名>.txt` 能访问。
3. 在业务域名里添加你的域名（如 `https://lixf.github.io`）。
4. 去掉第 3 步的「不校验」勾选，真机即可正常打开。

---

## 目录结构

```
miniprogram/
├─ app.js
├─ app.json
├─ app.wxss
├─ project.config.json
├─ sitemap.json
├─ pages/index/
│  ├─ index.wxml      # <web-view src="{{url}}">
│  ├─ index.js        # 改这里 BASE 即可
│  ├─ index.json
│  └─ index.wxss
└─ README.md
```

## 已知限制（web-view 套壳）
- 不能调用微信原生能力（支付、定位、蓝牙等）；纯展示型知识库不受影响。
- 网页内 `localStorage` 可用（用于你以后想加的「学习状态」勾选）。
- 想做成可分享、可离线、像真 App 的体验，需走「原生改写」（WXML + wx:for + SVG 转图片），到时我再帮你 scaffold。

## 二维码带参（可选）
分享链接可用 `pages/index/index?p=resnet` 直接深链到 ResNet 详情页（`index.js` 已支持解析 `p` / `page` 参数）。
