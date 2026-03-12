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
- `awards.json`: Awards 页面
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
