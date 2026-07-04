# ====================================================================
# DeskHub Launcher v2.1 - Interactive Menu (ZH / EN)
# --------------------------------------------------------------------
# Features:
#   1. Start / Stop / Restart DeskHub services (frontend + backend)
#   2. Auto-detect running status
#   3. Generate QR code for mobile access (online API + offline fallback)
#   4. Display local and LAN access URLs
#   5. Pre-flight checks: Node.js, port conflicts, dependencies
#   6. Log file management with expiry cleanup
#   7. Loop menu (return to menu after actions)
#   8. Smart browser launch (detect if browser is running)
#   9. Language toggle (Chinese / English)
# ====================================================================
# Usage:
#   Double-click  launch-deskhub.bat
#   or
#   powershell -ExecutionPolicy Bypass -File .\launch-deskhub.ps1
# ====================================================================

$ErrorActionPreference = "Stop"

# ---- Configuration ----
$FRONTEND_PORT = 5173
$BACKEND_PORT  = 3000
$SCRIPT_PATH   = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOG_DIR       = Join-Path $SCRIPT_PATH ".deskhub-logs"
$QR_API        = "https://api.qrserver.com/v1/create-qr-code/?size=320x320&data="
$MAX_LOG_AGE_DAYS = 7

# ---- Color Theme (DeskHub Brutalist Style) ----
$C_GREEN  = [ConsoleColor]::Green
$C_ORANGE = [ConsoleColor]::DarkYellow
$C_RED    = [ConsoleColor]::Red
$C_CYAN   = [ConsoleColor]::Cyan
$C_GRAY   = [ConsoleColor]::DarkGray
$C_WHITE  = [ConsoleColor]::White
$C_YELLOW = [ConsoleColor]::Yellow
$C_DGREEN = [ConsoleColor]::DarkGreen

# ---- Unicode Box Drawing ----
$TL = [string][char]0x250C; $TR = [string][char]0x2510; $BL = [string][char]0x2514; $BR = [string][char]0x2518
$HZ = [string][char]0x2500; $VT = [string][char]0x2502; $LT = [string][char]0x251C; $RT = [string][char]0x2524
$CK = [string][char]0x2588; $SH = [string][char]0x2591
$HINT = "$SH$SH$SH"
$BAR = $CK * 66

Set-Location $SCRIPT_PATH

if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR | Out-Null
}

# ---- Language Configuration ----
$script:LangFile = Join-Path $SCRIPT_PATH ".deskhub-lang"
$script:Lang = "zh"
if (Test-Path $script:LangFile) {
    $saved = (Get-Content $script:LangFile -ErrorAction SilentlyContinue).Trim()
    if ($saved -eq "zh" -or $saved -eq "en") { $script:Lang = $saved }
}

