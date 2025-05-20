
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue && suggestions.length) {
      const filtered = suggestions.filter(
        (suggestion) => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) && 
          !tags.includes(suggestion)
      ).slice(0, 5); // Limit to 5 suggestions
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, tags]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="mb-4 relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="tag-item"
          >
            {tag}
            <span 
              className="tag-item-remove" 
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </span>
          </div>
        ))}
        
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto flex-grow min-w-[120px]"
        />
      </div>
      
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-background border rounded-md shadow-md">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="px-3 py-2 hover:bg-accent cursor-pointer"
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
