# 记忆大师 - 背诵工具

## 项目简介

这是一个纯前端的交互式背诵工具，旨在帮助用户高效记忆各种问答知识。用户可以导入自定义的问题与答案对，进行反复练习，并通过答案对比功能直观地看到自己的回答与标准答案的差异。此外，工具还支持将错误题目加入"错题本"进行集中复习和导出，便于长期积累和回顾。

## 快速开始

打开[beisong.mbod.me 主域名](https://beisong.mbod.me/) 或者 [beisong.netlify.app 备份网址](https://beisong.netlify.app/)，输入框中输入 q-a 信息串，点击开始即可！

> **Tip：可以使用 AI 根据背诵内容获取信息串~**

下面是推荐的 AI PROMPT：

```
请根据以下背诵资料，生成结构化 JSON 数据，规则如下：
- 每道题都必须包含完整的背景信息，且自包含，不能引用其他题目（如"上题"或"同上题"）。
- 不要修改原文内容，不要输出除 JSON 以外的内容。

格式：[{"q":"问题或带空的题目","a":"答案或多个答案用英文逗号分隔"}, ...]
资料信息：
{{你的背诵资料}}
```

## 功能特性

### 1. 题库管理

- **灵活的导入方式**：
  - 支持直接在网页上输入 JSON 格式的问题与答案对
  - 支持上传 JSON 文件（格式：`[{"q":"问题","a":"答案"}]`）
  - **支持通过 URL 参数预加载题库**（见下方说明）
  - \*建议由 AI 生成 JSON 数据
- **数据持久化**：
  - 所有题目和错题本数据自动保存到浏览器本地存储
  - 下次访问时自动加载，无需担心数据丢失
  - 支持清空所有数据，方便重新开始

### 2. 智能问答系统

- **逐题展示**：
  - 清晰展示当前问题
  - 提供答案输入框
  - 显示进度指示器
- **答案对比功能**：
  - 提交后即时显示用户答案与标准答案的差异
  - 采用左右两框对比模式
  - 左侧显示"你的答案"（绿色高亮新增/修改）
  - 右侧显示"标准答案"（红色高亮删除/修改）
  - 差异部分支持鼠标悬浮提示 Tooltips，显示对应的另一侧内容

### 3. 错题本功能

- **错题收集**：
  - 用户可手动选择将回答错误的题目加入错题本
  - 自动去重，避免重复添加
  - 支持查看当前错题本内容
- **错题复习**：
  - 支持对错题本进行集中复习
  - 可导出错题本数据为 JSON 文件
  - 支持分享或备份错题本

### 4. 会话管理

- **进度保存**：
  - 自动保存背诵进度
  - 支持继续上次未完成的背诵会话
  - 显示剩余题目数量
- **会话控制**：
  - 支持暂停和继续背诵
  - 可随时返回主页
  - 支持开始新的背诵会话

### 5. 用户界面

- **响应式设计**：
  - 适配各种屏幕尺寸
  - 移动端友好的界面
- **交互反馈**：
  - 操作成功/失败提示
  - 进度指示
  - 清晰的导航系统

## URL 参数预加载题库

你可以通过在 URL 中添加 `data` 参数来预加载题库，应用会自动解析并开始背诵。

### 使用方法

#### 方式一：直接传递 JSON（适合小数据量）

```
https://beisong.mbod.me/?data=[{"q":"问题1","a":"答案1"},{"q":"问题2","a":"答案2"}]
```

**注意**：URL 中的特殊字符需要进行 URL 编码，例如：
- `[` → `%5B`
- `]` → `%5D`
- `"` → `%22`
- `,` → `%2C`

完整示例：
```
https://beisong.mbod.me/?data=%5B%7B%22q%22%3A%22React%E6%98%AF%E4%BB%80%E4%B9%88%EF%BC%9F%22%2C%22a%22%3A%22%E4%B8%80%E4%B8%AAJavaScript%E5%BA%93%22%7D%5D
```

#### 方式二：使用 Base64 编码（推荐，适合大数据量）

1. 准备 JSON 数据：
```json
[{"q":"问题1","a":"答案1"},{"q":"问题2","a":"答案2"}]
```

2. 对 JSON 字符串进行 Base64 编码

3. 将编码结果作为 `data` 参数：
```
https://beisong.mbod.me/?data=W3sicSI6IumXrumimjEiLCJhIjoi562U5qGIMSJ9LHsicSI6IumXrumimjIiLCJhIjoi562U5qGIMiJ9XQ==
```

### 生成编码链接的 JavaScript 代码示例

```javascript
// 方式一：URL 编码
const questions = [{"q":"问题1","a":"答案1"}];
const jsonStr = JSON.stringify(questions);
const urlEncoded = encodeURIComponent(jsonStr);
const url = `https://beisong.mbod.me/?data=${urlEncoded}`;

// 方式二：Base64 编码（推荐）
const questions = [{"q":"问题1","a":"答案1"}];
const jsonStr = JSON.stringify(questions);
const base64Encoded = btoa(jsonStr);
const url = `https://beisong.mbod.me/?data=${base64Encoded}`;
```

### 特点

- 自动识别编码格式（Base64 或直接 JSON）
- 自动验证数据格式
- 加载成功后直接进入背诵页面
- 会清空之前的会话和错题本，开始新的背诵

## 如何开发

请确保你的系统已安装 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)。

1. **克隆仓库**：

   ```bash
   git clone https://github.com/skydog221/memorization-tool.git
   cd memorization-tool
   ```

2. **安装依赖**：

   ```bash
   npm install -g pnpm # 我们推荐使用pnpm。当然，你可以使用任意自己喜欢的包管理器
   pnpm install
   ```

3. **启动开发服务器**：

   ```bash
   pnpm dev
   ```

   项目将在本地的某个端口（通常是 `http://localhost:5173/`）启动。在浏览器中打开该地址即可访问。

## 技术栈

- **前端框架**：React + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **状态管理**：React Hooks
- **本地存储**：localStorage

## 许可证

本项目根据 [Mozilla Public License 2.0 (MPL-2.0)](LICENSE) 许可证发布。详细信息请参阅 `LICENSE` 文件。