# ---- i18n Strings ----
$script:T = @{
    zh = @{
        # Banner
        banner_subtitle = "桌面中枢 - 局域网远程控制工具"

        # Startup expired files
        expired_detected = "检测到 {0} 个超过 {1} 天的过期文件（{2}）"
        expired_prompt   = "是否清理？[Y/n] "
        expired_cleaned  = "已清理 {0} 个过期文件"
        expired_skipped  = "跳过清理，可稍后通过菜单 [L] 手动清理"

        # Node.js
        node_old     = "Node.js {0} 检测到，但需要 v16+"
        node_missing = "未检测到 Node.js（需要 v16+）"
        node_download = "请前往 https://nodejs.org/ 下载安装"
        node_ok      = "Node.js 环境检测通过"

        # Port conflict
        port_conflict  = "检测到端口冲突！"
        port_occupied  = "端口 {0} 被 '{1}' (PID {2}) 占用"
        port_kill      = "[K] 终止冲突进程并继续启动"
        port_abort     = "[A] 取消启动"
        port_choice    = "请选择 [K/A]"
        port_killed    = "已终止 PID {0}"
        port_cancelled = "已取消启动"

        # Dependencies
        dep_installing  = "未找到依赖，正在执行 npm install..."
        dep_first_time  = "首次安装可能需要 1-3 分钟"
        dep_installed   = "依赖安装完成"
        dep_failed      = "npm install 失败：{0}"
        dep_ok          = "依赖检测通过"

        # Start
        starting         = "正在启动 DeskHub 服务..."
        starting_backend = "正在启动后端服务（端口 {0}）..."
        starting_frontend = "正在启动前端服务（端口 {0}）..."
        log_file         = "日志：{0}"
        backend_failed   = "后端启动失败：{0}"
        frontend_failed  = "前端启动失败：{0}"
        waiting          = "正在等待服务就绪（最长60秒）..."
        frontend_label   = "前端"
        backend_label    = "后端"
        startup_timeout  = "服务启动超时"
        check_logs       = "请查看日志目录：{0}"

        # Stop
        stopping      = "正在停止 DeskHub 服务..."
        killing       = "终止 {0} (PID {1}) 端口 {2}"
        cleaning_node = "清理残留 node (PID {0})"
        force_killing = "部分端口仍被占用，强制终止所有 node 进程..."
        port_still    = "端口仍被占用，请手动处理："
        force_stopped = "已强制停止，所有端口已释放"
        stopped       = "已停止 {0} 个进程，所有端口已释放"

        # Access info
        running_title   = "DeskHub 已启动运行！"
        local_access    = "[本机访问]"
        lan_access      = "[局域网访问]  手机 / 平板请使用此地址"
        tip_wifi        = "提示：手机需与电脑连接同一 Wi-Fi"
        generating_qr   = "正在生成局域网访问二维码..."
        qr_saved        = "二维码已保存至：{0}"
        qr_failed       = "无法生成二维码（无网络连接？）"
        qr_manual       = "请在手机浏览器中输入以下地址："
        browser_opened  = "已在浏览器中打开"
        browser_failed  = "无法自动打开浏览器"
        service_running = "服务在后台持续运行中"
        rerun_hint      = "重新运行此脚本可 停止 / 重启 / 查看地址和二维码"

        # Status
        status_running = "运行中"
        status_stopped = "已停止"
        status_title   = "服务状态"

        # Log management
        log_management  = "日志文件管理"
        log_dir_missing = "日志目录不存在"
        log_dir_label   = "日志目录：{0}"
        log_files_label = "日志文件：{0} 个"
        qr_files_label  = "二维码  ：{0} 个"
        total_size_label = "总大小  ：{0}"
        no_files        = "没有需要清理的文件"
        file_list       = "文件列表："
        days_ago        = "天前"
        clean_expired   = "清理过期文件（{0} 个，{1}）"
        clean_expired_none = "清理过期文件（无过期文件）"
        clean_all       = "清理全部文件（{0} 个，{1}）"
        back_menu       = "返回主菜单"
        log_choice      = "请选择 [1/2/0]"
        no_expired      = "没有过期文件"
        cleaned_expired = "已清理 {0} 个过期文件（{1}）"
        cleaned_all     = "已清理全部 {0} 个文件（{1}）"
        cancelled       = "已取消"

        # Menu - running
        menu_running  = "正在运行中"
        menu_choose   = "，请选择操作："
        menu_restart  = "重启服务"
        menu_stop     = "停止服务"
        menu_info     = "查看访问地址 + 二维码"
        menu_open     = "在浏览器中打开"
        menu_logs     = "清理日志文件"
        menu_lang     = "切换语言 (English)"
        menu_continue = "继续运行（不操作）"
        menu_quit     = "退出脚本"
        menu_running_choice = "请选择 [R/S/I/O/L/E/C/Q]"
        service_continue = "服务继续运行中"
        invalid_choice = "无效选择"

        # Menu - stopped
        menu_not_running = "未运行"
        menu_start       = "启动 DeskHub"
        menu_stopped_choice = "请选择 [1/2/3/E/0]"

        # Exit
        goodbye      = "再见！DeskHub 服务（如有）仍在后台运行"
        close_window = "按 ENTER 键关闭此窗口..."
        press_enter  = "按 ENTER 键继续..."

        # Language
        lang_switched = "已切换为中文"
    }
    en = @{
        # Banner
        banner_subtitle = "Desktop Hub - LAN Remote Control"

        # Startup expired files
        expired_detected = "Detected {0} expired files older than {1} days ({2})"
        expired_prompt   = "Clean up? [Y/n] "
        expired_cleaned  = "Cleaned {0} expired files"
        expired_skipped  = "Skipped. Use menu [L] to clean later"

        # Node.js
        node_old     = "Node.js {0} detected, but v16+ required"
        node_missing = "Node.js not found (v16+ required)"
        node_download = "Please download from https://nodejs.org/"
        node_ok      = "Node.js environment OK"

        # Port conflict
        port_conflict  = "Port conflict detected!"
        port_occupied  = "Port {0} occupied by '{1}' (PID {2})"
        port_kill      = "[K] Kill conflicting processes and continue"
        port_abort     = "[A] Abort startup"
        port_choice    = "Choose [K/A]"
        port_killed    = "Killed PID {0}"
        port_cancelled = "Startup cancelled"

        # Dependencies
        dep_installing  = "Dependencies not found, running npm install..."
        dep_first_time  = "First install may take 1-3 minutes"
        dep_installed   = "Dependencies installed"
        dep_failed      = "npm install failed: {0}"
        dep_ok          = "Dependencies OK"

        # Start
        starting         = "Starting DeskHub services..."
        starting_backend = "Starting backend (port {0})..."
        starting_frontend = "Starting frontend (port {0})..."
        log_file         = "Log: {0}"
        backend_failed   = "Backend startup failed: {0}"
        frontend_failed  = "Frontend startup failed: {0}"
        waiting          = "Waiting for services to be ready (max 60s)..."
        frontend_label   = "Frontend"
        backend_label    = "Backend"
        startup_timeout  = "Service startup timed out"
        check_logs       = "Check log directory: {0}"

        # Stop
        stopping      = "Stopping DeskHub services..."
        killing       = "Killing {0} (PID {1}) port {2}"
        cleaning_node = "Cleaning residual node (PID {0})"
        force_killing = "Ports still occupied, force killing all node processes..."
        port_still    = "Ports still occupied, please handle manually:"
        force_stopped = "Force stopped, all ports released"
        stopped       = "Stopped {0} processes, all ports released"

        # Access info
        running_title   = "DeskHub is running!"
        local_access    = "[Local Access]"
        lan_access      = "[LAN Access]  Use this on phone / tablet"
        tip_wifi        = "Tip: Phone must be on the same Wi-Fi as PC"
        generating_qr   = "Generating LAN QR code..."
        qr_saved        = "QR code saved to: {0}"
        qr_failed       = "Cannot generate QR code (no network?)"
        qr_manual       = "Enter this URL in your phone browser:"
        browser_opened  = "Opened in browser"
        browser_failed  = "Cannot open browser automatically"
        service_running = "Services running in background"
        rerun_hint      = "Re-run this script to stop / restart / view address & QR"

        # Status
        status_running = "Running"
        status_stopped = "Stopped"
        status_title   = "SERVICE STATUS"

        # Log management
        log_management  = "Log File Management"
        log_dir_missing = "Log directory not found"
        log_dir_label   = "Log directory: {0}"
        log_files_label = "Log files: {0}"
        qr_files_label  = "QR codes: {0}"
        total_size_label = "Total size: {0}"
        no_files        = "No files to clean"
        file_list       = "File list:"
        days_ago        = "d ago"
        clean_expired   = "Clean expired files ({0} files, {1})"
        clean_expired_none = "Clean expired files (none expired)"
        clean_all       = "Clean all files ({0} files, {1})"
        back_menu       = "Back to main menu"
        log_choice      = "Choose [1/2/0]"
        no_expired      = "No expired files"
        cleaned_expired = "Cleaned {0} expired files ({1})"
        cleaned_all     = "Cleaned all {0} files ({1})"
        cancelled       = "Cancelled"

        # Menu - running
        menu_running  = "running"
        menu_choose   = ", choose an action:"
        menu_restart  = "Restart services"
        menu_stop     = "Stop services"
        menu_info     = "View access info + QR code"
        menu_open     = "Open in browser"
        menu_logs     = "Clean log files"
        menu_lang     = "Switch Language (中文)"
        menu_continue = "Continue running (no action)"
        menu_quit     = "Quit script"
        menu_running_choice = "Choose [R/S/I/O/L/E/C/Q]"
        service_continue = "Services continue running"
        invalid_choice = "Invalid choice"

        # Menu - stopped
        menu_not_running = "not running"
        menu_start       = "Start DeskHub"
        menu_stopped_choice = "Choose [1/2/3/E/0]"

        # Exit
        goodbye      = "Bye! DeskHub services (if any) still running in background"
        close_window = "Press ENTER to close this window..."
        press_enter  = "Press ENTER to continue..."

        # Language
        lang_switched = "Switched to English"
    }
}

