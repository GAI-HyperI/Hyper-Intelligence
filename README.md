# IEEE HITC Website

这个仓库现在面向 GitHub Pages 发布，已经把原站公开内容抽成一套静态版本。

原站最早是基于 `ThinkPHP 6` + MySQL。为了避免继续依赖老后台，也避免把数据库原始导出直接公开，现在仓库只使用脱敏后的公开内容数据。

现在这套版本的核心文件是：

- 静态站入口在 [docs/index.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/index.html)
- 日常维护的内容源在 [docs/data/site.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/site.json) 和各个页面对应的 `docs/data/*.json`
- 数据生成脚本在 [scripts/build_github_pages.py](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/scripts/build_github_pages.py)
- 公开数据库导出索引在 [docs/assets/public-db-export.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/assets/public-db-export.json)
- 分拆后的公开导出目录在 [docs/assets/public-db](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/assets/public-db)

## 用法

平时更新网站内容时：

1. 直接修改 `docs/data/*.json`
2. 如果有新图片或 PDF，放到 `docs/assets/media/`
3. 刷新本地页面，改动会直接生效

不需要为了页面显示去重新运行脚本。

如果你想重新生成公开数据库导出文件，才需要在仓库根目录执行：

```bash
python3 scripts/build_github_pages.py
```

脚本会从 `docs/data/` 目录读取结构化内容，并重新生成：

1. [docs/assets/public-db-export.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/assets/public-db-export.json)
2. [docs/assets/public-db](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/assets/public-db) 目录下的分拆 JSON

图片和 PDF 资源已经整理在 `docs/assets/media/`，可以直接发布。

为了避免把敏感信息一起公开，像邮箱密码、申请表里的个人资料、原始 SQL 导出都不再作为公开仓库的一部分。

## GitHub Pages 部署

推荐直接使用仓库里已经加好的 GitHub Actions：

1. 把代码推到 GitHub 仓库
2. 默认分支用 `main`
3. 打开仓库 `Settings`
4. 进入 `Pages`
5. Build and deployment 选择 `GitHub Actions`

仓库里的 [pages.yml](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/.github/workflows/pages.yml) 会在你推送到 `main` 时自动校验数据、生成公开导出并发布。

## AI for Science Congress 2026 子站

`https://hyper-intelligence.org/ai-for-science/2026/` 是一个独立的子站，文件在 [docs/ai-for-science/2026](docs/ai-for-science/2026)，和 HITC 主站互不影响。

它的源文件是一套 PHP 站点（原地址 `https://ieee-ai-for-science.org/2026/`）。GitHub Pages 不能运行 PHP，所以这个目录是由 [scripts/build_ai_for_science.py](scripts/build_ai_for_science.py) 从 PHP 源码压缩包生成的静态版本：

```bash
python3 scripts/build_ai_for_science.py /path/to/2026_xxxx.tar.gz
```

脚本会把每个 PHP 页面渲染成同名的 `.html`，把指向旧域名和 `.php` 的站内链接改成相对链接，其余文件原样复制，最后打印一份报告（重命名的文件、被排除的开发文件、源码里本来就失效的链接）。

`https://hyper-intelligence.org/ai-for-science/`（不带年份）由 [docs/ai-for-science/index.html](docs/ai-for-science/index.html) 跳转到 `2026/`。这个文件是手写的，不由脚本生成；以后换届时把里面的 `2026` 改成新的年份即可。

每次运行都会让 `docs/ai-for-science/2026` 与源码保持一致（只改写有变化的文件，并删除源码里已不存在的文件），所以不要直接改这个目录里的文件：改 PHP 源码、重新打包、再运行脚本。脚本只支持站点目前用到的 PHP 写法（`include`、字符串变量、`if/else/endif`、`htmlspecialchars` 输出），遇到其他写法会报错停止，而不是生成错误的页面。

## 后续维护建议

- 以后更新内容，优先改对应页面的 JSON，刷新页面即可
- JSON 里现在只放内容字段，不再混入 HTML，页面格式统一由前端代码控制
- `public-db-export.json` 现在只是索引文件，不是维护入口
- 公开导出也已经拆成多个文件，避免一个大 JSON 混在一起
- 推荐的维护文件：
  - [docs/data/about.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/about.json)
  - [docs/data/organization.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/organization.json)
  - [docs/data/officers.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/officers.json)
  - [docs/data/activities.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/activities.json)
  - [docs/data/journals.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/journals.json)
  - [docs/data/news.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/news.json)
  - [docs/data/newsletters.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/newsletters.json)
  - [docs/data/awards.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/awards.json)
  - [docs/data/awards-call.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/awards-call.json)
  - [docs/data/task-forces.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/data/task-forces.json)
- 页面文件本身已经分离：
  - [docs/index.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/index.html)
  - [docs/member.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/member.html)
  - [docs/officer.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/officer.html)
  - [docs/activity.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/activity.html)
  - [docs/journal.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/journal.html)
  - [docs/hinews.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/hinews.html)
  - [docs/letter.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/letter.html)
  - [docs/award.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/award.html)
  - [docs/award-achievement.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/award-achievement.html)、[award-middle.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/award-middle.html)、[award-early.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/award-early.html)、[award-thesis.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/award-thesis.html)、[award-industrial.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/award-industrial.html)（各奖项子页面，左侧 Awards 下的子栏目）
  - [docs/task-force.html](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/task-force.html)
- 如果以后确实要上 WordPress，建议把这套静态站当作视觉和信息结构原型，再单独做主题，不要回头在老 PHP 后台上继续改
