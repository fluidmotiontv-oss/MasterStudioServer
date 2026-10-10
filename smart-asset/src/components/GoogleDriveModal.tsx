import React, { useState, useEffect } from 'react';
import { GoogleDriveFile, SmartAsset } from '../types';
import { HardDrive, Upload, Download, RefreshCw, X, Check, FileImage, ShieldCheck } from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAsset?: SmartAsset;
  onImportFromDrive: (fileUrl: string, fileName: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  activeAsset,
  onImportFromDrive,
}) => {
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');

  useEffect(() => {
    // Check if token exists in localStorage or prompt
    const savedToken = localStorage.getItem('gdrive_access_token') || '';
    setAccessToken(savedToken);
  }, []);

  if (!isOpen) return null;

  const fetchDriveFiles = async () => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    try {
      const res = await fetch('/api/drive/files', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDriveFiles(data.files || []);
      }
    } catch {
      // Token expired or invalid
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSaveToken = (token: string) => {
    setAccessToken(token);
    localStorage.setItem('gdrive_access_token', token);
  };

  const handleExportToDrive = async () => {
    if (!activeAsset || !accessToken) return;
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fileName: `${activeAsset.name.toLowerCase().replace(/\s+/g, '_')}_smartasset.json`,
          fileContentBase64: btoa(JSON.stringify(activeAsset, null, 2)),
          mimeType: 'application/json',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch {
      // Upload error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121214] border border-zinc-800/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-zinc-100 relative">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Drive Integration</h2>
              <p className="text-xs text-zinc-400">Import & Export Smart PNG Assets to Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OAuth Access Token Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block flex items-center justify-between">
            <span>OAuth Access Token</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal">
              <ShieldCheck className="w-3 h-3" /> Scope: drive.file
            </span>
          </label>
          <input
            type="password"
            placeholder="Paste Google Drive OAuth Bearer token or connect..."
            value={accessToken}
            onChange={(e) => handleSaveToken(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Export Current Asset Section */}
        {activeAsset && (
          <div className="p-4 rounded-2xl bg-[#0a0a0b] border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Save Active Asset to Google Drive</span>
              <span className="text-zinc-400 truncate max-w-[160px] font-mono">{activeAsset.name}</span>
            </div>
            <button
              onClick={handleExportToDrive}
              disabled={isUploading || !accessToken}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading to Google Drive...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Successfully Saved to Google Drive!</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Export Smart Asset JSON to Drive</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Fetch Drive Files */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Your Drive PNG Files</span>
            <button
              onClick={fetchDriveFiles}
              disabled={isLoadingFiles || !accessToken}
              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>Fetch PNGs</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {driveFiles.length > 0 ? (
              driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-2xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-between text-xs hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileImage className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-zinc-200 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (file.thumbnailLink) {
                        onImportFromDrive(file.thumbnailLink, file.name);
                        onClose();
                      }
                    }}
                    className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shrink-0 shadow-sm"
                  >
                    Import
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">
                {accessToken
                  ? 'Click "Fetch PNGs" to load images from Google Drive'
                  : 'Enter your Google Drive access token above to view files'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
