# 创作类型管理（#163 / #155）

- 基线 `main@ce9d4e9`；筛选页面参照待合并 #155（head 285fae4）而非假定已进 main。AI 辅助静态设计，2026-11-02；负责人 B，请 @c4002159 审阅。
- 路由：品牌与商品 `/brands` 内“创作类型”标签，`/scenarios` 类型筛选。品牌 admin 管理；成员可读，editor 无管理入口。内置六类始终只读。

## 状态清单

| 状态 | PNG | 内容 |
|---|---|---|
| 列表 | 01-management-success.png | 六个内置 + 自定义，模板计数、不可删原因及字段缺口 |
| 新增 / 改名 / 重名错误 | 02-edit-error.png | 1–20 字、20 个上限、重名不提交 |
| 删除受阻 | 03-delete-conflict.png | 已知模板引用预禁用；409 的确认文案引用数量 |
| 模板筛选 | 04-template-filter-success.png | 动态 name/key、改名后跟随、清除筛选 |
| 空 / 加载 / 错误 / 403 | 05-states.png | request_id、只读角色、列表保留 |
| 未使用删除 / 条件稿 | 06-delete-unused-pending.png | 可靠引用信息证明未使用时的确认框；接口字段待 A 确认 |

1440 px；每图 ≤500KB；只含虚构演示数据。未实现组件、导航、接口或迁移。

## 字段与接口

- `GET /brands/{brand_id}/creative-types`：取 `key/name/builtin/template_count`，内置在前，自定义按创建时间。不凭 PNG 固定选项顺序；模板数包括停用版本，内置包括全局模板。
- 六个内置 name 按接口为种草/测评/教程/上新/促销/故事；不提供改名、删除、停用操作。自定义不再用上一版“停用”流程。
- `POST .../creative-types {name}`：去首尾空白 1–20 字；同品牌及内置名称不区分大小写重名 409；最多 20 个自定义类型，满额显示原因。
- `PATCH .../creative-types/{key} {name}`：key 不变，模板按 key 关联、刷新后跟随新 name；已确认文案 scene/scenario_name 是历史快照，不改写。
- `DELETE .../creative-types/{key}`：成功 204；有任何模板版本或已确认文案使用则 409，details.templates/confirmed_copies 提供数量。错误保留类型，不先乐观删除；显示 request_id。
- 模板筛选来源为 creative-types，用 key 过滤 scene，显示 name；自定义 key 不是用户名称，不暴露 UUID 代替名称。#155 当前有冲突，合并须保留双方改动，生成文件重新生成。

## 交互

1. 自定义新增/改名弹窗保留输入和重名反馈；提交中禁用重复操作，关闭有未保存内容时提醒，焦点回到入口。
2. 已知 template_count>0 的删除按钮禁用，并常驻“有模板使用，不能删除”说明，不仅依赖 hover。不要认为模板已停用就能删。
3. DELETE 返回 409 后，显示本次服务端给的两类引用数量并保持列表和类型；图 03 右侧表示此错误态，不是 GET 列表已经返回确认文案数量。
4. **图 06 是无引用二次确认的条件稿，待字段补齐后定稿**：必须可靠得知没有确认文案引用，不能用 template_count=0 代替。列表图中这类行明确写“引用信息待补”，不会画成已经可删。
5. 筛选与搜索状态只作用于当前品牌；改名成功刷新类型和模板缓存；切品牌清空旧选项。空筛选清除即可，不伪造模板。
6. 文案落地使用 `lib/zh.ts` 新模块，公共错误/状态复用；本 PR 不改现有公共条目。

## 组件与 token

Tabs、Table、Input、Dialog、Button、Alert、Badge、Select、Skeleton、EmptyState；`font-sans`、`text-sm/base/lg/2xl`、`font-semibold`、`gap-3/6`、`space-y-2/4/6`、`rounded-lg`、`background`、`card`、`foreground`、`muted-foreground`、`primary`、`primary-foreground`、`border`、`input-border`、`selected-tint`、`tone-warn`、`tone-warn-bg`、`destructive`。颜色读取 index.css token。

## 契约缺口（请 A 决定后再落地，不自行选方案）

**GET 只有 template_count，没有 confirmed_copy_count 或 can_delete。** 因此前端无法在 template_count=0 时提前可靠禁用“已确认文案在用”的删除。DELETE 的 409 是事后结果，不能满足提前禁用全部使用中类型的要求。已尝试在 #163 评论提出，GitHub 连接返回 403，消息未送达。

请 A 确认补充只读引用计数/可删除字段，或定义预检能力；本 PR 不改契约、不编造请求，不承诺提前检查已实现。这里保留待定 UI，不用批量拉取所有文案作不可靠替代。内置只读、字段限制、改名和筛选与契约相符；无真实页面/数据库验证。
