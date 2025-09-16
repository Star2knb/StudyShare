import { FileCard } from "./FileCard";
import { Button } from "./ui/button";
import { Grid, List } from "lucide-react";
import { useState } from "react";

interface FileGridProps {
  files: any[];
  onDownload: (file: any) => void;
}

export function FileGrid({ files, onDownload }: FileGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (files.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="text-muted-foreground">
          <p>No files match your search</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''} found
        </p>
        
        <div className="hidden sm:flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4" 
          : "space-y-3 md:space-y-4"
      }>
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDownload={onDownload}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}