
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (q: string) => void;
}

export default function SearchOverlay({ open, onClose, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-[#071b2d]/90 backdrop-blur-lg flex flex-col">
      <header className="flex items-center p-4">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10">
          <X className="w-6 h-6 text-[#00e0ff]" />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search spots, users or tags"
          className="flex-grow ml-4 py-2 px-4 bg-white/10 rounded-xl text-white placeholder-white/50 outline-none"
          onKeyDown={e => {
            if (e.key === "Enter") {
              onSubmit((e.target as HTMLInputElement).value);
              onClose();
            }
          }}
        />
      </header>
      {/* Optional autocomplete list */}
    </div>
  );
}
