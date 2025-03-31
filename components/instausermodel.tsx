import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface InstagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
}

export function InstagramModal({ isOpen, onClose, onSubmit }: InstagramModalProps) {
  const [instagramUsername, setInstagramUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstagramUsername = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/instagram");
        const data = await response.json();
        if (data.instagramUsername) {
          setInstagramUsername(data.instagramUsername);
        }
      } catch (err) {
        setError("Failed to fetch username.");
      }
      setIsLoading(false);
    };

    fetchInstagramUsername();
  }, []);

  const handleSubmit = () => {
    setError(null);

    if (!instagramUsername.trim()) {
      setError("Please enter a username.");
      return;
    }

    onSubmit(instagramUsername.trim());
    setInstagramUsername("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-xl font-bold text-center text-gray-800">Instagram Username</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="relative">
          <input
            type="text"
            value={instagramUsername}
            onChange={(e) => setInstagramUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Instagram Username"
            disabled={isLoading}
          />
          {isLoading && <Loader2 className="absolute right-4 top-3 h-5 w-5 animate-spin text-gray-400" />}
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" className="px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-100">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
