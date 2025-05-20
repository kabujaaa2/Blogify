
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { X, Tag, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue && suggestions.length) {
      const filtered = suggestions.filter(
        (suggestion) => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) && 
          !tags.includes(suggestion)
      ).slice(0, 8); // Limit to 8 suggestions
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, tags]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    
    if (trimmedTag && !tags.includes(trimmedTag) && trimmedTag.length >= 2) {
      setTags([...tags, trimmedTag]);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        // If a suggestion is selected, use that
        addTag(filteredSuggestions[selectedSuggestionIndex]);
      } else if (inputValue) {
        // Otherwise use the input value
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
      
      // Scroll to keep selected item in view
      if (suggestionsRef.current && selectedSuggestionIndex >= 0) {
        const selectedElement = suggestionsRef.current.children[selectedSuggestionIndex + 1];
        if (selectedElement) {
          selectedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
      
      // Scroll to keep selected item in view
      if (suggestionsRef.current && selectedSuggestionIndex >= 0) {
        const selectedElement = suggestionsRef.current.children[selectedSuggestionIndex - 1];
        if (selectedElement) {
          selectedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="mb-4 relative">
      <div className="flex items-center mb-1.5 text-sm text-muted-foreground">
        <Tag className="h-4 w-4 mr-1.5" />
        <span>Tags</span>
        {tags.length > 0 && <span className="ml-1">({tags.length})</span>}
      </div>
      
      <div className="flex flex-wrap gap-2 p-3 border border-primary/10 rounded-lg min-h-[50px] bg-card/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="px-2.5 py-1 bg-primary/10 hover:bg-primary/15 text-primary rounded-full flex items-center gap-1 transition-colors"
          >
            {tag}
            <button
              type="button"
              className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag} tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        <div className="flex-grow flex items-center min-w-[180px]">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? "Add tags (e.g. javascript, react)..." : "Add another tag..."}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto flex-grow bg-transparent placeholder:text-muted-foreground/70"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="ml-1 p-1 rounded-full hover:bg-primary/10 text-primary"
              title="Add tag"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-card border border-border rounded-lg shadow-lg p-1"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={cn(
                "px-3 py-2 rounded-md cursor-pointer flex items-center justify-between",
                selectedSuggestionIndex === index ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <span>{suggestion}</span>
              {selectedSuggestionIndex === index && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          ))}
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span>Press Backspace to remove the last tag</span>
        </div>
      )}
    </div>
  );
};

export default TagInput;
