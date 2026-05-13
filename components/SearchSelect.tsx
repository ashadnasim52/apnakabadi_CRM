
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, ChevronDown, Check } from 'lucide-react';

interface SearchSelectProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  onAddNew?: (search: string) => void;
  labelField: keyof T;
  secondaryField?: keyof T;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  renderItem?: (item: T) => React.ReactNode;
  idField: keyof T;
}

export function SearchSelect<T>({
  items,
  onSelect,
  onAddNew,
  labelField,
  secondaryField,
  placeholder = 'Search...',
  className = '',
  defaultValue = '',
  renderItem,
  idField
}: SearchSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(defaultValue || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => {
      const label = String(item[labelField]).toLowerCase();
      const secondary = secondaryField ? String(item[secondaryField]).toLowerCase() : '';
      return label.includes(lowerSearch) || secondary.includes(lowerSearch);
    });
  }, [items, searchTerm, labelField, secondaryField]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    // Sync searchTerm when defaultValue prop changes
    setSearchTerm(defaultValue || '');
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [defaultValue]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setSearchTerm(String(item[labelField]));
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev < filteredItems.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen) {
        if (highlightedIndex < filteredItems.length) {
          handleSelect(filteredItems[highlightedIndex]);
        } else if (onAddNew && searchTerm) {
          onAddNew(searchTerm);
          setIsOpen(false);
        }
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 text-sm"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={18} 
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={String(item[idField])}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-3 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0 ${
                  highlightedIndex === index ? 'bg-blue-50' : ''
                }`}
              >
                {renderItem ? renderItem(item) : (
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{String(item[labelField])}</p>
                    {secondaryField && <p className="text-xs text-slate-500">{String(item[secondaryField])}</p>}
                  </div>
                )}
                {searchTerm === String(item[labelField]) && <Check size={16} className="text-blue-600" />}
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-slate-500 text-center">
              No results found
            </div>
          )}
          
          {onAddNew && searchTerm && !filteredItems.find(i => String(i[labelField]).toLowerCase() === searchTerm.toLowerCase()) && (
            <div
              onClick={() => {
                onAddNew(searchTerm);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(filteredItems.length)}
              className={`p-3 cursor-pointer border-t border-slate-100 flex items-center space-x-2 text-blue-600 font-medium ${
                highlightedIndex === filteredItems.length ? 'bg-blue-50' : ''
              }`}
            >
              <Plus size={16} />
              <span className="text-sm">Add "{searchTerm}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
