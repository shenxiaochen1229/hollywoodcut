# HollywoodCut (CineSnapshot)

HollywoodCut (CineSnapshot) 是一个 AI 驱动的电影体验应用。上传你的肖像照片，选择你喜爱的电影宇宙，通过 AI 生成引擎即可瞬间置身于热门电影的幕后片场，与知名电影角色留下不可思议的抓拍合影！

## 🌟 核心功能

1. **高清人像上传**：轻松上传或更换高清人像作为生成的基础。
2. **海量电影试镜**：集成 TMDB 影库资源，一键搜索影片，锁定你的虚拟合照角色。
3. **AI 合成引擎**：采用 Google Gemini 生成引擎，以特定的胶片/拍立得风格复现合影。

## ⚙️ 环境配置

在开始部署或本地运行之前，请基于 `.env.example` 文件创建自己的环境变量文件 `.env.local`：

```bash
cp .env.example .env.local
```

你需要填入以下环境变量（**出于安全考虑，请注意不要将这些 key 放入前端可访问的 `NEXT_PUBLIC_` 变量，亦不要将含有真实 Key 的 `.env.local` 提交到仓库中**）：

- `TMDB_API_KEY`: 来自 The Movie Database 的 API Key，用于检索电影及演职员信息。
- `GEMINI_API_KEY`: 来自 Google AI Studio 的 API Key，用于驱动 Nano Banana Pro 模型进行图像生成。
- `HF_API_KEY`: (可选) Hugging Face 的 Token，用于后续其它开源模型的支持。
- `REPLICATE_API_TOKEN`: (可选) Replicate 平台的 Token，用于备用的换脸引擎。

## 🚀 部署工作流

本应用基于 Next.js (`v14+`) 构建，使用 App Router，推荐通过 [Vercel](https://vercel.com) 进行一键部署，也可以使用自选云服务器进行 Docker / Node.js 部署。

### 方式 一：使用 Vercel 一键部署（推荐）

1. **准备仓库**：将本仓库推送到你的 GitHub。确保你的根目录下包含 `package.json` 及 `next.config.mjs`。
2. **导入项目**：登录 [Vercel](https://vercel.com/)，点击 `Add New...` -> `Project`，然后连接你的 Github 账号并选取 `hollywoodcut` 仓库。
3. **设置环境变量**：
   在 Vercel 部署页面的 **Environment Variables** 设置面板中，粘贴你在本地确认好的各项参数：
   - `TMDB_API_KEY`
   - `GEMINI_API_KEY`
   - 等等...
   *请确保不要给这些变量加上 `NEXT_PUBLIC_` 前缀，以保全私密性。*
4. **点击 Deploy**：等待数分钟，Vercel 将自动完成依赖安装、Next.js 编译并赋予你一个公网域名。部署成功！

### 方式二：本地运行或服务器自行部署

1. **环境准备**：需要 Node.js (推荐 v18+) 与 npm/yarn/pnpm。
2. **安装依赖**：
   ```bash
   npm install
   ```
3. **启动本地开发服务器**：
   ```bash
   npm run dev
   ```
   你可以访问 `http://localhost:3000` 查看效果。
4. **服务端打包发布**：
   ```bash
   npm run build
   npm start
   ```
   在生产环境服务器中，通过 PM2 或编写系统的 Systemd 服务维持 `npm start` 进程长期运行即可。

## 🛡️ 隐私与安全

- 项目中的 API Key 被严格限制在 Next.js 服务端路由 (API Route / Server Action) 使用，客户端绝对不可见。
- 请务必确认已将 `.env*` 纳入 `.gitignore` ，避免意外将私人凭证推送到公开代码库。