# ---- Language Helper ----
function T([string]$Key) {
    return $script:T[$script:Lang][$Key]
}

function Set-Language {
    $script:Lang = if ($script:Lang -eq "zh") { "en" } else { "zh" }
    Set-Content -Path $script:LangFile -Value $script:Lang -Force -ErrorAction SilentlyContinue
    Write-Step "+" (T 'lang_switched') $C_GREEN
    Write-Host ""
}

# ---- Display Width Helper ----
function Get-DisplayWidth([string]$s) {
    $clean = $s -replace '\x1b\[[0-9;]*m',''
    $w = 0
    foreach ($ch in $clean.ToCharArray()) {
        $code = [int]$ch
        if (($code -ge 0x4E00 -and $code -le 0x9FFF) -or
            ($code -ge 0x3000 -and $code -le 0x303F) -or
            ($code -ge 0xFF00 -and $code -le 0xFFEF) -or
            ($code -ge 0x3040 -and $code -le 0x309F) -or
            ($code -ge 0x30A0 -and $code -le 0x30FF) -or
            ($code -ge 0xAC00 -and $code -le 0xD7AF) -or
            ($code -ge 0xFE30 -and $code -le 0xFE4F) -or
            ($code -ge 0x2600 -and $code -le 0x27BF)) {
            $w += 2
        } else {
            $w += 1
        }
    }
    return $w
}

# ---- Size Formatter (smart unit: KB / MB) ----
function Format-Size {
    param([long]$bytes)
    if ($bytes -lt 1MB) {
        return "$([Math]::Round($bytes / 1KB, 1)) KB"
    } else {
        return "$([Math]::Round($bytes / 1MB, 2)) MB"
    }
}

# ---- Utility Functions ----
function Get-Timestamp {
    return Get-Date -Format "yyyyMMdd-HHmmss"
}

function Write-Box {
    param(
        [string[]]$Lines,
        [ConsoleColor]$BorderColor = $C_GREEN,
        [int]$Padding = 1,
        [int]$Indent = 2
    )
    $maxLen = 0
    foreach ($line in $Lines) {
        $w = Get-DisplayWidth $line
        if ($w -gt $maxLen) { $maxLen = $w }
    }
    $innerW = $maxLen + ($Padding * 2)
    $prefix = " " * $Indent

    Write-Host "$prefix$TL$($HZ * $innerW)$TR" -ForegroundColor $BorderColor
    foreach ($line in $Lines) {
        $w = Get-DisplayWidth $line
        $padR = " " * ($innerW - $w - $Padding)
        Write-Host "$prefix$VT$(" " * $Padding)$line$padR$VT" -ForegroundColor $BorderColor
    }
    Write-Host "$prefix$BL$($HZ * $innerW)$BR" -ForegroundColor $BorderColor
}

function Write-Sep {
    Write-Host "  $($HZ * 66)" -ForegroundColor $C_GRAY
}

function Write-Banner {
    Clear-Host
    Write-Host ""
    $logo = @(
        '██████████                    █████                  █████████   ██████████   █████                        '
        '░░███░░░░███                  ░░███                  ███░░░░░███ ░░███░░░░███ ░░███                         '
        ' ░███   ░░███  ██████   █████  ░███ █████           ░███    ░███  ░███   ░░███ ░███████  █████ ████  ███████'
        ' ░███    ░███ ███░░███ ███░░   ░███░░███            ░███████████  ░███    ░███ ░███░░███░░███ ░███  ███░░███'
        ' ░███    ░███░███████ ░░█████  ░██████░             ░███░░░░░███  ░███    ░███ ░███ ░███ ░███ ░███ ░███ ░███'
        ' ░███    ███ ░███░░░   ░░░░███ ░███░░███            ░███    ░███  ░███    ███  ░███ ░███ ░███ ░███ ░███ ░███'
        ' ██████████  ░░██████  ██████  ████ █████ █████████ █████   █████ ██████████   ████████  ░░████████░░███████'
        '░░░░░░░░░░    ░░░░░░  ░░░░░░  ░░░░ ░░░░░ ░░░░░░░░░ ░░░░░   ░░░░░ ░░░░░░░░░░   ░░░░░░░░    ░░░░░░░░  ░░░░░███'
        '                                                                                                    ███ ░███'
        '                                                                                                   ░░██████ '
        '                                                                                                    ░░░░░░'
    )
    # 直接输出裸 logo，不加边框
    foreach ($line in $logo) {
        Write-Host "  $line" -ForegroundColor $C_WHITE
    }
    Write-Host ""
    # 版本号 + 副标题
    Write-Host "  v2.1" -NoNewline -ForegroundColor $C_GREEN
    Write-Host "  " -NoNewline
    Write-Host (T 'banner_subtitle') -ForegroundColor $C_ORANGE
    Write-Host ""
    Write-Host "  $BAR" -ForegroundColor $C_DGREEN
    Write-Host ""
}

function Write-Step {
    param([string]$Icon, [string]$Text, [ConsoleColor]$Color = $C_GREEN)
    Write-Host "  $Icon " -NoNewline -ForegroundColor $Color
    Write-Host $Text -ForegroundColor $Color
}

function Write-Detail {
    param([string]$Text, [ConsoleColor]$Color = $C_GRAY)
    Write-Host "    $VT $Text" -ForegroundColor $Color
}

function Write-MenuItem {
    param(
        [string]$Key,
        [string]$Label,
        [ConsoleColor]$Color = $C_GREEN,
        [int]$Width = 36
    )
    $text = "  [$Key]  $Label"
    $dw = Get-DisplayWidth $text
    $pad = " " * [Math]::Max(0, $Width - $dw)
    Write-Host "  $VT$text$pad$VT" -ForegroundColor $Color
}

function Write-MenuSep {
    param([ConsoleColor]$Color = $C_GREEN)
    Write-Host "  $LT$($HZ * 36)$RT" -ForegroundColor $Color
}

