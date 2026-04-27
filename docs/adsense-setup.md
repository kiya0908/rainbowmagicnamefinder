# AdSense Setup

## Overview

当前项目使用的是：

- React Router v7
- Vite
- Cloudflare Workers runtime env

Google AdSense 不走 `import.meta.env.VITE_*` 直读，而是沿用这条链路：

1. Cloudflare runtime env 提供 `GOOGLE_ADS_ID`
2. `workers/app.ts` 将 `env` 注入 React Router `AppLoadContext`
3. `app/root.tsx` 的 loader 读取 `GOOGLE_ADS_ID`
4. loader data 传给文档层
5. `Document` 在生产环境延迟注入 AdSense 脚本

这条链路与当前 GA4 接入方式一致，也适合 Cloudflare Workers 部署模型。AdSense 客户 ID 是公开标识，不需要作为 secret 保存。

## File Responsibilities

### `public/ads.txt`

AdSense 站点授权文件。

职责：

- 放在站点根路径下
- 部署后可通过 `/ads.txt` 访问
- 让 Google 验证当前域名允许该 AdSense 账号投放广告

### `app/features/document/index.tsx`

文档壳组件。

职责：

- 接收 `GOOGLE_ADS_ID`
- 在 `<head>` 输出 `google-adsense-account` meta
- 在生产环境中延迟注入 AdSense 脚本：
  - `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7718142048250196`
- 在错误页不注入 AdSense 脚本
- 自动兼容 `pub-...` 和 `ca-pub-...` 两种配置写法

### `app/root.tsx`

配置下发入口。

职责：

- 从 Cloudflare runtime env 读取 `GOOGLE_ADS_ID`
- 通过 root loader data 传给 `Document`

### `wrangler.jsonc` / `wrangler.local.jsonc`

Cloudflare 配置入口。

职责：

- 为 Worker 提供 `GOOGLE_ADS_ID`
- 保证部署产物和本地 Cloudflare 预览都能拿到相同 key

## Current Data Flow

完整链路如下：

1. Cloudflare `vars.GOOGLE_ADS_ID`
2. Worker runtime `env.GOOGLE_ADS_ID`
3. `app/root.tsx` loader
4. `Document`
5. `<head>` 输出 `google-adsense-account`
6. 页面加载完成后等待 1.5 秒
7. 客户端向 `<head>` 注入 AdSense 脚本

当前配置值：

- `GOOGLE_ADS_ID=ca-pub-7718142048250196`

## Reusing This Structure In A New Project

如果把这个模板复制到新项目，通常只需要改这些地方：

1. 修改 `public/ads.txt`
   - 换成新 AdSense 账号给出的内容
2. 修改 `wrangler.jsonc`
   - 将 `GOOGLE_ADS_ID` 换成新项目的 AdSense 客户 ID
3. 修改 `wrangler.local.jsonc`
   - 保持本地预览与线上一致
4. 保留 `app/root.tsx` 中的 loader 读取和传参
5. 保留 `app/features/document/index.tsx` 中的 AdSense 注入逻辑

最小操作步骤：

1. 在 Google AdSense 后台添加新网站
2. 按 AdSense 提示生成或复制 `ads.txt` 内容
3. 将 `ads.txt` 放到新项目的 `public/ads.txt`
4. 复制 AdSense 给出的客户 ID，例如 `ca-pub-xxxxxxxxxxxxxxxx`
5. 在 `wrangler.jsonc` 的 `vars` 中添加或替换：

```jsonc
"GOOGLE_ADS_ID": "ca-pub-xxxxxxxxxxxxxxxx"
```

6. 如果需要本地 Cloudflare 预览也启用 AdSense，同步修改 `wrangler.local.jsonc`
7. 部署后按下方验证步骤检查 `/ads.txt` 和 `adsbygoogle.js`

## Configuring `GOOGLE_ADS_ID`

当前模板使用键名：

- `GOOGLE_ADS_ID`

推荐配置位置：

1. `wrangler.jsonc`
2. `wrangler.local.jsonc`

Google 给出的脚本是：

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7718142048250196"
  crossorigin="anonymous"
></script>
```

对应配置为：

```jsonc
"GOOGLE_ADS_ID": "ca-pub-7718142048250196"
```

也可以只填：

```jsonc
"GOOGLE_ADS_ID": "pub-7718142048250196"
```

代码会自动补成 `ca-pub-7718142048250196`。

注意：

- AdSense 客户 ID 是公开标识，不是 secret
- 真正的关键是保证 Worker runtime 能拿到它
- `Document` 只在生产环境注入 AdSense 脚本，本地普通 dev 页面不会出现该脚本
- `GOOGLE_ADS_ID` 是可选配置
- 没有配置 `GOOGLE_ADS_ID` 时，网站可以正常上线，只是不启用 AdSense 脚本和广告账号 meta
- 没有配置 `GOOGLE_ADS_ID` 时，`public/ads.txt` 即使存在，也不会影响网站正常访问

## How To Verify

### Verify `ads.txt`

浏览器打开：

- `https://rainbowmagicfairyname.online/ads.txt`

应看到你放在 `public/ads.txt` 里的内容。

### Verify AdSense script

浏览器 Network 过滤：

- `adsbygoogle`
- `pagead2.googlesyndication.com`

应看到：

- `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7718142048250196`

### Verify page source or Elements

部署后打开页面，在 Elements 的 `<head>` 中应看到：

```html
<meta name="google-adsense-account" content="ca-pub-7718142048250196">
```

页面加载完成后，`<head>` 中还应出现 AdSense script。

### Verify AdSense dashboard

1. 打开 Google AdSense 后台
2. 进入当前站点
3. 等待 Google 抓取和审核
4. 确认 `ads.txt` 状态和站点状态没有报错

## Notes For Future Ad Units

当前改动只接入 AdSense 基础脚本和站点验证，不会自动在页面里插入广告位。

如果以后要增加具体广告位：

1. 先从 AdSense 后台创建广告单元
2. 再在具体页面组件中添加对应 `<ins class="adsbygoogle">`
3. 页面组件只负责广告位位置，账号级脚本仍然放在 `Document`
4. 不要在多个业务页面里重复注入 `adsbygoogle.js`

这样 AdSense 账号脚本集中在文档层，页面广告位可以按业务页面单独维护。
