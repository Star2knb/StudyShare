import { useState } from "react";
import { FileText, Download, Share2, Eye, MoreVertical, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ShareDialog } from "./ShareDialog";

interface FileCardProps {
  file: {
    id: string | number;
    title: string;
    description: string;
    category: string;
    fileName: string;
    fileSize: number;
    uploadDate: string;
    author: string;
    downloads: number;
    shared?: boolean;
    approved?: boolean;
  };
  onDownload: (file: any) => void;
  viewMode?: 'grid' | 'list';
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'notes': return 'bg-blue-100 text-blue-800';
    case 'research': return 'bg-green-100 text-green-800';
    case 'assignments': return 'bg-orange-100 text-orange-800';
    case 'presentations': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'notes': return 'Class Notes';
    case 'research': return 'Research Paper';
    case 'assignments': return 'Assignment';
    case 'presentations': return 'Presentation';
    default: return category;
  }
};

export function FileCard({ file, onDownload, viewMode = 'grid' }: FileCardProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{file.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getCategoryColor(file.category)} variant="secondary">
                      {getCategoryLabel(file.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{file.author}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="hidden sm:inline">{formatFileSize(file.fileSize)}</span>
                <span className="hidden md:inline">{formatDate(file.uploadDate)}</span>
                <div className="flex items-center space-x-1">
                  <Download className="h-3 w-3" />
                  <span>{file.downloads}</span>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDownload(file)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ShareDialog
          file={file}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight">{file.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">{file.fileName}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6 flex-shrink-0">
                  <MoreVertical className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(file)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Badge className={getCategoryColor(file.category)} variant="secondary">
              {getCategoryLabel(file.category)}
            </Badge>
            
            {file.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {file.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                <Avatar className="h-4 w-4 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {file.author?.charAt(0)?.toUpperCase() || <User className="h-2 w-2" />}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{file.author}</span>
              </div>
              <span className="flex-shrink-0">{formatFileSize(file.fileSize)}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(file.uploadDate)}</span>
              <div className="flex items-center space-x-1">
                <Download className="h-3 w-3" />
                <span>{file.downloads}</span>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => onDownload(file)}
              >
                <Download className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareDialog
        file={file}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </>
  );
}