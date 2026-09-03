// ArchLab 套壳：web-view 加载静态站
// 把 BASE 改成你部署后的站点地址（末尾不要斜杠）
const BASE = "https://YOUR-DOMAIN/archlab";

Page({
  data: {
    url: BASE + "/index.html"
  },
  onLoad(options) {
    // 支持从二维码/分享带入具体模型：?p=resnet -> arch.html?id=resnet
    if (options.p) {
      this.setData({ url: BASE + "/arch.html?id=" + options.p });
    } else if (options.page) {
      this.setData({ url: BASE + "/" + options.page });
    }
  }
});
