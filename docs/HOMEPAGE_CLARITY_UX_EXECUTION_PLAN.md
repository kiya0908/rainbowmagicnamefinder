# 首页 Clarity 用户体验修改记录 260514

## 背景

Microsoft Clarity 录屏显示，首页查询流程里有几个位置会让用户不确定页面是否已经响应。用户输入名字并点击 `Find My Fairy` 后，如果页面变化不明显，用户容易重复输入或重复点击。

核心流程是：

1. 用户输入一个名字。
2. 用户点击 `Find My Fairy`。
3. 页面显示匹配结果，或显示没有匹配到的结果。
4. 用户可以分享结果、打开图片预览，或重新输入另一个名字。

第一批修改优先保护这条主流程。次要的浏览和内容入口在主流程稳定后再补上。

## 优先级

### P0：每次提交查询都必须有可见反馈

问题：

- 多个 Clarity 会话里出现了重复输入和重复点击，但页面没有明显更新。
- 之前的结果滚动依赖 `hasSubmitted` 和结果对象。如果用户连续提交后得到同一种状态，页面可能没有足够明显的响应。

修改：

- 把每次 submit 都当成一次新的查询事件。
- 在表单附近提供短暂状态反馈。
- 每次提交后都把最新结果带到可见区域，包括重复的未匹配结果。
- 让匹配结果和未匹配结果都出现在稳定、可预期的位置。

涉及文件：

- `app/features/fairy-finder/landing-page.tsx`
- `app/features/fairy-finder/components/input-section.tsx`

验收：

- 提交有效名字后，不需要手动滚动也能看到结果。
- 提交未知名字后，显示清楚的未匹配结果，文案不能像网站报错。
- 重复提交同一个名字时，页面仍然有可见反馈。

### P1：让 `Find My Fairy` 看起来并表现得像一个真正的按钮

问题：

- 如果共享的 `.btn-primary` 样式不够明显，当前按钮可能看起来像普通文字。

修改：

- 给按钮明确的背景色、文字颜色、阴影、hover、focus 和 active 状态。
- 移动端保持满宽，桌面端保持稳定宽度。
- 提交处理中增加 disabled/loading 状态。

涉及文件：

- `app/features/fairy-finder/components/input-section.tsx`

验收：

- 首屏里的主要操作按钮足够明显。
- 键盘 focus 状态清楚可见。
- 空输入仍然显示清楚的行内错误。

### P2：让结果图片点击变成有用操作

问题：

- 用户会点击结果图片，但之前点击后没有任何反应。

修改：

- 让结果图片表现得像可点击按钮。
- 点击后打开轻量图片预览弹窗。
- 在弹窗里放入 `Share` 和 `Try Another Name` 操作。
- 保留结果卡片下方原有操作。

涉及文件：

- `app/features/fairy-finder/components/fairy-image.tsx`
- `app/features/fairy-finder/components/result-card.tsx`
- `app/features/fairy-finder/landing-page.tsx`

验收：

- 点击图片后打开更大的封面预览。
- 预览弹窗可以关闭。
- 预览弹窗里可以分享结果，也可以重新输入名字。

### P2：把 `14+ titles` 做成真正的列表入口

问题：

- 用户会点击 `14+ titles` 徽标，但之前它没有跳转。
- 当前站点页面较少，新增内容页也能支持浏览和 SEO。

修改：

- 创建 `/fairy-names` 页面。
- 展示介绍文案和可浏览的 Rainbow Magic fairy 标题列表。
- 把首页封面轮播区域的标题徽标链接到这个页面。
- 在导航和页脚中增加合适入口。

涉及文件：

- `app/routes.ts`
- `app/routes/fairy-names.tsx`
- `app/features/fairy-finder/components/cover-marquee.tsx`
- `app/features/fairy-finder/i18n.ts`

验收：

- 点击标题徽标可以打开列表页。
- 页面有清楚的标题、有效的介绍文案和方便扫读的标题网格。
- 页面包含搜索引擎需要的 metadata。

## 验证

运行：

- `pnpm run typecheck`
- `pnpm run build`

浏览器检查：

- 首页首屏显示明显的主按钮。
- 有效查询：输入 `Ruby`，点击 `Find My Fairy`，结果出现在可见区域。
- 未匹配查询：输入一个未知名字并提交，页面显示清楚的未匹配文案。
- 结果图片可以打开和关闭预览。
- 点击 `Try Another Name` 后，焦点回到输入框。
- `14+ titles` 入口打开 `/fairy-names`。
- `/fairy-names` 能正常显示列表，没有可见运行错误。

## 已完成修改

本次修改已经实现：

- `app/features/fairy-finder/landing-page.tsx`
  - 增加 `lookupSequence` 计数器，让每次表单提交都被视为新的查询事件。
  - 把结果面板移动到首页 hero 区域的输入框下方，让匹配和未匹配结果都出现在稳定、可见的位置。
  - 用结果面板位置判断替换旧的结果区滚动逻辑，只在结果过低或过高时调整视口。
  - 改写未匹配结果文案，让它表达为正常的目录未收录，而不是网站错误。
  - 保留提交名字反馈，匹配和未匹配结果下方都会显示本次查询的名字。

- `app/features/fairy-finder/components/input-section.tsx`
  - 增加明确的提交中状态，并短暂显示 `Finding...`。
  - 给输入框和主按钮增加清楚的 focus 样式。
  - 给主按钮增加独立的强视觉样式，不再只依赖共享按钮类。
  - 保留原有空输入行内错误，并增加屏幕阅读器可读的查询中状态。

- `app/features/fairy-finder/components/fairy-image.tsx`
  - 把结果封面从被动图片改成可聚焦、可点击的按钮。
  - 增加 hover/focus 提示，并显示带缩放图标的 `View` 标签。
  - 保留图片懒加载和封面加载失败时的文字兜底。

- `app/features/fairy-finder/components/result-card.tsx`
  - 为结果图片增加轻量封面预览弹窗。
  - 支持 Escape 键关闭和点击背景关闭。
  - 在预览弹窗中复用原有分享和重新输入操作。

- `app/routes/fairy-names.tsx`
  - 新增 `/fairy-names` 目录页。
  - 按首字母给 fairy 标题分组，并提供 sticky A-Z 字母导航。
  - 增加封面缩略图、更大的封面预览弹窗，以及回到 name finder 的入口。
  - 增加页面 metadata、description、keywords 和 JSON-LD 描述。

- `app/features/fairy-finder/components/cover-marquee.tsx`
  - 把标题徽标改成指向 `/fairy-names` 的真实链接。
  - 使用完整目录数量，不再使用短轮播列表数量。

- `app/features/fairy-finder/i18n.ts`
  - 在顶部导航和页脚 Explore 列表中增加 `Fairy Names`。

- `app/routes.ts`
  - 注册新的 `/fairy-names` 路由。

## 当前状态

本文档中的 P0、P1 和 P2 项目都已经完成。

发布前需要确认：

- 用同一个已匹配名字重复查询。
- 用同一个未知名字重复查询。
- 图片预览的打开、关闭按钮、点击背景关闭和 Escape 关闭。
- `/fairy-names` 的字母导航和封面预览。
