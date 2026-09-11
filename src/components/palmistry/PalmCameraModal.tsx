import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles, SwitchCamera, ArrowRight, Smartphone } from 'lucide-react';

interface PalmCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string, autoSubmit?: boolean) => void;
}

export const PalmCameraModal: React.FC<PalmCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check available video devices
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {
        setHasMultipleCameras(false);
      });
    }
  }, [isOpen]);

  // Start video stream
  useEffect(() => {
    if (!isOpen || capturedUrl) return;

    let isMounted = true;
    setIsInitializing(true);
    setCameraError(null);

    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or environment. Please use device camera upload below.');
      setIsInitializing(false);
      return;
    }

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setIsInitializing(false);
      } catch (err: any) {
        if (!isMounted) return;
        setIsInitializing(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera access was denied. Please allow camera permissions in your browser bar, or use the Native Device Camera button below.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. Please connect a webcam or use device photo upload.');
        } else {
          // Fallback to user facing camera if environment mode failed
          if (facingMode === 'environment') {
            try {
              const fallbackStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
              });
              if (!isMounted) {
                fallbackStream.getTracks().forEach((t) => t.stop());
                return;
              }
              streamRef.current = fallbackStream;
              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
                await videoRef.current.play().catch(() => {});
              }
              setIsInitializing(false);
              return;
            } catch (fallbackErr: any) {
              setCameraError(fallbackErr.message || 'Unable to open camera stream.');
            }
          } else {
            setCameraError(err.message || 'Unable to open camera stream.');
          }
        }
      }
    };

    startStream();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [isOpen, facingMode, capturedUrl]);

  // Clean up on modal close
  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCapturedUrl(null);
    setCapturedBlob(null);
    setCountdown(null);
    onClose();
  };

  // Switch between front & back camera
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Take photo from video stream
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Use actual dimensions from video or sensible default
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if using front/user camera for natural mirror reflection
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const preview = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedUrl(preview);

        // Stop video stream while reviewing snapshot
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Direct native mobile camera file capture handler
  const handleNativeDeviceCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setCapturedBlob(file);
      setCapturedUrl(preview);
    }
  };

  // Start 3-second countdown
  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          captureFrame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    setCapturedUrl(null);
    setCapturedBlob(null);
    setCountdown(null);
  };

  // Confirm photo and send to parent (optionally auto-submitting)
  const handleConfirm = (autoSubmit: boolean = false) => {
    if (!capturedBlob || !capturedUrl) return;

    const file = new File([capturedBlob], `palm-capture-${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    onCapture(file, capturedUrl, autoSubmit);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-cosmic-surface border border-cosmic-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-cosmic-border flex items-center justify-between bg-cosmic-card/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-cosmic-text">Palm Scanner & Live Camera</h3>
              <p className="text-[11px] text-cosmic-muted">Align your open palm inside the guide</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-cosmic-muted hover:text-cosmic-text hover:bg-cosmic-card transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-[360px] sm:min-h-[440px] overflow-hidden">
          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Error State */}
          {cameraError ? (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-300">Camera Access Issue</h4>
                <p className="text-xs text-cosmic-muted leading-relaxed">{cameraError}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  onClick={() => {
                    setCameraError(null);
                    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                  }}
                  className="px-4 py-2 rounded-xl bg-cosmic-card border border-cosmic-border text-xs font-semibold text-cosmic-text hover:bg-cosmic-card/80 transition-colors"
                >
                  Retry Camera
                </button>

                <label className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-glow-cyan transition-all">
                  <Smartphone className="w-4 h-4" />
                  <span>Use Device Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleNativeDeviceCapture}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : capturedUrl ? (
            /* Snapshot Review State */
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={capturedUrl}
                alt="Captured palm"
                className="max-h-[440px] w-full object-contain rounded-2xl border-2 border-cyan-400/40 shadow-2xl"
              />
              <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/40 flex items-center gap-1.5 text-xs text-emerald-400 font-bold shadow-lg">
                <Check className="w-3.5 h-3.5" /> Photo Captured — Ready to Submit
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 z-20">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs text-cosmic-text font-semibold">Opening camera stream...</span>
                </div>
              )}

              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full max-h-[460px] object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Palm Alignment Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="relative w-64 h-80 sm:w-72 sm:h-96 border-2 border-dashed border-cyan-400/60 rounded-[48px] flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-pulse">
                  {/* Subtle Corner Guides */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

                  {/* Palm Silhouette Icon */}
                  <svg
                    viewBox="0 0 100 120"
                    fill="none"
                    stroke="currentColor"
                    className="w-36 h-36 text-cyan-400/30"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M30 40 C30 25, 35 25, 35 40 L35 60" />
                    <path d="M40 30 C40 15, 45 15, 45 30 L45 60" />
                    <path d="M50 25 C50 10, 55 10, 55 25 L55 60" />
                    <path d="M60 32 C60 18, 65 18, 65 32 L65 60" />
                    <path d="M25 65 C18 55, 12 60, 20 72 L25 80" />
                    <path d="M25 80 C25 105, 75 105, 75 80 L70 60 C70 50, 25 50, 25 80 Z" />
                  </svg>

                  <span className="absolute bottom-4 bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold text-cyan-300 border border-cyan-500/30 shadow-md">
                    Fit Palm Inside Box
                  </span>
                </div>
              </div>

              {/* Countdown Display */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                  <div className="w-24 h-24 rounded-full bg-cyan-500/30 border-2 border-cyan-400 flex items-center justify-center text-4xl font-display font-black text-cyan-300 animate-ping">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Controls overlaid on video */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                {hasMultipleCameras && (
                  <button
                    onClick={toggleCamera}
                    className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-cosmic-border text-cosmic-text hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                    title="Switch Front/Back Camera"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        <div className="p-6 border-t border-cosmic-border bg-cosmic-card/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-cosmic-muted">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Ensure palm is under even lighting with fingers open</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {capturedUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-2xl border border-cosmic-border bg-cosmic-card text-xs font-bold text-cosmic-text hover:bg-cosmic-border transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  className="px-4 py-2.5 rounded-2xl border border-cosmic-border bg-cosmic-card text-xs font-bold text-cosmic-muted hover:text-cosmic-text transition-colors"
                >
                  Review Form
                </button>

                {/* Primary Submit Button: Instant Submit & Analyze */}
                <button
                  type="button"
                  onClick={() => handleConfirm(true)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-display font-extrabold uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2 animate-pulse"
                >
                  <span>Submit & Analyze</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Fallback Native Camera trigger */}
                <label className="px-3.5 py-2 rounded-2xl border border-cosmic-border bg-cosmic-card text-xs font-semibold text-cosmic-muted hover:text-cosmic-text transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Device Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleNativeDeviceCapture}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={startCountdown}
                  disabled={Boolean(cameraError) || isInitializing || countdown !== null}
                  className="px-4 py-2 rounded-2xl border border-cosmic-border bg-cosmic-card text-xs font-bold text-cosmic-text hover:border-cyan-400/40 transition-colors disabled:opacity-50"
                  title="Capture with 3-second timer"
                >
                  3s Timer
                </button>

                <button
                  type="button"
                  onClick={captureFrame}
                  disabled={Boolean(cameraError) || isInitializing || countdown !== null}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-display font-extrabold uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" /> Snap Photo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
