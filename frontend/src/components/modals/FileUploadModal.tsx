import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/api";
import { useApi } from "@/hooks/useApi";
import { useState, useCallback } from "react";
import { Upload, File, X, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string;
  renovationId?: string;
  onUploadSuccess?: (files: FileUpload[]) => void;
}

export function FileUploadModal({
  open,
  onOpenChange,
  propertyId,
  renovationId,
  onUploadSuccess,
}: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const { loading, post, error } = useApi<FileUpload>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      if (propertyId) formData.append("propertyId", propertyId);
      if (renovationId) formData.append("renovationId", renovationId);

      try {
        const result = await post("/upload", formData);
        if (result) {
          setUploadedFiles((prev) => [...prev, result as FileUpload]);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setSelectedFiles([]);
    if (onUploadSuccess && uploadedFiles.length > 0) {
      onUploadSuccess(uploadedFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("spreadsheet") || mimeType.includes("sheet")) return "📊";
    if (mimeType.includes("document") || mimeType.includes("word")) return "📝";
    return "📎";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload property photos, inspections, permits, or renovation documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-lg border-2 border-dashed transition-all p-8",
              dragActive
                ? "border-accent bg-accent/5"
                : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50"
            )}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-accent" />
              <p className="text-center font-semibold">
                Drag files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Supports images, PDFs, spreadsheets and documents up to 50MB
              </p>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-sm">Selected Files ({selectedFiles.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Uploaded Files ({uploadedFiles.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <File className="h-4 w-4 text-success shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {selectedFiles.length > 0 && (
              <Button
                className="btn-accent"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length} File
                    {selectedFiles.length > 1 ? "s" : ""}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
