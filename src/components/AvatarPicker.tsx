"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  initialUrl?: string | null;
  initials: string;
  onChange: (file: File | null) => void;
};

/**
 * Circular avatar picker with live preview. Supports HEIC by converting to JPEG in-browser.
 * onChange fires with the (possibly-converted) File or null when removed.
 */
export default function AvatarPicker({ initialUrl, initials, onChange }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  const [converting, setConverting] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    let working: File = file;
    const isHeic = /\.heic$|\.heif$/i.test(file.name) || file.type === "image/heic" || file.type === "image/heif";

    if (isHeic) {
      setConverting(true);
      try {
        const heic2any = (await import("heic2any")).default;
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
        const out = Array.isArray(blob) ? blob[0] : blob;
        working = new File([out], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Couldn't read that HEIC (${msg}). Try a JPG/PNG.`);
        setConverting(false);
        return;
      }
      setConverting(false);
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(working);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    onChange(working);
  }

  function handleRemove() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  }

  return (
    <div className="flex items-center gap-5">
      <div
        className="w-24 h-24 rounded-full overflow-hidden grid place-items-center font-display text-3xl relative"
        style={{ background: "var(--bg-2)", color: "var(--accent-soft)", border: "1px solid var(--line)" }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
        {converting && (
          <div className="absolute inset-0 grid place-items-center text-xs" style={{ background: "rgba(0,0,0,0.45)", color: "var(--ink-0)" }}>
            …
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="btn btn-ghost text-sm cursor-pointer">
          {previewUrl ? "Change picture" : "Upload picture"}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif"
            className="hidden"
            onChange={handlePick}
            disabled={converting}
          />
        </label>
        {previewUrl && (
          <button type="button" onClick={handleRemove} className="btn-link text-xs" style={{ color: "#ff8585" }}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
