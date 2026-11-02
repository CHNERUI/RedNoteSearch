# 已确认文案与成绩（#161 契约版）

- 对应需求：成绩记录 a–e；负责人 B；AI 辅助静态设计，2026-11-02，`main@ce9d4e9`。请 @c4002159 审阅。
- 路由提案 `/confirmed-copies`，现有结果页 `/tasks/$taskId/versions/$versionId` 和首页 `/`；新路由和侧栏入口由 A 实现公共壳，不在本 PR 加入口。品牌 admin/editor 可登记。

## 状态清单

| 状态 | PNG | 说明 |
|---|---|---|
| 确认后 / 列表 | 01-confirmed-list-success.png | 标题、模板名、对象、URL、发布时间、最新成绩、提醒与筛选 |
| 发布登记 / URL 错误 | 02-publication-error.png | 小红书 https 限制、字段提示、错误时禁用保存 |
| 成绩登记 | 03-metric-success.png | 三个整数、整条读数近似值勾选、带时区采集时间 |
| 历史 / 待补 | 04-history-needs-review.png | 第 1 天已有记录仍需第 3 天读数 |
| 空 / 加载 / 错误 / 403 | 05-states.png | request_id、输入保留和权限边界 |
| 首页提醒 / 汇总 | 06-summary-success.png | 待补卡片、侧栏角标、两种统计，含近似提示 |
| 数据不足 | 07-insufficient-empty.png | 不展示名次或模板优劣暗示 |

全部图 1440 px、≤500KB、自编数据；未实现新页面或调用写接口。

## 接口与字段

- 确认版本成功由后端同一事务加入已确认文案；不另发创建请求，不把“确认”说成已发布。每个版本一条，迁移已有版本；前端不自行按任务去重以改变数量。
- `GET /brands/{brand_id}/confirmed-copies?needs_metrics=true&q=&page=&page_size=`：读 `title/scenario_name/promo_label/post_url/published_at/latest_metric/needs_metrics`；对象、模板是确认时快照。仅在用户勾“只看待补成绩”时带过滤；默认确认时间倒序，过滤待补时发布时间正序。不从 PNG 计数充当接口值。
- `GET /confirmed-copies/{id}` 打开详情；`PATCH /confirmed-copies/{id}` 只发送修改字段。URL 允许 https 的 xiaohongshu.com、xhslink.com 及其子域，拒绝账号密码/空白；清空发 null。发布时间带时区，允许不晚于现在 10 分钟的容差，界面不另订“只能今天以前”。不访问输入 URL。
- `POST /confirmed-copies/{id}/metrics`：likes/collects/comments 三项均为 0–10亿整数；approximate 默认 false，由“近似值”勾选；source=manual，captured_at 选填并带时区/最多未来 10 分钟。图中 21000 是“2.1万”的录入估计示例，不自动保存 raw_input 或自拟缩写字段。空值不默认为 0，三项不得编造。
- `GET /confirmed-copies/{id}/metrics` 按采集时间倒序列出历史。记录只增不改；一次是当时累计数，**不是把各次记录相加**。不提供无契约的改写历史/删除按钮。
- `GET /brands/{brand_id}/results/summary` 的 total_copies/pending_count/most_used/hottest 展示当前品牌统计。

## 提醒、统计与交互

1. 待补由服务端 needs_metrics 判断：已发布满 3 天，且没有 captured_at 不早于 published_at+3天 的记录。第 1 天的读数不消提醒；界面显示 metrics_due_at，不用浏览器自算替代后端。
2. 首页卡片和侧栏角标都读 pending_count；点击进入 needs_metrics=true 筛选。保存记录后刷新列表、详情、历史与汇总；失败保留输入、显示 request_id，不先减角标。
3. 最常用依 most_used：按模板名及 scene 统计已确认文案篇数，不自加 30 天窗口；本轮要求样本不足 3 篇不展示推荐，因此 total_copies<3 时显示数据不足。无自拟“每模板至少 3 篇”。
4. 最热依 hottest.enough_data/min_notes/notes_with_metrics；少于 3 篇有读数文案时 items 为空，显示数据不足，不排名。足够时按返回顺序展示名称、note_count、average_engagement（每篇最新 点赞+收藏+评论 的模板平均）和 approximate；不改为收藏中位数，不排除近似记录，不重复算多次读数。
5. 读数或汇总 approximate=true 显示“近似值/含近似值”。不用金银牌、冠军等名次装饰，也不暗示统计值说明某模板更好。无数据“—”、加载骨架、错误提示分开，不填零。
6. 表单保留请求中错误与输入，提交中禁止重复，关闭未保存修改需提醒。对话框键盘焦点返回触发项。短链接可保存但插件不能识别其笔记 id，说明继续手填；不自动解析短链接。
7. 文案落地新增 `lib/zh.ts` 专属模块，复用现有日期、错误、状态组件；本 PR 不改公共代码。

## 组件与 token

Table、Dialog、Input、Checkbox、Button、Badge、Alert、Skeleton、EmptyState、日期时间字段；`font-sans`、`text-xs/sm/base/lg/2xl`、`font-semibold`、`gap-3/6`、`space-y-2/4/6`、`rounded-lg`、`background`、`card`、`foreground`、`muted-foreground`、`primary`、`primary-foreground`、`border`、`input-border`、`selected-tint`、`tone-warn`、`tone-warn-bg`、`tone-ok`、`tone-ok-bg`。绘图色值取 index.css token。

## 与契约不一致 / 未验证

没有新增接口字段；新路由属页面方案、不是契约现状。少于 3 篇的“最常用”空状态是本次明确的展示要求，以现有 total_copies 判断，不改服务端统计。撤回旧稿“至少填一项”“保留原始缩写字段”“收藏中位数”“近似不入汇总”“只需任意一条成绩即解除提醒”等自拟方案。未运行新页面、写入数据库、真实插件或平台接口；不把静态图当成验收。侧栏/首页由 A 的公共壳承接。
