import { useState } from "react";
import { Copy, Link, Mail, MessageCircle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { toast } from "sonner";

interface ShareDialogProps {
  file: {
    id: number;
    title: string;
    fileName: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ file, open, onOpenChange }: ShareDialogProps) {
  const [shareUrl] = useState(`https://studyshare.com/file/${file.id}`);
  const [copied, setCopied] = useState(false);
  const [publicAccess, setPublicAccess] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out: ${file.title}`);
    const body = encodeURIComponent(`I wanted to share this file with you: ${file.title}\n\nYou can access it here: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sharing: <span className="font-medium">{file.title}</span></p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="public-access" className="text-sm">
                Public access
              </Label>
              <Switch
                id="public-access"
                checked={publicAccess}
                onCheckedChange={setPublicAccess}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-download" className="text-sm">
                Allow downloads
              </Label>
              <Switch
                id="allow-download"
                checked={allowDownload}
                onCheckedChange={setAllowDownload}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-url" className="text-sm">Share link</Label>
            <div className="flex space-x-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={shareViaEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: file.title,
                    url: shareUrl
                  });
                } else {
                  copyToClipboard();
                }
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={copyToClipboard}>
              <Link className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}