# ---- Network Functions ----
function Get-LocalIP {
    try {
        $adapters = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue
        $validIPs = @($adapters | Where-Object { $_.IPAddress -notmatch "^(127\.|169\.254\.|0\.0\.0\.0)" })
        if ($validIPs.Count -eq 0) { return "127.0.0.1" }

        $virtualKeywords = "VMware|VirtualBox|VBox|Hyper-V|WSL|Docker|vEthernet|Loopback|Bluetooth|Mobile Hotspot|VPN|Tunnel|6to4|ISATAP|Teredo|Pseudo"
        $physicalIPs = @($validIPs | Where-Object { $_.InterfaceAlias -notmatch $virtualKeywords })
        if ($physicalIPs.Count -eq 0) { $physicalIPs = $validIPs }

        $ethernet = @($physicalIPs | Where-Object { $_.InterfaceAlias -match "Ethernet" })
        $wifi     = @($physicalIPs | Where-Object { $_.InterfaceAlias -match "Wi-Fi|Wi Fi|WLAN|Wireless|802\.11" })

        if ($ethernet.Count -gt 0) { return $ethernet[0].IPAddress }
        if ($wifi.Count -gt 0)     { return $wifi[0].IPAddress }
        return $physicalIPs[0].IPAddress
    } catch {
        return "127.0.0.1"
    }
}

