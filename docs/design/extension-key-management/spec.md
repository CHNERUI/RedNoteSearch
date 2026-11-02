# 插件密钥管理（待合并 #164）

- 需求：品牌管理员生成、一次复制、列出和作废插件密钥，三步安装说明。
- main 基线 `ce9d4e9`；依赖 #164 head `1dda5ddd116c7edb3d47816ee5d393f95bdfeeeb` 的契约和 `docs/EXTENSION.md`，**不是 main 已上线能力**。2026-11-02；AI 辅助静态设计，负责人 B，请 @c4002159 审阅。
- 路由提案：`/brands` 内插件密钥管理标签或品牌设置页；最终导航由 A 决定。本稿不加生产入口。仅所属品牌 admin，editor 不显示入口，直接访问 403 不登出。

## 状态清单

| 状态 | PNG | 说明 |
|---|---|---|
| 列表 / 安装说明 | 01-list-success.png | 备注、前缀、最后使用、有效/作废、生成与作废 |
| 创建 | 02-create-success.png | 备注必填 1–60 字，明确一次回显 |
| 一次回显 / 复制反馈 | 03-one-time-success.png | 占位符示意，无实际密钥；复制成功/失败说明 |
| 作废确认 | 04-revoke-needs-review.png | 设备备注/前缀，确认后失效，保留既有成绩 |
| 空 / 加载 / 错误 / 403 | 05-states.png | 10 个上限、request_id、权限与明文清理 |

所有图 1440 px、≤500KB，仅自编演示。图中密钥框是说明性占位，不是凭据；未生成、读取或作废任何实际密钥。

## 接口与字段

- `POST /brands/{brand_id}/extension-keys {label}`（1–60）：201 返回 `id/label/prefix/created_at/last_used_at/revoked_at/key`；key 只本次返回，服务端只存哈希；每品牌最多 10 个有效，422。
- `GET /brands/{brand_id}/extension-keys` 无 key，只渲染上述元数据；last_used_at=null 显示“从未使用”，revoked_at!=null 显示“已作废”且无再次作废入口，不提供“查看完整密钥”。有效数从当前品牌列表计算；加载未完成时不据空列表允许超限生成，服务端最终校验。
- `DELETE /brands/{brand_id}/extension-keys/{key_id}`：204，重复作废无害；成功刷新列表，失败保留原状态及 request_id，不提前乐观删除。
- 普通后台管理用用户身份授权；插件 `POST /extension/metrics` 用 X-Extension-Key，不带用户令牌，不能用插件密钥读取管理列表。接口仍按品牌隔离。

## 一次回显与安全交互

1. 创建前显示“生成后只显示一次，请立即复制”。提交中禁用重复创建/关闭；超时不自动重复生成，先刷新列表核对备注和时间；失去明文响应的密钥不能找回，需要作废后重新生成。
2. 成功页准确提示 **“请立即复制，之后无法再看到”**，完整 key 仅保存在当前弹窗组件内存；不进 query cache、localStorage、URL、toast、日志或错误回显。用户主动点击才写剪贴板；成功显示“已复制”，失败保留明文供手动选择复制，不假报成功。
3. 用户关闭、切品牌、离开页面或失去管理权限时立即清除内存明文；复制后不自动关闭，避免用户未完成配置；关闭未复制时提示“关闭后无法再查看”，允许用户返回复制。不暗示浏览器剪贴板或插件本地存储已加密。
4. 作废二次确认显示备注/前缀，不显示完整密钥；成功后密钥无法继续提交，原成绩记录保留。既有插件明文存于浏览器本地且未加密，遗失或换设备建议作废旧密钥。
5. 图 03 并列说明成功/失败反馈样式，实际只展示本次复制结果。截图或录屏时不包含真实明文。本稿无需调用创建 API 来取得样例。

## 三步安装说明（对照 EXTENSION.md 合并其四步）

1. Chrome 打开 `chrome://extensions`，启用开发者模式，点“加载已解压的扩展程序”，选择仓库 `extensions/results-helper` 文件夹。
2. 当前品牌管理员在本页生成插件密钥，立即复制；对其他设备使用独立备注和密钥，不共享到群聊。
3. 点插件图标，在“连接设置”填系统地址和密钥，点“保存并授权”；仅申请填写的那个系统地址。普通页面不擅自请求浏览器系统权限。

使用前先在系统“已确认文案”保存对应帖子网址；在 Chrome 桌面打开笔记，**用户点击读取 → 核对数字 → 用户点击发送**。没有自动打开、后台轮询或小红书接口请求。只发送文档规定的数字、近似标记、采集时间和不含查询串的笔记路径；不发送账号/Cookie。短链接不能识别笔记 id 时手填。评论数冲突要人工处理；没有评论总数时标“未核对”，不假称交叉核对成功；一篇每小时 12 条上限按服务端 429 处理。

## 组件与 token

Tabs、Table、Dialog、Input、Button、Badge、Alert、Skeleton、EmptyState；`font-sans`、`text-xs/sm/base/lg/2xl`、`font-semibold`、`gap-3/6`、`space-y-2/4/6`、`rounded-lg`、`background`、`card`、`foreground`、`muted-foreground`、`primary`、`primary-foreground`、`border`、`input-border`、`selected-tint`、`tone-warn`、`tone-warn-bg`、`destructive`。绘图色值来自现有 index.css。落地文案放 `lib/zh.ts` 新模块，本 PR 不改公共条目。

## 契约差异 / 未验证

字段、权限、上限与一次回显按 #164 固定 head；其接口尚未合并，不能把生产入口提前上线。最终路由需 A 确认，不另造 API。没有实际生成密钥、浏览器安装、权限授权、真实页面读取或发送测试；仅说明与页面设计核对，fixture 的解析测试不等于线上 Chrome 验证。
