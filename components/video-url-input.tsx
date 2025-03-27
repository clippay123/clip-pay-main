import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { updateSubmissionVideoUrl } from "@/app/actions/creator";

interface VideoUrlInputProps {
  submissionId: string;
  currentUrls?: string[];
  onUpdate?: (views: number) => void;
  videoViews?: number;
}

export function VideoUrlInput({
  submissionId,
  currentUrls = [],
  onUpdate,
  videoViews,
}: VideoUrlInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [videoUrls, setVideoUrls] = useState<string[]>([]); 
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize video URLs when component mounts or when currentUrls change
  useEffect(() => {
    setVideoUrls(currentUrls.length > 0 ? currentUrls : [""]); 
  }, [currentUrls]);

  const handleUpdate = async () => {
    const filledUrls = videoUrls.filter((url) => url.trim() !== "");
    if (filledUrls.length === 0) return;

    try {
      setIsUpdating(true);
      const result = await updateSubmissionVideoUrl(submissionId, filledUrls);

      if (result.success) {
        setIsEditing(false);
        toast.success("Video URLs updated successfully!");
        onUpdate?.(result.views || 0);
      } else {
        toast.error(result.error || "Failed to update video URLs");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update video URLs");
    } finally {
      setIsUpdating(false);
    }
  };

  const addNewField = () => {
    setVideoUrls([...videoUrls, ""]);
  };

  const removeField = (index: number) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(newUrls.length > 0 ? newUrls : [""]); 
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-zinc-900">Public Video URLs</Label>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-zinc-100"
          >
            <Pencil className="h-4 w-4 text-zinc-500" />
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {isEditing ? (
          <>
            {videoUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...videoUrls];
                    newUrls[index] = e.target.value;
                    setVideoUrls(newUrls);
                  }}
                  placeholder={`Enter public video URL ${index + 1}`}
                  className="text-zinc-900"
                />
                {videoUrls.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => removeField(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-[#5865F2] hover:bg-[#5865F2]/10"
              onClick={addNewField}
            >
              <Plus className="h-4 w-4 mr-1" /> Add another URL
            </Button>
          </>
        ) : (
<div className="space-y-2">
  {currentUrls.length > 0 ? (
    currentUrls.map((url, index) => (
      <div
        key={index}
        className="bg-whites text-black p-3 rounded-lg border border-[#5865F2]/20 break-all"
      >
        {url}
      </div>
    ))
  ) : (
    <p className="text-zinc-500">No video URLs provided</p>
  )}
</div>
        )}
      </div>
      {isEditing && (
        <Button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Updating..." : "Update"}
        </Button>
      )}
      {/* <span className="text-sm text-zinc-500">View Count: {videoViews}</span> */}
    </div>
  );
}
