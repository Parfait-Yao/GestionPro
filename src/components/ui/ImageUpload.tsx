"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "produits" | "cartons" | "general";
  className?: string;
}

export function ImageUpload({ value, onChange, folder = "general", className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp, image/gif"
        capture="environment"
        className="hidden"
      />

      {value ? (
        // Aperçu de l'image
        <div className="relative group overflow-hidden rounded-xl border border-border bg-surface aspect-video max-w-sm flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-danger text-white rounded-full hover:bg-danger/90 transform scale-90 group-hover:scale-100 transition-all shadow-lg"
              title="Supprimer l'image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Zone d'upload
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center w-full max-w-sm aspect-video rounded-xl border-2 border-dashed border-border bg-surface hover:bg-border/50 transition-colors cursor-pointer group overflow-hidden",
            isUploading && "pointer-events-none opacity-80"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Envoi en cours...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-muted group-hover:text-primary transition-colors">
              <div className="p-3 bg-card rounded-full shadow-sm group-hover:shadow group-hover:scale-110 transition-all">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Cliquez pour ajouter une image</p>
                <p className="text-xs mt-1 opacity-70">JPG, PNG, WebP (Max 20MB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-danger font-medium mt-2 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
