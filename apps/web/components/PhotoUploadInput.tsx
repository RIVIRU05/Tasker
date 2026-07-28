"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { isMock, uploadPhoto } from "@taskhub/data";

interface PhotoUploadInputProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  pathPrefix: string;
  multiple?: boolean;
  hint?: string;
}

export function PhotoUploadInput({ label, value, onChange, pathPrefix, multiple = false, hint }: PhotoUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (isMock()) {
          uploaded.push(URL.createObjectURL(file));
        } else {
          const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
          uploaded.push(await uploadPhoto(path, file));
        }
      }
      onChange(multiple ? [...value, ...uploaded] : uploaded);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <span className="block text-body-sm-strong text-ink mb-xs">{label}</span>
      <div className="flex flex-wrap gap-md">
        {value.map((url, i) => (
          <div key={url + i} className="relative w-24 h-24 rounded-md overflow-hidden bg-canvas-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove photo"
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink/70 text-on-dark flex items-center justify-center hover:bg-ink"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-md border-2 border-dashed border-ink/15 flex flex-col items-center justify-center gap-xs text-mute hover:border-ink/30 hover:text-body transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-caption">{uploading ? "Uploading…" : "Add photo"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {hint && <span className="block text-caption text-mute mt-xs">{hint}</span>}
    </div>
  );
}
