import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { driveApi } from '../../services/api';
import { X, Upload, ZoomIn, ZoomOut, Check, AlertCircle, Loader2 } from 'lucide-react';

interface AvatarCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarCropperModal: React.FC<AvatarCropperModalProps> = ({ isOpen, onClose }) => {
  const { updateUser } = useAuth();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generateCroppedBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!imageRef.current) {
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(null);
        return;
      }

      const img = imageRef.current;
      const cropBoxSize = 240; // Diameter of square viewport

      ctx.save();
      // Draw centered with zoom and offset
      ctx.translate(size / 2, size / 2);
      ctx.translate(position.x * (size / cropBoxSize), position.y * (size / cropBoxSize));
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  }, [position, zoom]);

  const handleUploadAvatar = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const blob = await generateCroppedBlob();
      if (!blob) {
        setError('Failed to process cropped image canvas.');
        setIsSubmitting(false);
        return;
      }

      const res = await driveApi.uploadAvatar(blob);
      updateUser({
        avatarUrl: res.avatarUrl,
        driveAvatarId: res.driveFileId,
      });

      setSuccess('Profile picture successfully uploaded to Google Drive and saved.');
      setTimeout(() => {
        setSuccess(null);
        setImageSrc(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload avatar to Google Drive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl liquid-glass border border-white/20 p-6 sm:p-7 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-white/15 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Profile Avatar & Google Drive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crop your photo and save directly to Google Drive
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col items-center">
          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-white/40 transition hover:border-emerald-500/60 dark:border-white/10 dark:bg-white/[0.02] backdrop-blur-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to browse photo
              </p>
              <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, or WebP (Max 5MB)</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Crop Canvas Viewport */}
              <div
                className="relative h-60 w-60 overflow-hidden rounded-full border-4 border-emerald-500 bg-black cursor-grab active:cursor-grabbing shadow-[0_0_35px_rgba(16,185,129,0.35)] ring-4 ring-white/20"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                    maxWidth: 'none',
                  }}
                  className="select-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>

              {/* Zoom Controls */}
              <div className="mt-4 flex w-full items-center justify-center gap-3 px-6">
                <ZoomOut className="h-4 w-4 text-slate-400" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200/80 accent-emerald-600 dark:bg-charcoal-700"
                />
                <ZoomIn className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                >
                  Choose different image
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/15 dark:border-white/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            disabled={!imageSrc || isSubmitting}
            onClick={handleUploadAvatar}
            className="liquid-glass-btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Syncing to Drive...</span>
              </>
            ) : (
              <span>Save to Google Drive</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
