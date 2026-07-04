import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores';
import { musicApi } from '../services/api';
import { useTranslation } from '../locales/useTranslation';
import { t } from '../locales';
import PageHeader from '../components/PageHeader';
import { Music, RefreshCw, FolderOpen, Play } from 'lucide-react';

export default function MusicPage() {
  const { musicSearchResults, musicIndexStatus, setMusicSearchResults, setMusicIndexStatus, addToast } = useAppStore();
  const { msg } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    musicApi.getIndexStatus().then(setMusicIndexStatus).catch(() => {});
  }, []);

  useEffect(() => {
    if (!musicIndexStatus.ready) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(async () => {
      if (!keyword.trim()) {
        setMusicSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const results = await musicApi.search(keyword);
        setMusicSearchResults(results);
      } catch {
        addToast(msg.music.searchFail, 'error');
      } finally {
        setSearching(false);
      }
    }, 150);

    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [keyword, musicIndexStatus.ready]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await musicApi.scan();
      setMusicIndexStatus({ ready: true, count: result.count, scanning: false });
      addToast(t(msg.music.scanDone, { count: result.count }), 'success');
    } catch {
      addToast(msg.music.scanFail, 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleOpen = async (track: { name: string; path: string }) => {
    try {
      const result = await musicApi.open(track.path);
      addToast(result.success ? t(msg.music.opening, { name: track.name }) : t(msg.music.openFail, { error: result.error || '' }), result.success ? 'success' : 'error');
    } catch {
      addToast(msg.music.openFailShort, 'error');
    }
  };

  const fmtSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const extColor: Record<string, string> = {
    '.flac': 'text-accent',
    '.mp3': 'text-accent-orange',
    '.wav': 'text-content-tertiary',
    '.ape': 'text-accent',
    '.m4a': 'text-accent-orange',
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <PageHeader title={msg.music.title} subtitle={msg.music.subtitle} />

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={musicIndexStatus.ready ? msg.music.searchPlaceholder : msg.music.scanFirst}
          disabled={!musicIndexStatus.ready}
          className="input flex-1"
        />
        <button
          onClick={handleScan}
          disabled={scanning}
          className="btn-accent shrink-0"
        >
          <RefreshCw size={16} className={scanning ? 'animate-spin' : ''} />
          {scanning ? msg.music.scanning : musicIndexStatus.ready ? t(msg.music.indexed, { count: musicIndexStatus.count }) : msg.music.scanLibrary}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {musicSearchResults.length > 0 ? musicSearchResults.map((track, i) => (
          <div
            key={track.path}
            onClick={() => handleOpen(track)}
            className="flex items-center gap-4 px-4 py-3 rounded-[6px] cursor-pointer transition-all duration-120 hover:bg-[var(--surface-2)] border border-transparent hover:border-[var(--border)] animate-fade-in"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <div className="w-10 h-10 rounded-[6px] surface-3 flex items-center justify-center shrink-0">
              <Music size={16} className={extColor[track.ext] || 'text-content-tertiary'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-content-primary truncate font-medium">{track.name}</div>
              <div className="text-xs text-content-tertiary truncate flex items-center gap-2">
                <FolderOpen size={10} />
                <span>{track.dir}</span>
                <span className="text-content-tertiary/50">|</span>
                <span>{fmtSize(track.size)}</span>
                <span className="uppercase text-[10px] font-mono">{track.ext}</span>
              </div>
            </div>
            <Play size={14} className="text-accent-orange shrink-0" />
          </div>
        )) : keyword.trim() && musicIndexStatus.ready && !searching ? (
          <div className="text-center py-24 text-content-tertiary text-sm">{msg.music.noResults}</div>
        ) : !musicIndexStatus.ready ? (
          <div className="text-center py-24 text-content-tertiary text-sm">
            <Music size={48} className="mx-auto mb-4 text-content-tertiary/30" />
            <p className="mb-2">{msg.music.notScanned}</p>
            <p className="text-xs text-content-tertiary/60">{msg.music.notScannedHint}</p>
          </div>
        ) : searching ? (
          <div className="text-center py-24 text-content-tertiary text-sm">{msg.music.searching}</div>
        ) : (
          <div className="text-center py-24 text-content-tertiary text-sm">{msg.music.typeToSearch}</div>
        )}
      </div>
    </div>
  );
}
