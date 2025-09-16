import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Filter, FileText, BookOpen, GraduationCap, Presentation } from "lucide-react";
import { useState, useEffect } from "react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  files?: any[];
}

const categoryIcons = {
  all: FileText,
  notes: BookOpen,
  research: GraduationCap,
  assignments: FileText,
  presentations: Presentation
};

export function CategoryFilter({ selectedCategory, onCategoryChange, files = [] }: CategoryFilterProps) {
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    notes: 0,
    research: 0,
    assignments: 0,
    presentations: 0
  });

  useEffect(() => {
    const counts = files.reduce((acc, file) => {
      acc.all++;
      if (file.category && acc[file.category] !== undefined) {
        acc[file.category]++;
      }
      return acc;
    }, {
      all: 0,
      notes: 0,
      research: 0,
      assignments: 0,
      presentations: 0
    });
    
    setCategoryCounts(counts);
  }, [files]);

  const categories = [
    { id: 'all', name: 'All Files', count: categoryCounts.all },
    { id: 'notes', name: 'Class Notes', count: categoryCounts.notes },
    { id: 'research', name: 'Research Papers', count: categoryCounts.research },
    { id: 'assignments', name: 'Assignments', count: categoryCounts.assignments },
    { id: 'presentations', name: 'Presentations', count: categoryCounts.presentations }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Filter className="h-4 w-4" />
          <span>Categories</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-between text-sm h-9"
              onClick={() => onCategoryChange(category.id)}
            >
              <div className="flex items-center">
                <Icon className="mr-2 h-4 w-4" />
                <span>{category.name}</span>
              </div>
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}