function Test-PortOpen {
    param([int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $async = $tcp.BeginConnect("127.0.0.1", $Port, $null, $null)
        $ok = $async.AsyncWaitHandle.WaitOne(300, $false)
        $tcp.Close()
        return $ok
    } catch {
        return $false
    }
}

function Get-PortPIDs {
    param([int[]]$Ports)
    $portMap = @{}
    foreach ($p in $Ports) { $portMap[$p] = @() }
    $seenPids = @{}

    try {
        $lines = netstat -ano 2>$null
        foreach ($line in $lines) {
            if ($line -match "LISTENING") {
                $tokens = @($line -split '\s+' | Where-Object { $_ })
                if ($tokens.Count -ge 5) {
                    $localAddr = $tokens[1]
                    $pidVal = $tokens[-1]
                    foreach ($p in $Ports) {
                        if ($localAddr -match ":$p`$" -and -not $seenPids.ContainsKey("$p-$pidVal")) {
                            $portMap[$p] += $pidVal
                            $seenPids["$p-$pidVal"] = $true
                        }
                    }
                }
            }
        }
    } catch { }

    return $portMap
}

# ---- Check Functions ----
function Test-NodeAvailable {
    try {
        $nodePath = (Get-Command node -ErrorAction SilentlyContinue).Path
        if (-not $nodePath) { return $false }
        $version = & node --version 2>$null
        if ($version -match "^v(\d+)") {
            $major = [int]$Matches[1]
            if ($major -ge 16) { return $true }
            Write-Step "?" ((T 'node_old') -f $version) $C_YELLOW
            return $false
        }
        return $false
    } catch {
        return $false
    }
}

function Test-PortConflict {
    param([int[]]$Ports)
    $conflicts = @()
    $pidsMap = Get-PortPIDs -Ports $Ports
    foreach ($port in $pidsMap.Keys) {
        foreach ($pidVal in $pidsMap[$port]) {
            try {
                $proc = Get-Process -Id $pidVal -ErrorAction SilentlyContinue
                $name = if ($proc) { $proc.ProcessName } else { "unknown" }
                $cmdLine = ""
                try {
                    $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId=$pidVal" -ErrorAction SilentlyContinue
                    $cmdLine = $wmi.CommandLine
                } catch { }
                if ($cmdLine -match "desk[-_]?hub|vite|tsx watch") { continue }
                $conflicts += @{ Port = $port; PID = $pidVal; Name = $name }
            } catch { }
        }
    }
    return $conflicts
}

# ---- UI Functions ----
function Write-AsciiQR {
    param([string]$Text)
    Write-Host ""
    Write-Box -Lines @(
        "",
        "  $(T 'qr_manual')",
        "",
        "  $Text",
        ""
    ) -BorderColor $C_CYAN
    Write-Host ""
}

function Open-Browser {
    param([string]$Url)
    try {
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "start", $Url -WindowStyle Hidden
        Write-Step ">" (T 'browser_opened') $C_GREEN
    } catch {
        Write-Step "!" (T 'browser_failed') $C_YELLOW
    }
}

# ---- Core Operations ----

function Invoke-StopDeskHub {
    Write-Host ""
    Write-Step "#" (T 'stopping') $C_ORANGE

    $pidsMap = Get-PortPIDs -Ports @($FRONTEND_PORT, $BACKEND_PORT)
    $killed = 0
    foreach ($port in $pidsMap.Keys) {
        foreach ($pidVal in $pidsMap[$port]) {
            try {
                $procName = (Get-Process -Id $pidVal -ErrorAction SilentlyContinue).ProcessName
                Write-Detail ((T 'killing') -f $procName, $pidVal, $port) $C_GRAY
                Stop-Process -Id $pidVal -Force -ErrorAction SilentlyContinue
                $killed++
            } catch { }
        }
    }

    try {
        $nodeProcs = @(Get-Process -Name node -ErrorAction SilentlyContinue)
        foreach ($np in $nodeProcs) {
            $cmdLine = $null
            try {
                $wmi = Get-WmiObject -Class Win32_Process -Filter "ProcessId=$($np.Id)" -ErrorAction SilentlyContinue
                $cmdLine = $wmi.CommandLine
            } catch { }
            if ($cmdLine -match "desk[-_]?hub|vite|tsx watch") {
                Write-Detail ((T 'cleaning_node') -f $np.Id) $C_GRAY
                Stop-Process -Id $np.Id -Force -ErrorAction SilentlyContinue
                $killed++
            }
        }
    } catch { }

    Start-Sleep -Seconds 2

    $frontStill = Test-PortOpen -Port $FRONTEND_PORT
    $backStill  = Test-PortOpen -Port $BACKEND_PORT

    if ($frontStill -or $backStill) {
        Write-Step "!" (T 'force_killing') $C_YELLOW
        try {
            Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
            Start-Sleep -Seconds 2
        } catch { }
        $frontStill2 = Test-PortOpen -Port $FRONTEND_PORT
        $backStill2  = Test-PortOpen -Port $BACKEND_PORT
        if ($frontStill2 -or $backStill2) {
            Write-Step "X" (T 'port_still') $C_RED
            Write-Detail "netstat -ano | findstr `":$FRONTEND_PORT|$BACKEND_PORT`"" $C_GRAY
        } else {
            Write-Step "+" (T 'force_stopped') $C_GREEN
        }
    } else {
        Write-Step "+" ((T 'stopped') -f $killed) $C_GREEN
    }
    Write-Host ""
    Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
    $null = Read-Host
}

function Invoke-StartDeskHub {
    Write-Host ""
    Write-Step "#" (T 'starting') $C_GREEN
    Write-Host ""

    # Pre-check 1: Node.js
    if (-not (Test-NodeAvailable)) {
        Write-Step "X" (T 'node_missing') $C_RED
        Write-Detail (T 'node_download') $C_GRAY
        Write-Host ""
        Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
        $null = Read-Host
        return $false
    }
    Write-Step "+" (T 'node_ok') $C_GREEN

    # Pre-check 2: Port conflicts
    $conflicts = Test-PortConflict -Ports @($FRONTEND_PORT, $BACKEND_PORT)
    if ($conflicts.Count -gt 0) {
        Write-Host ""
        Write-Step "!" (T 'port_conflict') $C_YELLOW
        foreach ($c in $conflicts) {
            Write-Detail ((T 'port_occupied') -f $c.Port, $c.Name, $c.PID) $C_YELLOW
        }
        Write-Host ""
        Write-MenuSep $C_ORANGE
        Write-MenuItem "K" (T 'port_kill') $C_ORANGE 40
        Write-MenuItem "A" (T 'port_abort') $C_ORANGE 40
        Write-Host "  $BL$($HZ * 40)$BR" -ForegroundColor $C_ORANGE
        Write-Host ""
        $conflictChoice = Read-Host "  $(T 'port_choice')"
        if ($conflictChoice -eq "K" -or $conflictChoice -eq "k") {
            foreach ($c in $conflicts) {
                try {
                    Stop-Process -Id $c.PID -Force -ErrorAction SilentlyContinue
                    Write-Detail ((T 'port_killed') -f $c.PID) $C_GRAY
                } catch { }
            }
            Start-Sleep -Seconds 2
        } else {
            Write-Step "X" (T 'port_cancelled') $C_RED
            Write-Host ""
            Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
            $null = Read-Host
            return $false
        }
    }

    # Pre-check 3: Dependencies
    $rootModules = Join-Path $SCRIPT_PATH "node_modules"
    $clientModules = Join-Path $SCRIPT_PATH "client\node_modules"
    $serverModules = Join-Path $SCRIPT_PATH "server\node_modules"
    $hasVite = (Test-Path (Join-Path $rootModules "vite")) -or (Test-Path (Join-Path $clientModules "vite"))
    $hasExpress = (Test-Path (Join-Path $rootModules "express")) -or (Test-Path (Join-Path $serverModules "express"))
    if (-not ($hasVite -and $hasExpress)) {
        Write-Step "~" (T 'dep_installing') $C_YELLOW
        Write-Detail (T 'dep_first_time') $C_GRAY
        Write-Host ""
        try {
            Set-Location $SCRIPT_PATH
            npm install 2>&1 | Select-Object -Last 5
            Write-Host ""
            Write-Step "+" (T 'dep_installed') $C_GREEN
        } catch {
            Write-Step "X" ((T 'dep_failed') -f $_) $C_RED
            Write-Host ""
            Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
            $null = Read-Host
            return $false
        }
    } else {
        Write-Step "+" (T 'dep_ok') $C_GREEN
    }

    Write-Host ""

    $timestamp = Get-Timestamp
    $frontendLog = Join-Path $LOG_DIR "frontend-$timestamp.log"
    $backendLog  = Join-Path $LOG_DIR "backend-$timestamp.log"

    # Start backend
    try {
        Write-Step ">" ((T 'starting_backend') -f $BACKEND_PORT) $C_ORANGE
        $backendArgs = "/c", "cd /d `"$SCRIPT_PATH`" && npm run dev:server > `"$backendLog`" 2>&1"
        $null = Start-Process -FilePath "cmd.exe" -ArgumentList $backendArgs -WindowStyle Hidden -PassThru
        Write-Detail ((T 'log_file') -f $backendLog) $C_GRAY
    } catch {
        Write-Step "X" ((T 'backend_failed') -f $_) $C_RED
        Write-Host ""
        Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
        $null = Read-Host
        return $false
    }

    Start-Sleep -Seconds 3

    # Start frontend
    try {
        Write-Step ">" ((T 'starting_frontend') -f $FRONTEND_PORT) $C_GREEN
        $frontendArgs = "/c", "cd /d `"$SCRIPT_PATH`" && npm run dev:client > `"$frontendLog`" 2>&1"
        $null = Start-Process -FilePath "cmd.exe" -ArgumentList $frontendArgs -WindowStyle Hidden -PassThru
        Write-Detail ((T 'log_file') -f $frontendLog) $C_GRAY
    } catch {
        Write-Step "X" ((T 'frontend_failed') -f $_) $C_RED
        Write-Host ""
        Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
        $null = Read-Host
        return $false
    }

    # Wait for ports
    Write-Host ""
    Write-Step "~" (T 'waiting') $C_YELLOW
    $maxWait = 60
    $waited = 0
    $feReady = $false
    $beReady = $false
    while ($waited -lt $maxWait -and -not ($feReady -and $beReady)) {
        Start-Sleep -Seconds 1
        $waited++
        if (-not $feReady -and (Test-PortOpen -Port $FRONTEND_PORT)) { $feReady = $true }
        if (-not $beReady -and (Test-PortOpen -Port $BACKEND_PORT)) { $beReady = $true }
        $feIcon = if ($feReady) { "+" } else { "." }
        $beIcon = if ($beReady) { "+" } else { "." }
        $feColor = if ($feReady) { $C_GREEN } else { $C_GRAY }
        $beColor = if ($beReady) { $C_ORANGE } else { $C_GRAY }
        Write-Host "    $("{0:D2}" -f $waited)s " -NoNewline -ForegroundColor $C_GRAY
        Write-Host "[$feIcon]" -NoNewline -ForegroundColor $feColor
        Write-Host " $(T 'frontend_label')  " -NoNewline -ForegroundColor $C_GRAY
        Write-Host "[$beIcon]" -NoNewline -ForegroundColor $beColor
        Write-Host " $(T 'backend_label')" -ForegroundColor $C_GRAY
    }
    Write-Host ""

    if ($feReady -and $beReady) {
        Show-AccessInfo
        return $true
    } else {
        Write-Step "X" (T 'startup_timeout') $C_RED
        Write-Detail ((T 'check_logs') -f $LOG_DIR) $C_GRAY
        Write-Host ""
        Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
        $null = Read-Host
        return $false
    }
}

function Invoke-RestartDeskHub {
    Invoke-StopDeskHub
    Invoke-StartDeskHub | Out-Null
}

function Show-AccessInfo {
    $localIP    = Get-LocalIP
    $localUrl   = "http://localhost:$FRONTEND_PORT/"
    $lanUrl     = "http://$localIP`:$FRONTEND_PORT/"
    $backendUrl = "http://$localIP`:$BACKEND_PORT/api/"

    Write-Banner

    Write-Box -Lines @(
        "",
        "  $(T 'running_title')",
        "",
        "  $(T 'local_access')",
        "    $localUrl",
        "",
        "  $(T 'lan_access')",
        "    $lanUrl",
        "",
        "  API : $backendUrl",
        "  WS  : ws://$localIP`:$BACKEND_PORT/ws",
        "",
        "  $(T 'tip_wifi')",
        ""
    ) -BorderColor $C_GREEN

    Write-Host ""

    # Try generating QR code via online API
    $qrGenerated = $false
    try {
        $encoded = [System.Net.WebUtility]::UrlEncode($lanUrl)
        $fullUrl = $QR_API + $encoded
        $qrPath  = Join-Path $LOG_DIR ("qr-" + (Get-Timestamp) + ".png")

        Write-Step "~" (T 'generating_qr') $C_CYAN
        $web = New-Object System.Net.WebClient
        $web.DownloadFile($fullUrl, $qrPath)
        Write-Step "+" ((T 'qr_saved') -f $qrPath) $C_GREEN
        Start-Process $qrPath
        $qrGenerated = $true
        Write-Host ""
    } catch {
        Write-Step "!" (T 'qr_failed') $C_YELLOW
        Write-Host ""
    }

    if (-not $qrGenerated) {
        Write-AsciiQR -Text $lanUrl
    }

    Open-Browser -Url $localUrl

    Write-Host ""
    Write-Sep
    Write-Host "  $VT $(T 'service_running')" -ForegroundColor $C_GRAY
    Write-Host "  $VT $(T 'rerun_hint')" -ForegroundColor $C_GRAY
    Write-Sep
    Write-Host ""
    Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
    $null = Read-Host
}

function Show-Status {
    $fe = Test-PortOpen -Port $FRONTEND_PORT
    $be = Test-PortOpen -Port $BACKEND_PORT
    $ip = Get-LocalIP
    $pidsMap = Get-PortPIDs -Ports @($FRONTEND_PORT, $BACKEND_PORT)

    Write-Banner

    $feIcon = if ($fe) { "+" } else { "-" }
    $beIcon = if ($be) { "+" } else { "-" }
    $feText = if ($fe) { T 'status_running' } else { T 'status_stopped' }
    $beText = if ($be) { T 'status_running' } else { T 'status_stopped' }
    $feColor = if ($fe) { $C_GREEN } else { $C_GRAY }
    $beColor = if ($be) { $C_ORANGE } else { $C_GRAY }

    $tblW = 42
    Write-Host "  $LT$($HZ * $tblW)$RT" -ForegroundColor $C_GREEN

    $titleText = "  $(T 'status_title')"
    $titleDW = Get-DisplayWidth $titleText
    $titlePad = " " * [Math]::Max(0, $tblW - $titleDW)
    Write-Host "  $VT$titleText$titlePad$VT" -ForegroundColor $C_GREEN

    Write-Host "  $LT$($HZ * $tblW)$RT" -ForegroundColor $C_GREEN

    # Frontend row
    $feRow = " [$feIcon] $(T 'frontend_label')  Port $FRONTEND_PORT  $feText"
    $feRowDW = Get-DisplayWidth $feRow
    $fePad = " " * [Math]::Max(0, $tblW - $feRowDW)
    Write-Host "  $VT " -NoNewline -ForegroundColor $C_GREEN
    Write-Host "[$feIcon]" -NoNewline -ForegroundColor $feColor
    Write-Host " $(T 'frontend_label')  Port $FRONTEND_PORT  $feText" -NoNewline -ForegroundColor $feColor
    Write-Host "$fePad$VT" -ForegroundColor $C_GREEN

    # Backend row
    $beRow = " [$beIcon] $(T 'backend_label')  Port $BACKEND_PORT   $beText"
    $beRowDW = Get-DisplayWidth $beRow
    $bePad = " " * [Math]::Max(0, $tblW - $beRowDW)
    Write-Host "  $VT " -NoNewline -ForegroundColor $C_GREEN
    Write-Host "[$beIcon]" -NoNewline -ForegroundColor $beColor
    Write-Host " $(T 'backend_label')  Port $BACKEND_PORT   $beText" -NoNewline -ForegroundColor $beColor
    Write-Host "$bePad$VT" -ForegroundColor $C_GREEN

    foreach ($p in $pidsMap.Keys) {
        foreach ($pidVal in $pidsMap[$p]) {
            try {
                $pn = (Get-Process -Id $pidVal -ErrorAction SilentlyContinue).ProcessName
                $pidRow = "   $VT Port $p : PID $pidVal ($pn)"
                $pidDW = Get-DisplayWidth $pidRow
                $pidPad = " " * [Math]::Max(0, $tblW - $pidDW)
                Write-Host "  $VT " -NoNewline -ForegroundColor $C_GREEN
                Write-Host "$pidRow" -NoNewline -ForegroundColor $C_GRAY
                Write-Host "$pidPad$VT" -ForegroundColor $C_GREEN
            } catch { }
        }
    }

    Write-Host "  $LT$($HZ * $tblW)$RT" -ForegroundColor $C_GREEN

    # IP row
    $ipRow = " IP  $ip"
    $ipDW = Get-DisplayWidth $ipRow
    $ipPad = " " * [Math]::Max(0, $tblW - $ipDW)
    Write-Host "  $VT " -NoNewline -ForegroundColor $C_GREEN
    Write-Host "IP" -NoNewline -ForegroundColor $C_CYAN
    Write-Host "  $ip" -NoNewline -ForegroundColor $C_WHITE
    Write-Host "$ipPad$VT" -ForegroundColor $C_GREEN

    # LAN row
    $lanText = "http://$ip`:$FRONTEND_PORT/"
    $lanRow = " LAN $lanText"
    $lanDW = Get-DisplayWidth $lanRow
    $lanPad = " " * [Math]::Max(0, $tblW - $lanDW)
    Write-Host "  $VT " -NoNewline -ForegroundColor $C_GREEN
    Write-Host "LAN" -NoNewline -ForegroundColor $C_CYAN
    Write-Host " $lanText" -NoNewline -ForegroundColor $C_WHITE
    Write-Host "$lanPad$VT" -ForegroundColor $C_GREEN

    Write-Host "  $BL$($HZ * $tblW)$BR" -ForegroundColor $C_GREEN
    Write-Host ""

    return @{
        Frontend = $fe
        Backend  = $be
        LANIP    = $ip
    }
}

function Invoke-CleanLogs {
    Write-Host ""
    Write-Step "#" (T 'log_management') $C_CYAN
    Write-Host ""

    if (-not (Test-Path $LOG_DIR)) {
        Write-Step "!" (T 'log_dir_missing') $C_YELLOW
        Write-Host ""
        Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
        $null = Read-Host
        return
    }

    # Gather log files
    $logFiles = @(Get-ChildItem -Path $LOG_DIR -Filter "*.log" -ErrorAction SilentlyContinue)
    $qrFiles  = @(Get-ChildItem -Path $LOG_DIR -Filter "qr-*.png" -ErrorAction SilentlyContinue)
    $allFiles = @($logFiles) + @($qrFiles)
    $totalSize = 0
    foreach ($f in $allFiles) { $totalSize += $f.Length }
    $totalStr = Format-Size $totalSize

    # Show summary
    $tblW = 42
    Write-Host "  $LT$($HZ * $tblW)$RT" -ForegroundColor $C_CYAN

    $dirLine = "  $((T 'log_dir_label') -f $LOG_DIR)"
    $dirDW = Get-DisplayWidth $dirLine
    $dirPad = " " * [Math]::Max(0, $tblW - $dirDW)
    Write-Host "  $VT$dirLine$dirPad$VT" -ForegroundColor $C_CYAN

    $lfLine = "  $((T 'log_files_label') -f $logFiles.Count)"
    $lfDW = Get-DisplayWidth $lfLine
    $lfPad = " " * [Math]::Max(0, $tblW - $lfDW)
    Write-Host "  $VT$lfLine$lfPad$VT" -ForegroundColor $C_CYAN

    $qrLine = "  $((T 'qr_files_label') -f $qrFiles.Count)"
    $qrDW = Get-DisplayWidth $qrLine
    $qrPad = " " * [Math]::Max(0, $tblW - $qrDW)
    Write-Host "  $VT$qrLine$qrPad$VT" -ForegroundColor $C_CYAN

    $szLine = "  $((T 'total_size_label') -f $totalStr)"
    $szDW = Get-DisplayWidth $szLine
    $szPad = " " * [Math]::Max(0, $tblW - $szDW)
    Write-Host "  $VT$szLine$szPad$VT" -ForegroundColor $C_CYAN

    Write-Host "  $BL$($HZ * $tblW)$BR" -ForegroundColor $C_CYAN
    Write-Host ""

    if ($allFiles.Count -eq 0) {
        Write-Step "+" (T 'no_files') $C_GREEN
        Write-Host ""
        Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
        $null = Read-Host
        return
    }

    # List files with age
    Write-Host "  $(T 'file_list')" -ForegroundColor $C_WHITE
    Write-Host ""
    $cutoff = (Get-Date).AddDays(-$MAX_LOG_AGE_DAYS)
    $oldCount = 0
    $oldSize = 0
    foreach ($f in $allFiles | Sort-Object LastWriteTime -Descending) {
        $age = [Math]::Floor(((Get-Date) - $f.LastWriteTime).TotalDays)
        $sizeKB = [Math]::Round($f.Length / 1KB, 1)
        $isOld = $f.LastWriteTime -lt $cutoff
        if ($isOld) { $oldCount++; $oldSize += $f.Length }
        $ageColor = if ($isOld) { $C_YELLOW } else { $C_GRAY }
        $icon = if ($isOld) { "!" } else { " " }
        Write-Host "    [$icon] $($f.Name)" -NoNewline -ForegroundColor $ageColor
        Write-Host "  ${age}$(T 'days_ago')  ${sizeKB}KB" -ForegroundColor $C_GRAY
    }
    Write-Host ""

    $oldStr = Format-Size $oldSize

    # Options
    Write-Host "  $LT$($HZ * $tblW)$RT" -ForegroundColor $C_CYAN
    if ($oldCount -gt 0) {
        $expLine = "  [1]  $((T 'clean_expired') -f $oldCount, $oldStr)"
        $expDW = Get-DisplayWidth $expLine
        $expPad = " " * [Math]::Max(0, $tblW - $expDW)
        Write-Host "  $VT$expLine$expPad$VT" -ForegroundColor $C_CYAN
    } else {
        $expLine = "  [1]  $(T 'clean_expired_none')"
        $expDW = Get-DisplayWidth $expLine
        $expPad = " " * [Math]::Max(0, $tblW - $expDW)
        Write-Host "  $VT$expLine$expPad$VT" -ForegroundColor $C_GRAY
    }
    $allLine = "  [2]  $((T 'clean_all') -f $allFiles.Count, $totalStr)"
    $allDW = Get-DisplayWidth $allLine
    $allPad = " " * [Math]::Max(0, $tblW - $allDW)
    Write-Host "  $VT$allLine$allPad$VT" -ForegroundColor $C_ORANGE
    $backLine = "  [0]  $(T 'back_menu')"
    $backDW = Get-DisplayWidth $backLine
    $backPad = " " * [Math]::Max(0, $tblW - $backDW)
    Write-Host "  $VT$backLine$backPad$VT" -ForegroundColor $C_GRAY
    Write-Host "  $BL$($HZ * $tblW)$BR" -ForegroundColor $C_CYAN
    Write-Host ""
    $cleanChoice = Read-Host "  $(T 'log_choice')"

    switch ($cleanChoice) {
        "1" {
            if ($oldCount -eq 0) {
                Write-Step "+" (T 'no_expired') $C_GREEN
            } else {
                $removed = 0
                foreach ($f in $allFiles) {
                    if ($f.LastWriteTime -lt $cutoff) {
                        Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
                        $removed++
                    }
                }
                Write-Step "+" ((T 'cleaned_expired') -f $removed, $oldStr) $C_GREEN
            }
        }
        "2" {
            $removed = 0
            foreach ($f in $allFiles) {
                Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
                $removed++
            }
            Write-Step "+" ((T 'cleaned_all') -f $removed, $totalStr) $C_GREEN
        }
        default {
            Write-Step "-" (T 'cancelled') $C_GRAY
        }
    }

    Write-Host ""
    Write-Host "  $($HINT) $(T 'press_enter')" -ForegroundColor $C_GRAY
    $null = Read-Host
}

function Show-Menu {
    param([hashtable]$Status)

    $running = $Status.Frontend -or $Status.Backend
    if ($running) {
        Write-Host "  DeskHub " -NoNewline -ForegroundColor $C_GREEN
        Write-Host (T 'menu_running') -NoNewline -ForegroundColor $C_WHITE
        Write-Host (T 'menu_choose') -ForegroundColor $C_WHITE
        Write-Host ""
        Write-MenuSep $C_GREEN
        Write-MenuItem "R" (T 'menu_restart') $C_GREEN
        Write-MenuItem "S" (T 'menu_stop') $C_GREEN
        Write-MenuSep $C_ORANGE
        Write-MenuItem "I" (T 'menu_info') $C_ORANGE
        Write-MenuItem "O" (T 'menu_open') $C_ORANGE
        Write-MenuSep $C_CYAN
        Write-MenuItem "L" (T 'menu_logs') $C_CYAN
        Write-MenuSep $C_GRAY
        Write-MenuItem "E" (T 'menu_lang') $C_YELLOW
        Write-MenuItem "C" (T 'menu_continue') $C_GRAY
        Write-MenuItem "Q" (T 'menu_quit') $C_GRAY
        Write-Host "  $BL$($HZ * 36)$BR" -ForegroundColor $C_GRAY
        Write-Host ""
        $choice = Read-Host "  $(T 'menu_running_choice')"
        switch -Wildcard ($choice) {
            "R*" { Invoke-RestartDeskHub; return "loop" }
            "S*" { Invoke-StopDeskHub; return "loop" }
            "I*" { Show-AccessInfo; return "loop" }
            "O*" { Open-Browser -Url "http://localhost:$FRONTEND_PORT/"; return "loop" }
            "L*" { Invoke-CleanLogs; return "loop" }
            "E*" { Set-Language; return "loop" }
            "C*" { Write-Step "+" (T 'service_continue') $C_GREEN; return "loop" }
            "Q*" { return "exit" }
            default { Write-Step "X" (T 'invalid_choice') $C_RED; return "loop" }
        }
    } else {
        Write-Host "  DeskHub " -NoNewline -ForegroundColor $C_ORANGE
        Write-Host (T 'menu_not_running') -NoNewline -ForegroundColor $C_WHITE
        Write-Host (T 'menu_choose') -ForegroundColor $C_WHITE
        Write-Host ""
        Write-MenuSep $C_GREEN
        Write-MenuItem "1" (T 'menu_start') $C_GREEN
        Write-MenuItem "2" (T 'menu_info') $C_ORANGE
        Write-MenuSep $C_CYAN
        Write-MenuItem "3" (T 'menu_logs') $C_CYAN
        Write-MenuSep $C_GRAY
        Write-MenuItem "E" (T 'menu_lang') $C_YELLOW
        Write-MenuItem "0" (T 'menu_quit') $C_GRAY
        Write-Host "  $BL$($HZ * 36)$BR" -ForegroundColor $C_GRAY
        Write-Host ""
        $choice = Read-Host "  $(T 'menu_stopped_choice')"
        switch ($choice) {
            "1" { Invoke-StartDeskHub | Out-Null; return "loop" }
            "2" { Show-AccessInfo; return "loop" }
            "3" { Invoke-CleanLogs; return "loop" }
            "E" { Set-Language; return "loop" }
            "e" { Set-Language; return "loop" }
            "0" { return "exit" }
            default { Write-Step "X" (T 'invalid_choice') $C_RED; return "loop" }
        }
    }
}

# ---- Check Expired Logs at Startup ----
if (Test-Path $LOG_DIR) {
    $cutoff = (Get-Date).AddDays(-$MAX_LOG_AGE_DAYS)
    $oldLogs = @(Get-ChildItem -Path $LOG_DIR -Filter "*.log" -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $cutoff })
    $oldQrs = @(Get-ChildItem -Path $LOG_DIR -Filter "qr-*.png" -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $cutoff })
    $oldAll = @($oldLogs) + @($oldQrs)
    if ($oldAll.Count -gt 0) {
        $oldSize = 0
        foreach ($f in $oldAll) { $oldSize += $f.Length }
        $oldStr = Format-Size $oldSize
        Write-Host ""
        Write-Host "  [!] " -NoNewline -ForegroundColor $C_YELLOW
        Write-Host ((T 'expired_detected') -f $oldAll.Count, $MAX_LOG_AGE_DAYS, $oldStr) -ForegroundColor $C_YELLOW
        Write-Host "      $(T 'expired_prompt')" -NoNewline -ForegroundColor $C_WHITE
        $autoClean = Read-Host
        if ($autoClean -ne "n" -and $autoClean -ne "N") {
            $removed = 0
            foreach ($f in $oldAll) {
                Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
                $removed++
            }
            Write-Step "+" ((T 'expired_cleaned') -f $removed) $C_GREEN
        } else {
            Write-Step "-" (T 'expired_skipped') $C_GRAY
        }
        Write-Host ""
    }
}

# ========== Main Loop ==========
$script:running = $true
while ($script:running) {
    $status = Show-Status
    $result = Show-Menu -Status $status
    if ($result -eq "exit") {
        $script:running = $false
    }
}

Write-Host ""
Write-Step "#" (T 'goodbye') $C_GREEN
Write-Host "  $($HINT) $(T 'close_window')" -ForegroundColor $C_GRAY
$null = Read-Host
