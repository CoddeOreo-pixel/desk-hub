import { useEffect, useState } from 'react';
import { wsService } from './services/websocket';
import { useAppStore } from './stores';
import { appApi, webApi, commandApi, systemApi } from './services/api';
import { useTranslation } from './locales/useTranslation';
import Sidebar from './components/Sidebar';
import Drawer from './components/Drawer';
import AppsPage from './pages/AppsPage';
import MonitorPage from './pages/MonitorPage';
import MusicPage from './pages/MusicPage';
import WebPage from './pages/WebPage';
import CommandPage from './pages/CommandPage';
import Toast from './components/Toast';
import { Menu, Wifi, WifiOff } from 'lucide-react';

const MOBILE_BREAKPOINT = 1024;

function App() {
  const {
    activePage,
    setSystemInfo,
    setApps,
    setWebsites,
    setCommands,
    setWsConnected,
    addToast,
    wsConnected,
  } = useAppStore();
  const { msg } = useTranslation();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  // 主题：仅深色模式
  useEffect(() => {
    document.documentElement.classList.remove('theme-light');
  }, []);

  // 响应式检测
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 初始化 WebSocket 和数据
  useEffect(() => {
    wsService.connect();

    const unsubConnected = wsService.on('_connected' as any, () => {
      setWsConnected(true);
    });
    const unsubDisconnected = wsService.on('_disconnected' as any, () => {
      setWsConnected(false);
    });
    const unsubCmdOutput = wsService.on('command:output', (data) => {
      useAppStore.getState().appendCommandOutput(data.output + (data.error ? '\n' + data.error : ''));
    });

    const loadData = async () => {
      try {
        const [apps, websites, commands, sysInfo] = await Promise.all([
          appApi.getList(),
          webApi.getBookmarks(),
          commandApi.getList(),
          systemApi.getInfo(),
        ]);
        setApps(apps);
        setWebsites(websites);
        setCommands(commands.presets, commands.custom);
        setSystemInfo(sysInfo);
      } catch {
        addToast(msg.app.connectFail, 'error');
      }
    };

    loadData();

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubCmdOutput();
      wsService.disconnect();
    };
  }, []);

  const openDrawer = () => {
    (window as any).__deskDrawer?.open();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'apps': return <AppsPage />;
      case 'monitor': return <MonitorPage />;
      case 'music': return <MusicPage />;
      case 'web': return <WebPage />;
      case 'command': return <CommandPage />;
      default: return <AppsPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden grid-bg" style={{ background: 'var(--surface-0)' }}>
      {/* 桌面端：侧边栏 */}
      {!isMobile && <Sidebar />}

      {/* 移动端：顶部栏 */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 h-14 surface-1 grid-bg-dense flex items-center px-4 border-b border-[var(--border)]">
          <button onClick={openDrawer} className="btn-ghost !p-2 !rounded-lg">
            <Menu size={22} />
          </button>
          <span className="ml-3 font-display font-bold text-accent text-[15px]">DeskHub</span>
          <span className="ml-auto flex items-center gap-2">
            {wsConnected ? (
              <Wifi size={14} className="text-success" />
            ) : (
              <WifiOff size={14} className="text-danger" />
            )}
            <span className="text-xs text-content-tertiary font-mono capitalize">{activePage}</span>
          </span>
        </div>
      )}

      {/* 内容区 */}
      <main
        className={`flex-1 overflow-y-auto ${isMobile ? 'pt-14' : 'p-6 lg:p-8'}`}
      >
        {renderPage()}
      </main>

      <Toast />
      <Drawer />
    </div>
  );
}

export default App;
