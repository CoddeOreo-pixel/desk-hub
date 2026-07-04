<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows-22C55E?style=flat-square" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D16-339933?style=flat-square" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-FF6B00?style=flat-square" />
</p>

<h1 align="center">DeskHub</h1>

<p align="center">
  <strong>桌面中枢 — 局域网远程控制工具</strong>
</p>

<p align="center">
  通过浏览器远程操控你的 Windows 电脑：启动应用、打开网页、执行系统命令、搜索本地音乐。<br/>
  手机扫码即可访问，无需安装任何客户端。
</p>

---

> ⚠️ **安全警告**
>
> DeskHub **没有任何身份验证或加密机制**，任何能访问到你局域网 IP 的设备都可以完全控制你的电脑（包括执行系统命令、关机等高危操作）。
>
> - **仅在可信的私人局域网中使用**（如家庭 Wi-Fi）
> - **绝对不要在公共网络、校园网、公司网络中运行**
> - **不要将服务暴露到公网**（端口转发、内网穿透等）
> - 使用完毕后请及时停止服务
>
> 因不当使用导致的安全问题，本项目不承担任何责任。

---

## 项目介绍

DeskHub 是一款基于 Web 的 Windows 桌面远程控制工具。它将你的电脑变成一个局域网服务节点，任何连接同一 Wi-Fi 的设备都可以通过浏览器对其进行远程操控。

### 为什么做这个项目？

你是否有过这样的场景——躺在床上想用手机控制电脑播放音乐，或者不想起身去关机？DeskHub 就是为了解决这些日常痛点而生的。它不需要你在手机上安装任何 App，扫码即可使用。

### 核心理念

- **零客户端**：手机端无需安装任何应用，浏览器即入口
- **局域网优先**：所有数据在本地传输，不经过任何云服务，隐私安全
- **开箱即用**：双击启动器即可运行，自动检测环境、安装依赖、生成二维码
- **野兽主义美学**：纯黑底色 + 亮绿/亮橙强调色 + 网格纹理，拒绝平庸

### 工作原理

```
┌─────────────┐     Wi-Fi / LAN     ┌─────────────────┐
│   手机浏览器  │ ◄──────────────────► │   电脑 (DeskHub) │
│  扫码即可访问  │    HTTP + WebSocket  │  前端 :5173      │
└─────────────┘                      │  后端 :3000      │
                                     └─────────────────┘
```

1. 电脑端运行 DeskHub 服务（Node.js 后端 + React 前端）
2. 前端开发服务器启用局域网访问（Vite `host: true`）
3. 手机扫描启动器生成的二维码，在浏览器中打开
4. 通过 REST API 和 WebSocket 实现双向通信
5. 后端调用 Windows 系统命令完成实际操作（启动应用、打开网页、执行命令等）

---

## 目录

