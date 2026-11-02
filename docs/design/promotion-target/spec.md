# 推广对象（#154 契约版）

- 需求：单品 / 多品 / 活动；生成、创建任务、任务历史与结果摘要。
- 基线 `main@ce9d4e9ca209b82dfedce89de702252d61f10f69`；2026-11-02；替代 B 上一版未按新契约定稿的草稿。AI 辅助静态设计，负责人 B；请 @c4002159 审阅。不改前后端。
- 现有路由：`/generate`、`/tasks`、`/tasks/$taskId/versions/$versionId`。品牌 editor/admin 可创建和查看本品牌任务，品牌边界由服务端校验。

## 状态与图

| 状态 | PNG | 内容 |
|---|---|---|
| 单品 | 01-single-success.png | 沿用商品选择及原有创作字段 |
| 多品 | 02-multiple-success.png | 2–5 个有序选择，第一个主商品，上移/下移 |
| 活动 / 需判断 | 03-activity-needs-review.png | 名称、说明、逐条福利及准确提示文案 |
| 列表 / 结果 | 04-summary-needs-review.png | 多品“商品A、商品B”，活动用活动名；优惠断言仍需人工判断 |
| 空 / 加载 / 错误 / 403 | 05-states.png | 字段和并发校验、request_id、品牌隔离 |

全部 1440 px、自编演示数据、每图 ≤500KB。图是交互方案，没有运行新生成流程。

## 字段与接口

- `GET /brands/{brand_id}/products?status=active` 提供商品选项；不能从草图固定商品或读取异品牌数据。
- `POST /tasks` 默认 `promo_type=product`，仅 `product_id`；既有单品请求保持兼容。
- `multi_product`：有序选择第一个映射为 `product_id`；其余依序放 `extra_product_ids`（1–4 个）。禁止重复、包含主商品或跨品牌/归档项。调整主商品时给即时提示；首项上移、末项下移禁用；未满 2 个禁止提交，达到 5 个禁用未选项但可取消已选。
- `activity`：仅 `activity.name`（必填 1–100）、`detail`（选填 ≤1000）、`perks`（≤10 条、每条 ≤200）。每条独立输入、计数、移除，达到 10 条禁用添加；不发送空白占位行；空白福利行处理遵循服务端校验，不偷偷合并成一条。活动不发送商品字段。名称以外不增必填。
- 任务响应 `promo_type/extra_product_ids/activity`；列表和结果的名称读 `product_name`：多品为“、”连接，活动为活动名，不自行排序；明细可展开。已确认文案则读确认时快照 `promo_label`，不拿新商品名覆盖历史。

## 交互与文案

1. 三选一为可键盘操作的 radio group；切换类型保留本页草稿，提交只含当前类型；切品牌清空旧选择。提交中禁用编辑和重复创建。
2. `gen-v5` 多品卖点前标商品名，禁止宣称取并集；页面不会为方便而把多个 id 塞入 brief。
3. 活动统一提示：**“福利由你填写，系统不核对，发布前请确认”**。活动福利单独进入提示词，不描述为已审核的知识库依据；不自动编造“优惠”“新品”等信息。
4. 模型写出的优惠类断言没有资料依据时，仍按现有证据流程逐条决定。不成立或未决定不能确认；需要编辑/改写并重新检查。设计不把填写福利或点击提示视为完成人工判断。
5. 活动带商品、单品带活动、重复商品等 422 在字段旁显示；404/409 商品失效保留草稿并要求重选；通用异常显示 request_id 与重试，不自动切换成另一种对象。
6. 文案落地放入 `lib/zh.ts` 对应新增模块，复用现有标签和状态映射；本 PR 不修改该公共文件。

## 组件与 token

RadioGroup、Select/Command、多选有序列表、Input、Textarea、Button、Badge、Alert、EmptyState、Skeleton；`font-sans`、`text-sm/base/lg/2xl`、`font-semibold`、`gap-3/6`、`space-y-2/4/6`、`rounded-lg`、`background`、`card`、`foreground`、`muted-foreground`、`primary`、`primary-foreground`、`border`、`input-border`、`selected-tint`、`tone-warn`、`tone-warn-bg`、`destructive`。绘图颜色读取当前 index.css token。

## 与契约不一致 / 未验证

无新增接口提案；以 #154 已合并契约为准，撤回旧稿“活动说明必填、福利一整个自由文本、对象字段名自拟”的方案。未运行真实模型、未验证多品事实归属/优惠识别的实际质量；生成客户端已通过脚本重新生成且与 main 无差异。首末排序按钮的禁用在 spec 明确，静态图只展示按钮位置。
