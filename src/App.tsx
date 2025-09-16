import { useState, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { CategoryFilter } from "./components/CategoryFilter";
import { FileGrid } from "./components/FileGrid";
import { FileUpload } from "./components/FileUpload";
import { AuthDialog } from "./components/AuthDialog";
import { AdminPanel } from "./components/AdminPanel";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "./utils/supabase/client";
import { projectId, publicAnonKey } from "./utils/supabase/info";

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [files, setFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b103978/files`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files. Please check your connection.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [files, selectedCategory, searchQuery]);

  const handleFileUpload = (newFile: any) => {
    setFiles(prev => [newFile, ...prev]);
  };

  const handleDownload = async (file: any) => {
    try {
      // Update download count on server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3b103978/files/${file.id.replace('file:', '')}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, downloads: data.downloads } : f
        ));
        toast.success(`Downloading ${file.fileName}...`);
      } else {
        toast.success(`Downloading ${file.fileName}...`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.success(`Downloading ${file.fileName}...`);
    }
  };

  const handleUploadClick = () => {
    if (!user) {
      setAuthDialogOpen(true);
    } else {
      setUploadDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading StudyShare...</p>
        </div>
      </div>
    );
  }

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onSearchChange={setSearchQuery}
          onUploadClick={handleUploadClick}
          onAuthClick={() => setAuthDialogOpen(true)}
          onAdminClick={() => setShowAdminPanel(!showAdminPanel)}
        />
        
        <div className="container mx-auto px-4 py-6">
          <AdminPanel />
        </div>

        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchChange={setSearchQuery}
        onUploadClick={handleUploadClick}
        onAuthClick={() => setAuthDialogOpen(true)}
        onAdminClick={() => setShowAdminPanel(true)}
      />
      
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                files={files}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {files.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files available</h3>
                <p className="text-gray-500 mb-6">Be the first to share your study materials with the community!</p>
                {user && (
                  <Button onClick={handleUploadClick}>
                    Upload Your First File
                  </Button>
                )}
              </div>
            ) : (
              <FileGrid
                files={filteredFiles}
                onDownload={handleDownload}
              />
            )}
          </div>
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload your notes and research papers to share with other students.
            </DialogDescription>
          </DialogHeader>
          <FileUpload
            onFileUpload={handleFileUpload}
            onClose={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}