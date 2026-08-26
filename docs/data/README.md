# Data Files

这里是站点的可维护内容源。以后更新内容，优先改这里。

## 文件对应关系

- `site.json`: 站点通用信息，如联系邮箱、主图、logo、访问计数起始值
- `about.json`: Aim and Scope 页面
- `organization.json`: Organization 页面
- `officers.json`: Officer 页面
- `activities.json`: Activities 页面
- `journals.json`: Journals 页面
- `news.json`: HI News 页面
- `newsletters.json`: Newsletter 页面
- `awards-call.json`: Awards 总览页（`award.html`）顶部的年度征集信息（年份、标题、重要日期、投递方式、颁奖说明）
- `awards.json`: 各奖项子页面（`award-achievement.html` 等）的说明和历届获奖记录
- `task-forces.json`: Task Force 页面

## 内容格式

为了便于维护，内容里不再写 HTML。

- 普通正文页面使用 `blocks`
- `blocks` 里的常见类型有：
  - `{"type": "paragraph", "text": "..."}`
  - `{"type": "list", "items": ["...", "..."]}`
  - `{"type": "heading", "text": "..."}`
  - `{"type": "divider"}`
- 如果某一段需要像 award 子项那样缩进，可以写：
  - `{"type": "paragraph", "text": "...", "indent": true}`
- `activities.json` 这类列表页用纯字段：
  - `title`
  - `link`
  - `date`
  - `image`
  - `featured`
- `news.json` 用：
  - `title`
  - `link`
  - `blocks`
- `journals.json` 用：
  - `name`
  - `link`
  - `image`
  - `issue`
  - `blocks`
- `awards.json` 每个奖项用：
  - `name`：奖项全称，也是子页面的标题
  - `slug`：与子页面 `<body data-award="...">` 对应，例如 `achievement`、`middle`、`early`、`thesis`、`industrial`
  - `page`：子页面文件名，例如 `award-early.html`，左侧子栏目和总览页的链接都指向它
  - `navLabel`：左侧 Awards 子栏目里显示的短名称
  - `summary`：总览页奖项链接下方的一句话简介
  - `blocks`：`divider` 之前是征集说明，之后是历届获奖记录（页面会分别显示为 “Call for Nominations” 和 “Past Winners” 两部分）
- 新增一个奖项时：在 `awards.json` 里加一项，并按上面的模板复制一个 `award-<slug>.html`（只需改 `data-award`、`<title>` 和 `description`）

## 日常更新流程

1. 修改对应的 `docs/data/*.json`
2. 如果有新图片或 PDF，放到 `docs/assets/media/` 下面
3. 刷新本地页面或推送到 GitHub Pages

日常维护不需要运行构建脚本。

## 额外说明

- 页面 HTML 在 `docs/*.html`
- 页面样式在 `docs/assets/styles.css`
- 页面渲染逻辑在 `docs/assets/app.js`
- 如果你想重新生成公开导出索引和分文件导出，再运行：

```bash
python3 scripts/build_github_pages.py
```

生成结果会写到：

- [docs/assets/public-db-export.json](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/assets/public-db-export.json)
- [docs/assets/public-db](/Users/aoguo/Downloads/www.ieee-hyperintelligence.org/docs/assets/public-db)