- [项目介绍](#项目介绍)
- [功能一览](#功能一览)
- [截图预览](#截图预览)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [功能详解](#功能详解)
  - [应用启动器](#应用启动器)
  - [网页快捷访问](#网页快捷访问)
  - [系统命令](#系统命令)
  - [本地音乐搜索](#本地音乐搜索)
  - [系统信息](#系统信息)
- [配置说明](#配置说明)
- [API 参考](#api-参考)
- [设计风格](#设计风格)
- [移动端适配](#移动端适配)
- [启动器](#启动器)
- [开发指南](#开发指南)
- [常见问题](#常见问题)
- [License](#license)

---

## 功能一览

| 功能 | 说明 |
|------|------|
| 应用启动器 | 远程启动电脑上的应用程序，支持添加/编辑/删除，支持 emoji 和自定义图片图标 |
| 网页快捷访问 | 一键打开常用网站，支持书签管理和快速 URL 输入 |
| 系统命令 | 预设关机/重启/休眠/锁屏，支持自定义命令和实时输出 |
| 本地音乐搜索 | 扫描电脑音乐文件，模糊搜索，点击用默认音频播放器打开 |
| 系统信息 | 展示 CPU、GPU、内存、磁盘、网络适配器等硬件信息 |
| 局域网访问 | 手机扫码即可远程控制，无需安装客户端 |
| 移动端适配 | 深度优化手机端体验，抽屉式菜单、触摸优化、刘海屏适配 |
| 交互式启动器 | 一键启动/停止/重启服务，二维码生成，日志管理 |

---

## 截图预览

> 桌面端：左侧侧边栏导航 + 多列卡片布局
>
> 移动端：顶部导航栏 + 抽屉式菜单 + 单列布局

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 18 + TypeScript | 组件化开发，类型安全 |
| **样式方案** | Tailwind CSS | 原子化 CSS，自定义设计系统 |
| **状态管理** | Zustand | 轻量级全局状态管理 |
| **构建工具** | Vite | 极速热重载开发体验 |
| **后端框架** | Node.js + Express | RESTful API 服务 |
| **实时通信** | WebSocket (ws) | 命令输出实时推送、连接状态管理 |
| **后端运行** | tsx | TypeScript 直接运行 + 热重载 |
| **系统信息** | systeminformation | 跨平台硬件信息采集 |
| **项目结构** | npm workspaces | client / server / shared 三包管理 |

---

## 项目结构

```
desk_hub/
├── client/                          # 前端 (React + Vite)
│   ├── src/
│   │   ├── pages/                   # 页面组件
│   │   │   ├── AppsPage.tsx         # 应用启动器
│   │   │   ├── WebPage.tsx          # 网页快捷访问
│   │   │   ├── CommandPage.tsx      # 系统命令
│   │   │   ├── MusicPage.tsx        # 本地音乐搜索
│   │   │   └── MonitorPage.tsx      # 系统信息
│   │   ├── components/              # 通用组件
│   │   │   ├── Card.tsx             # 卡片容器
│   │   │   ├── Sidebar.tsx          # 桌面端侧边栏
│   │   │   ├── Drawer.tsx           # 移动端抽屉菜单
│   │   │   ├── EditModal.tsx        # 编辑弹窗（含 Emoji 选择器）
│   │   │   └── PageHeader.tsx       # 页面标题栏
│   │   ├── stores/                  # Zustand 状态管理
│   │   │   └── index.ts             # 全局 store（应用/网页/命令/音乐/系统/连接状态）
│   │   ├── services/                # 服务层
│   │   │   ├── api.ts               # REST API 封装
│   │   │   └── websocket.ts         # WebSocket 客户端
│   │   ├── App.tsx                  # 根组件（路由/导航/WS连接）
│   │   └── index.css                # 全局样式 + 移动端适配
│   ├── vite.config.ts               # Vite 配置（代理/局域网访问）
│   └── package.json
│
├── server/                          # 后端 (Express)
│   └── src/
│       ├── routes/
│       │   └── index.ts             # API 路由定义
│       ├── services/
│       │   ├── appLauncher.ts       # 应用启动服务
│       │   ├── webOpener.ts         # 网页打开服务（智能浏览器检测）
│       │   ├── commandExec.ts       # 命令执行服务
│       │   ├── localMusic.ts        # 本地音乐扫描/搜索/打开
│       │   ├── musicPlayer.ts       # 在线音乐播放
│       │   └── systemMonitor.ts     # 系统硬件信息采集
│       ├── ws/
│       │   └── index.ts             # WebSocket 管理（连接/心跳/广播）
│       ├── config/
│       │   └── index.ts             # 配置文件读写
│       └── index.ts                 # 服务入口
│
├── shared/                          # 前后端共享
│   └── types/
│       └── index.ts                 # TypeScript 类型定义
│
├── data/                            # 运行时数据
│   └── shortcuts/                   # 上传的应用快捷方式
│
├── config.json                      # 用户配置文件
├── launch-deskhub.bat               # 启动器（双击运行）
├── launch-deskhub.ps1               # 启动器（PowerShell 脚本）
└── package.json                     # 根 package.json（workspaces）
```

---

## 快速开始

### 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Node.js | >= v16 | 推荐使用 LTS 版本 |
| Windows | 7+ | 应用启动、系统命令等功能依赖 Windows |
| 默认音频播放器 | 任意 | 系统关联的音频播放器即可（可选） |

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/desk_hub.git
cd desk_hub

# 安装依赖（npm workspaces 会自动安装所有子包）
npm install
```

### 启动

**方式一：启动器（推荐）**

双击 `launch-deskhub.bat`，进入交互式菜单。启动器会自动：
- 检测 Node.js 环境
- 检查端口冲突
- 安装缺失依赖
- 启动前后端服务
- 生成二维码供手机扫码
- 打开浏览器

**方式二：命令行**

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:server   # 后端 → http://localhost:3000
npm run dev:client   # 前端 → http://localhost:5173
```

### 访问地址

| 访问方式 | 地址 | 说明 |
|----------|------|------|
| 本机 | `http://localhost:5173/` | 电脑浏览器直接访问 |
| 局域网 | `http://你的IP:5173/` | 手机/平板访问，需同一 Wi-Fi |

> 前端开发服务器已启用 `host: true`，自动监听所有网络接口，局域网设备可直接访问。

---

## 功能详解

### 应用启动器

远程启动电脑上的应用程序。

**功能特性：**
- 点击卡片启动应用
- 右键/长按编辑应用信息
- 添加新应用（支持浏览器上传 .exe / .lnk / .bat / .cmd 文件）
- 删除应用
- 自定义图标（emoji 或 base64 图片，图片优先）
- 上传文件时自动提取文件名作为应用名称
- hover 时显示绿色编辑按钮和红色删除按钮

**支持的操作：**
| 操作 | 触发方式 |
|------|----------|
| 启动应用 | 点击卡片 |
| 编辑应用 | 右键卡片 / 点击左上角编辑按钮 |
| 删除应用 | 点击右上角删除按钮 |
| 添加应用 | 点击页面顶部"添加应用"按钮 |

### 网页快捷访问

一键打开常用网站，支持书签管理。

**功能特性：**
- 点击卡片在电脑默认浏览器中打开网页
- 快速 URL 输入框（自动补全 https://）
- 添加/编辑/删除书签
- 自定义图标（emoji 或 base64 图片）
- hover 时显示橙色编辑按钮和红色删除按钮
- 按 Enter 键快速打开输入框中的网址

**智能浏览器启动：**
- 浏览器已运行 → 直接打开 URL
- 浏览器未运行 → 先启动默认浏览器，等待 1.5 秒后再打开目标 URL
- 使用 `cmd /c start` 命令，避免进程阻塞

### 系统命令

远程执行系统命令，支持预设和自定义。

**预设命令：**

| 命令 | 图标 | 颜色 | 说明 |
|------|------|------|------|
| `shutdown` | Power | 红色 | 关机 |
| `restart` | RotateCcw | 橙色 | 重启 |
| `hibernate` | Moon | 绿色 | 休眠 |
| `lock` | Lock | 橙色 | 锁屏 |

**功能特性：**
- 预设命令一键执行，危险操作需二次确认
- 自定义命令输入框，按 Enter 执行
- 命令输出通过 WebSocket 实时推送到前端
- 自定义命令支持标记为危险操作（显示警告图标）

**确认对话框：**
危险命令（关机/重启等）执行前会弹出确认对话框，防止误操作。对话框使用 `createPortal` 渲染到 `document.body`，避免父容器 `transform` 干扰 `fixed` 定位。

### 本地音乐搜索

扫描电脑上的音乐文件，模糊搜索后用默认音频播放器打开。

**扫描范围：**
- `~/Music`、`~/Downloads`、`~/Desktop`
- `D:/Music`、`D:/音乐`、`D:/Downloads`（D/E/F 盘）
- 最多递归 4 层目录
- 自动跳过隐藏目录和 `node_modules`、`$RECYCLE.BIN`

**支持的音频格式：**
`.mp3` `.flac` `.wav` `.aac` `.ogg` `.wma` `.m4a` `.ape` `.alac` `.opus`

**搜索算法（评分制）：**

| 匹配类型 | 得分 | 示例 |
|----------|------|------|
| 完全匹配 | +100 | 搜索 "hello" → 文件名 "hello" |
| 前缀匹配 | +50 | 搜索 "hel" → 文件名 "hello" |
| 子串匹配 | +30 | 搜索 "ell" → 文件名 "hello" |
| 目录匹配 | +10 | 搜索 "rock" → 目录名 "rock" |
| 字符顺序 | +5/字 | 搜索 "hlo" → 文件名 "hello"（h→l→o 按顺序出现） |

- 支持空格分词，所有词需匹配
- 搜索结果按得分降序排列
- 150ms 防抖实时搜索

**打开方式：**
1. 先尝试 `cmd /c start` 打开（利用文件关联）
2. 失败则查找系统已安装的音频播放器直接调用
3. 1 秒超时自动视为成功

**格式颜色标识：**
- FLAC / APE → 绿色
- MP3 / M4A → 橙色
- 其他 → 灰色

### 系统信息

展示电脑硬件静态信息（非实时监控）。

**显示项目：**
- 操作系统（版本、架构、主机名）
- 处理器（型号、核心数、频率）
- 内存（总量）
- GPU（型号、显存）
- 磁盘（文件系统、总容量、已用）
- 网络适配器（接口名、IP 地址、MAC 地址）

> 数据通过 `systeminformation` 库采集，页面加载时获取一次，不实时刷新。

---

## 配置说明

编辑项目根目录的 `config.json` 自定义功能：

```json
{
  "server": {
    "port": 3000
  },
  "apps": [
    {
      "name": "应用名称",
      "path": "快捷方式路径(.lnk) 或可执行文件路径(.exe)",
      "icon": "emoji 或 base64 图片"
    }
  ],
  "websites": [
    {
      "name": "网站名称",
      "url": "https://example.com",
      "icon": "emoji 或 base64 图片"
    }
  ],
  "commands": {
    "presets": ["shutdown", "restart", "hibernate", "lock"],
    "custom": [
      {
        "name": "自定义命令名",
        "cmd": "要执行的命令",
        "dangerous": false
      }
    ]
  },
  "music": {
    "defaultLimit": 20
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `server.port` | number | 后端服务端口，默认 3000 |
| `apps` | array | 应用列表，每项包含 name / path / icon |
| `websites` | array | 网页书签列表，每项包含 name / url / icon |
| `commands.presets` | string[] | 启用的预设命令键名 |
| `commands.custom` | array | 自定义命令列表，每项包含 name / cmd / dangerous |
| `music.defaultLimit` | number | 音乐搜索默认返回数量 |

### 图标格式

图标支持两种格式，**图片优先级高于 emoji**：

| 格式 | 示例 | 说明 |
|------|------|------|
| Emoji | `"💻"` | 直接填写 emoji 字符 |
| Base64 图片 | `"data:image/png;base64,..."` | base64 编码的图片数据 |

### 应用路径

应用路径支持以下格式：

| 格式 | 示例 | 说明 |
|------|------|------|
| 快捷方式 | `"C:\\Users\\...\\app.lnk"` | 推荐使用 .lnk 快捷方式 |
| 可执行文件 | `"C:\\Program Files\\app\\app.exe"` | 直接指向 .exe |
| 命令行命令 | `"code"` | 在 PATH 中的命令 |
| 上传文件 | 通过浏览器上传 | 自动保存到 `data/shortcuts/` 目录 |

---

## API 参考

后端运行在 `http://localhost:3000/api/`，所有接口返回 JSON。

### 应用

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/apps` | 获取应用列表 |
| POST | `/api/apps/launch` | 启动应用（body: `{ appName }`) |
| POST | `/api/apps/upload` | 上传快捷方式文件 |
| POST | `/api/config/apps` | 添加应用 |
| PUT | `/api/config/apps` | 更新应用列表 |
| DELETE | `/api/config/apps/:name` | 删除应用 |

### 网页

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/web/bookmarks` | 获取书签列表 |
| POST | `/api/web/open` | 打开网页（body: `{ url }`) |
| POST | `/api/config/websites` | 添加书签 |
| PUT | `/api/config/websites` | 更新书签列表 |
| DELETE | `/api/config/websites/:name` | 删除书签 |

### 命令

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/commands` | 获取命令列表（预设 + 自定义） |
| POST | `/api/commands/execute` | 执行命令（body: `{ name, cmd? }`) |

### 系统

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/system/info` | 获取系统硬件信息 |

### 音乐

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/music/scan` | 扫描本地音乐文件 |
| GET | `/api/music/status` | 获取索引状态 |
| GET | `/api/music/search?keyword=xxx&limit=50` | 搜索本地音乐 |
| POST | `/api/music/open` | 用默认音频播放器打开（body: `{ path }`) |

### WebSocket

连接地址：`ws://localhost:3000/ws`

**消息类型：**

| 类型 | 方向 | 说明 |
|------|------|------|
| `ping` / `pong` | 双向 | 心跳检测 |
| `_connected` | 服务端→客户端 | 连接成功 |
| `_disconnected` | 服务端→客户端 | 连接断开 |
| `command:output` | 服务端→客户端 | 命令执行输出实时推送 |

---

## 设计风格

采用**野兽主义（Brutalism）+ 网格**风格设计：

### 配色

| 用途 | 颜色 | 色值 |
|------|------|------|
| 基础底色 | 纯黑 | `#000000` |
| 侧边栏 | 深黑 | `#0A0A0A` |
| 卡片背景 | 暗黑 | `#141414` |
| 主强调色 | 亮绿 | `#22C55E` |
| 次强调色 | 亮橙 | `#FF6B00` |
| 危险色 | 玫红 | `#FB7185` |

### 网格纹理

- 全局白色网格，8% 透明度
- Logo 区域网格，12% 透明度

### 字体

| 用途 | 字体 | 说明 |
|------|------|------|
| h1 标题 | Lexend Mega | 几何粗体野兽主义风格 |
| 按钮/代码/标题 | Fira Code | 等宽字体 |
| 正文 | Fira Sans | 无衬线字体 |

> 字体通过 `fonts.loli.net`（国内可访问的 Google Fonts 镜像）加载。

### 组件规范

| 属性 | 值 |
|------|-----|
| 圆角 | 6px |
| 边框 | 2px 粗边框 |
| Hover 边框 | 绿色发光描边 |
| 过渡动画 | 120ms |
| 仅深色模式 | 是 |

### 导航配色

| 页面 | 高亮色 |
|------|--------|
| 应用 / 音乐 / 命令 | 绿色 |
| 网页 / 信息 | 橙色 |

---

## 移动端适配

断点 **1024px** 以下自动切换为移动端布局。

### 布局变化

| 属性 | 桌面端 | 移动端 |
|------|--------|--------|
| 导航 | 220px 左侧侧边栏 | 56px 固定顶部栏 + 抽屉菜单 |
| 卡片 | 2-5 列网格 | 单列 |
| 模态框 | 居中弹出 | 底部弹出，全宽，max 95vh |
| 交互 | hover 效果 | active 按压反馈 |

### 移动端特性

- **顶部栏**：汉堡菜单 + 当前页面名称 + 连接状态图标（绿色 Wifi / 红色 WifiOff）
- **抽屉菜单**：从左侧滑入，80% 宽度，支持 ESC 键和遮罩关闭
- **触摸优化**：按钮/输入框最小 44px 触摸目标
- **刘海屏适配**：`viewport-fit=cover` + `env(safe-area-inset-*)`
- **按压反馈**：`active:scale-95` 替代 hover 效果

### 适配屏幕

主要针对 6.21 英寸 TFT IPS LCD 水滴屏优化：
- 分辨率：2340 × 1080
- PPI：415
- 比例：19.5:9

---

## 启动器

`launch-deskhub.bat` / `launch-deskhub.ps1` 提供完整的交互式服务管理。

### 启动流程

```
启动脚本
  ├── 检测过期日志 → 询问是否清理
  ├── 显示服务状态
  └── 交互式菜单
        ├── [1] 启动 DeskHub
        │     ├── 检测 Node.js 环境
        │     ├── 检查端口冲突
        │     ├── 检查依赖完整性
        │     ├── 启动后端服务
        │     ├── 启动前端服务
        │     ├── 等待端口就绪（最长60秒）
        │     ├── 显示访问地址 + 生成二维码
        │     └── 自动打开浏览器
        ├── [L] 清理日志文件
        │     ├── 显示文件列表（大小/天数）
        │     ├── [1] 清理过期文件（7天以上）
        │     └── [2] 清理全部文件
        └── [0] 退出
```

### 运行中菜单

当服务已运行时，菜单变为：

| 选项 | 说明 |
|------|------|
| [R] | 重启服务（先停止再启动） |
| [S] | 停止服务（终止进程 + 清理残留） |
| [I] | 查看访问地址 + 生成二维码 |
| [O] | 在浏览器中打开 |
| [L] | 清理日志文件 |
| [C] | 继续运行（不操作） |
| [Q] | 退出脚本（服务继续后台运行） |

### 功能细节

**IP 检测：**
- 自动排除虚拟网卡（VMware / VirtualBox / Hyper-V / WSL / Docker 等）
- 优先选择以太网，其次 Wi-Fi / WLAN
- 确保局域网地址为真实物理网卡 IP

**二维码生成：**
- 通过 `api.qrserver.com` 在线 API 生成
- 自动保存为 PNG 图片并打开
- 无网络时显示 URL 文本框供手动输入

**进程管理：**
- 通过 `netstat -ano` 精确查找监听端口的 PID
- 区分 DeskHub 自身进程和外部占用进程
- 停止时清理 tsx watch 等孤儿进程
- 端口仍被占用时自动 force-kill 所有 node 进程

**日志管理：**
- 日志保存在 `.deskhub-logs/` 目录
- 文件命名格式：`frontend-YYYYMMDD-HHmmss.log` / `backend-YYYYMMDD-HHmmss.log`
- 二维码图片：`qr-YYYYMMDD-HHmmss.png`
- 启动时检测过期文件（7天以上），询问是否清理
- 菜单中可手动查看和清理

---

## 开发指南

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端热重载）
npm run dev
```

- 前端：Vite 开发服务器，修改即刷新
- 后端：tsx 运行，修改自动重启

### 构建

```bash
npm run build
```

### 项目约定

| 约定 | 说明 |
|------|------|
| EditModal 渲染 | 必须通过 `ReactDOM.createPortal` 渲染到 `document.body`，避免父容器 `transform` 干扰 `fixed` 定位 |
| 文件选择 | 使用浏览器原生 `<input type="file">`，不使用服务端 GUI 对话框 |
| 字体加载 | 通过 `fonts.loli.net`（国内 Google Fonts 镜像）加载，不使用 `fonts.googleapis.com` |
| 浏览器启动 | 检测浏览器是否运行，未运行时先启动 `about:blank` 等 1.5 秒再打开目标 URL |
| 仅深色模式 | 不提供浅色模式切换 |
| 导航配色 | Apps/Music/Commands 绿色，Web/Info 橙色 |

### 添加新页面

1. 在 `client/src/pages/` 创建页面组件
2. 在 `client/src/App.tsx` 添加路由和导航项
3. 在 `client/src/components/Sidebar.tsx` 和 `Drawer.tsx` 添加导航入口
4. 在 `server/src/routes/index.ts` 添加对应 API
5. 在 `shared/types/index.ts` 添加类型定义

---

## 常见问题

### 手机无法访问

1. 确认手机和电脑连接同一 Wi-Fi
2. 检查电脑防火墙是否放行了 5173 和 3000 端口
3. 确认启动脚本显示的局域网 IP 是真实物理网卡 IP（非虚拟网卡）

### 字体加载失败

如果字体加载超时，项目已配置使用 `fonts.loli.net` 国内镜像。如仍无法加载，检查网络代理设置。

### 浏览器未自动弹出

启动器使用 `cmd /c start` 命令打开浏览器。如果默认浏览器未正确注册，可手动访问 `http://localhost:5173/`。

### 音乐搜索无结果

1. 首次使用需点击"扫描音乐库"按钮
2. 扫描范围包括 `~/Music`、`~/Downloads`、`~/Desktop` 及 D/E/F 盘的音乐目录
3. 仅扫描 4 层深度以内的目录

### WebSocket 连接状态显示异常

连接状态通过 WebSocket `onopen` / `onclose` 事件驱动更新，不依赖消息推送。如状态异常，检查后端 WebSocket 服务是否正常运行。

---

## License

[MIT](LICENSE)
