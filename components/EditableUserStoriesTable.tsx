"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Download, Edit2, Save, X, Trash2, Plus, Search, Filter, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface UserStory {
  id: string;
  userStory: string;
  userStoryStatement: string;
  epic: string;
  stakeholderName: string;
  stakeholderRole: string;
  stakeholderTeam: string;
  category: string;
  changeCatalyst: string;
  useCaseId: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;
  tags: string[];
  lifecyclePhase?: string;
  source?: string;
  snippet?: string;
}

interface EditableUserStoriesTableProps {
  userStories: UserStory[];
  onStoriesChange: (stories: UserStory[]) => void;
  onDownload: (stories: UserStory[]) => void;
}

export function EditableUserStoriesTable({ 
  userStories, 
  onStoriesChange, 
  onDownload 
}: EditableUserStoriesTableProps) {
  // Safety check - ensure userStories is always an array
  const safeUserStories = userStories || [];
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<UserStory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof UserStory>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [epicFilter, setEpicFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Generate random use case ID
  const generateUseCaseId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `UC-${year}-${randomNum.toString().padStart(3, '0')}`;
  };

  // Get unique values for filters
  const uniqueEpics = useMemo(() => {
    return Array.from(new Set(safeUserStories.map((story: UserStory) => story.epic).filter(Boolean)));
  }, [safeUserStories]);

  const uniqueTeams = useMemo(() => {
    return Array.from(new Set(safeUserStories.map((story: UserStory) => story.stakeholderTeam).filter(Boolean)));
  }, [safeUserStories]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(safeUserStories.map((story: UserStory) => story.category).filter(Boolean)));
  }, [safeUserStories]);

  // Filter and sort stories
  const filteredAndSortedStories = useMemo(() => {
    let filtered = safeUserStories.filter(story => {
      const matchesSearch = 
        (story.userStory?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (story.userStoryStatement?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (story.epic?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (story.stakeholderName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (story.stakeholderRole?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (story.stakeholderTeam?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (story.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || story.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || story.category === categoryFilter;
      const matchesEpic = epicFilter === 'all' || story.epic === epicFilter;
      const matchesTeam = teamFilter === 'all' || story.stakeholderTeam === teamFilter;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesEpic && matchesTeam;
    });

    // Sort stories
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [safeUserStories, searchTerm, sortField, sortDirection, priorityFilter, categoryFilter, epicFilter, teamFilter]);

  // Inline editing functions
  const handleEdit = useCallback((story: UserStory) => {
    setEditingId(story.id);
    setEditData({ ...story });
  }, []);

  const handleSave = useCallback(() => {
    if (!editData || !editingId) {
      toast({
        title: "Error",
        description: "No changes to save.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!editData.userStory?.trim()) {
      toast({
        title: "Validation Error",
        description: "User story text is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editData.userStoryStatement?.trim()) {
      toast({
        title: "Validation Error",
        description: "User story statement is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedStories = safeUserStories.map(story =>
        story.id === editingId ? editData : story
      );

      onStoriesChange(updatedStories);
      setEditingId(null);
      setEditData(null);

      toast({
        title: "User story updated",
        description: "The user story has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user story. Please try again.",
        variant: "destructive",
      });
    }
  }, [editData, editingId, safeUserStories, onStoriesChange, toast]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditData(null);
  }, []);

  const handleDelete = useCallback((storyId: string) => {
    try {
      const updatedStories = safeUserStories.filter(story => story.id !== storyId);
      onStoriesChange(updatedStories);

      toast({
        title: "User story deleted",
        description: "The user story has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user story. Please try again.",
        variant: "destructive",
      });
    }
  }, [safeUserStories, onStoriesChange, toast]);

  const handlePriorityChange = useCallback((storyId: string, newPriority: 'High' | 'Medium' | 'Low') => {
    const updatedStories = safeUserStories.map(story =>
      story.id === storyId ? { ...story, priority: newPriority } : story
    );
    onStoriesChange(updatedStories);
  }, [safeUserStories, onStoriesChange]);

  const addNewStory = () => {
    const newStory: UserStory = {
      id: `US-${safeUserStories.length + 1}`,
      userStory: 'As a user, I need...',
      userStoryStatement: 'Brief description of the user story',
      epic: 'Epic Name',
      stakeholderName: 'Stakeholder Name',
      stakeholderRole: 'Stakeholder Role',
      stakeholderTeam: 'Stakeholder Team',
      category: 'Workflow',
      changeCatalyst: 'Change catalyst description',
      useCaseId: generateUseCaseId(),
      priority: 'Medium',
      confidence: 0.8,
      tags: [],
      lifecyclePhase: 'Execution',
      source: 'Manual Entry',
      snippet: ''
    };
    onStoriesChange([...safeUserStories, newStory]);
  };

  const handleSort = (field: keyof UserStory) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof UserStory }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadCSV = useCallback(() => {
    if (safeUserStories.length === 0) {
      toast({
        title: "No user stories to download",
        description: "Please generate some user stories first.",
        variant: "destructive",
      });
      return;
    }

    // Generate CSV content
    const headers = ['id', 'userStory', 'userStoryStatement', 'epic', 'stakeholderName', 'stakeholderRole', 'stakeholderTeam', 'category', 'priority', 'confidence'];
    const csvContent = [
      headers.join(','),
      ...safeUserStories.map(story => [
        story.id,
        `"${story.userStory.replace(/"/g, '""')}"`,
        `"${story.userStoryStatement.replace(/"/g, '""')}"`,
        `"${story.epic.replace(/"/g, '""')}"`,
        `"${story.stakeholderName.replace(/"/g, '""')}"`,
        `"${story.stakeholderRole.replace(/"/g, '""')}"`,
        `"${story.stakeholderTeam.replace(/"/g, '""')}"`,
        `"${story.category.replace(/"/g, '""')}"`,
        story.priority,
        story.confidence
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-stories-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "User stories downloaded",
      description: "CSV file has been downloaded successfully.",
    });
  }, [safeUserStories, toast]);

  if (safeUserStories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Stories</span>
            <Button onClick={downloadCSV} disabled>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No user stories generated yet.</p>
            <p className="text-sm">User stories will appear here after processing interview transcripts.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>User Stories ({safeUserStories.length})</span>
          <div className="flex space-x-2">
            <Button onClick={addNewStory} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Story
            </Button>
            <Button onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search user stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Epic</label>
                <select
                  value={epicFilter}
                  onChange={(e) => setEpicFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Epics</option>
                  {uniqueEpics.map(epic => (
                    <option key={epic} value={epic}>{epic}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Teams</option>
                  {uniqueTeams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* User Stories List */}
        <div className="space-y-4">
          {filteredAndSortedStories.map((story) => (
            <div key={story.id} className="border rounded-lg p-4 space-y-3">
              {/* Story ID and Priority Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {story.id}
                  </span>
                  {editingId === story.id ? (
                    <select
                      value={editData?.priority || story.priority}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, priority: e.target.value as 'High' | 'Medium' | 'Low' } : null)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  ) : (
                    <Badge className={getPriorityColor(story.priority)}>
                      {story.priority}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {editingId === story.id ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(story)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(story.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* User Story Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Story
                </label>
                {editingId === story.id ? (
                  <Input
                    value={editData?.userStory || ''}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, userStory: e.target.value } : null)}
                    placeholder="Enter user story"
                  />
                ) : (
                  <p className="text-gray-900">{story.userStory}</p>
                )}
              </div>

              {/* User Story Statement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Story Statement
                </label>
                {editingId === story.id ? (
                  <textarea
                    value={editData?.userStoryStatement || ''}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, userStoryStatement: e.target.value } : null)}
                    placeholder="Enter detailed story statement"
                    className="w-full border rounded-md px-3 py-2 min-h-[80px] resize-y"
                  />
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed">{story.userStoryStatement}</p>
                )}
              </div>

              {/* Epic and Stakeholder Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Epic</label>
                  {editingId === story.id ? (
                    <Input
                      value={editData?.epic || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, epic: e.target.value } : null)}
                      placeholder="Enter epic"
                    />
                  ) : (
                    <p className="text-gray-700">{story.epic}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholder</label>
                  {editingId === story.id ? (
                    <Input
                      value={editData?.stakeholderName || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, stakeholderName: e.target.value } : null)}
                      placeholder="Enter stakeholder name"
                    />
                  ) : (
                    <p className="text-gray-700">{story.stakeholderName}</p>
                  )}
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  {editingId === story.id ? (
                    <Input
                      value={editData?.category || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, category: e.target.value } : null)}
                      placeholder="Enter category"
                    />
                  ) : (
                    <p className="text-gray-700">{story.category}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confidence</label>
                  {editingId === story.id ? (
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={editData?.confidence || 0}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, confidence: parseFloat(e.target.value) } : null)}
                      className="w-20"
                    />
                  ) : (
                    <p className="text-gray-700">{story.confidence}</p>
                  )}
                </div>
              </div>

              {/* Source Story ID */}
              {story.useCaseId && (
                <div className="text-xs text-gray-500">
                  Use Case: {story.useCaseId}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
