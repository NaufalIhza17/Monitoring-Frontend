import { useState, useRef } from "react";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (photoUrl: string) => void;
};

export default function PhotoUploadModal({ open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please select a photo");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess(res.data.url);
      setFile(null);
      setPreview(null);
    } catch {
      setError("Upload failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Upload Proof Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Upload a photo as proof that you are working.
          </p>

          <div
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center
              gap-3 cursor-pointer hover:border-primary transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-48 object-cover rounded-md"
              />
            ) : (
              <>
                <Upload className="text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground">
                  Click to upload photo
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP up to 5MB
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || loading}>
            {loading ? "Uploading..." : "Clock In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
