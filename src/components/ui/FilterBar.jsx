import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Search,
  ChevronDown,
  X,
  Check,
  Grid3X3,
  List,
  Map,
  SlidersHorizontal
} from 'lucide-react'

/**
 * Modern dropdown filter bar component
 * Inspired by Airbnb/Fiverr-style filter UX
 *
 * @example
 * <FilterBar
 *   searchValue={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   searchPlaceholder="Search jobs..."
 *   filters={[
 *     {
 *       key: 'status',
 *       label: 'Status',
 *       type: 'select', // 'select' | 'multiselect' | 'range' | 'text'
 *       value: selectedStatus,
 *       onChange: setSelectedStatus,
 *       options: [
 *         { value: 'all', label: 'All' },
 *         { value: 'open', label: 'Open' },
 *       ]
 *     }
 *   ]}
 *   onClearAll={clearAllFilters}
 *   viewMode={viewMode}
 *   onViewModeChange={setViewMode}
 *   showViewModes={true}
 *   resultCount={results.length}
 * />
 */

// Individual Filter Button with Popover
const FilterButton = ({ filter, openPopover, setOpenPopover }) => {
  const { key, label, type, value, onChange, options, icon: Icon, min, max, step, placeholder } = filter

  const isOpen = openPopover === key

  // Calculate if filter is active and count
  const getActiveState = () => {
    if (type === 'select') {
      const defaultValue = options?.[0]?.value
      return { isActive: value !== defaultValue, count: value !== defaultValue ? 1 : 0 }
    }
    if (type === 'multiselect') {
      return { isActive: value?.length > 0, count: value?.length || 0 }
    }
    if (type === 'range') {
      const isChanged = value?.[0] > (min || 0) || value?.[1] < (max || 100)
      return { isActive: isChanged, count: isChanged ? 1 : 0 }
    }
    if (type === 'text') {
      return { isActive: !!value, count: value ? 1 : 0 }
    }
    return { isActive: false, count: 0 }
  }

  const { isActive, count } = getActiveState()

  // Get display label
  const getDisplayLabel = () => {
    if (type === 'select' && isActive) {
      const selected = options?.find(o => o.value === value)
      return selected?.label || label
    }
    if (type === 'text' && value) {
      return value.length > 15 ? value.substring(0, 15) + '...' : value
    }
    if (type === 'range' && isActive) {
      return `${value[0]} - ${value[1]}`
    }
    return label
  }

  return (
    <Popover open={isOpen} onOpenChange={(open) => setOpenPopover(open ? key : null)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-10 px-4 rounded-full border-2 transition-all duration-200 ${
            isActive
              ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          } ${isOpen ? 'ring-2 ring-primary/20' : ''}`}
        >
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          <span className="font-medium">{getDisplayLabel()}</span>
          {count > 0 && type === 'multiselect' && (
            <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {count}
            </span>
          )}
          <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 shadow-xl border-slate-200 dark:border-slate-700"
        align="start"
        sideOffset={8}
      >
        <div className="p-4">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">{label}</h4>

          {/* Select Type */}
          {type === 'select' && (
            <div className="space-y-1">
              {options?.map((option) => {
                const OptionIcon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value)
                      setOpenPopover(null)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      value === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {OptionIcon && <OptionIcon className="w-5 h-5" />}
                      <span className="font-medium">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-slate-500">({option.count})</span>
                      )}
                    </div>
                    {value === option.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Multiselect Type */}
          {type === 'multiselect' && (
            <>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {options?.map((option) => {
                  const isSelected = value?.includes(option.value)
                  const OptionIcon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (isSelected) {
                          onChange(value.filter(v => v !== option.value))
                        } else {
                          onChange([...(value || []), option.value])
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        isSelected
                          ? option.bgColor ? `${option.bgColor} ${option.color} border-2 border-current` : 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {OptionIcon && (
                        <div className={option.bgColor ? `p-1 rounded ${option.bgColor}` : ''}>
                          <OptionIcon className={`w-4 h-4 ${isSelected && option.color ? option.color : ''}`} />
                        </div>
                      )}
                      {option.label}
                    </button>
                  )
                })}
              </div>
              {value?.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange([])}
                  className="mt-3 w-full text-slate-500"
                >
                  Clear all
                </Button>
              )}
            </>
          )}

          {/* Range Type */}
          {type === 'range' && (
            <div className="px-2 py-4">
              <Slider
                value={value || [min || 0, max || 100]}
                onValueChange={onChange}
                min={min || 0}
                max={max || 100}
                step={step || 1}
                className="mb-6"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-slate-500 mb-1 block">Min</Label>
                  <Input
                    type="number"
                    value={value?.[0] || min || 0}
                    onChange={(e) => onChange([parseInt(e.target.value) || 0, value?.[1] || max])}
                    className="h-9"
                  />
                </div>
                <span className="text-slate-400 mt-5">—</span>
                <div className="flex-1">
                  <Label className="text-xs text-slate-500 mb-1 block">Max</Label>
                  <Input
                    type="number"
                    value={value?.[1] || max || 100}
                    onChange={(e) => onChange([value?.[0] || min, parseInt(e.target.value) || max])}
                    className="h-9"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange([min || 0, max || 100])}
                className="mt-3 w-full text-slate-500"
              >
                Reset
              </Button>
            </div>
          )}

          {/* Text Input Type */}
          {type === 'text' && (
            <div>
              <div className="relative">
                {Icon && (
                  <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                )}
                <Input
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
                  className={Icon ? "pl-10" : ""}
                  autoFocus
                />
              </div>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange('')}
                  className="mt-3 w-full text-slate-500"
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Active Filter Pill
const FilterPill = ({ label, icon: Icon, color, bgColor, onRemove }) => (
  <Badge
    variant="secondary"
    className={`flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full ${bgColor || ''} ${color || ''} ${bgColor ? 'border-0' : ''}`}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </Badge>
)

// Main FilterBar Component
const FilterBar = ({
  // Search
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = true,

  // Filters array
  filters = [],

  // Clear all
  onClearAll,

  // View modes
  viewMode,
  onViewModeChange,
  showViewModes = false,
  viewModes = ['grid', 'list'],

  // Results
  resultCount,
  resultLabel = 'result',

  // Active pills
  showActivePills = true,

  // Custom right content
  rightContent,

  // Additional actions
  actions,

  // Styling
  className = '',
  bordered = true,
}) => {
  const [openPopover, setOpenPopover] = useState(null)

  // Calculate total active filters
  const getActiveFilters = () => {
    const active = []

    filters.forEach(filter => {
      const { key, label, type, value, options, icon, onChange } = filter

      if (type === 'select') {
        const defaultValue = options?.[0]?.value
        if (value !== defaultValue) {
          const selected = options?.find(o => o.value === value)
          active.push({
            key,
            label: selected?.label || value,
            icon: selected?.icon,
            onRemove: () => onChange(defaultValue)
          })
        }
      }

      if (type === 'multiselect' && value?.length > 0) {
        value.forEach(v => {
          const opt = options?.find(o => o.value === v)
          active.push({
            key: `${key}-${v}`,
            label: opt?.label || v,
            icon: opt?.icon,
            color: opt?.color,
            bgColor: opt?.bgColor,
            onRemove: () => onChange(value.filter(x => x !== v))
          })
        })
      }

      if (type === 'range') {
        const { min = 0, max = 100 } = filter
        if (value?.[0] > min || value?.[1] < max) {
          active.push({
            key,
            label: `${value[0]} - ${value[1]}`,
            icon,
            onRemove: () => onChange([min, max])
          })
        }
      }

      if (type === 'text' && value) {
        active.push({
          key,
          label: value,
          icon,
          onRemove: () => onChange('')
        })
      }
    })

    return active
  }

  const activeFilters = getActiveFilters()
  const hasActiveFilters = activeFilters.length > 0

  return (
    <div className={className}>
      {/* Search Bar */}
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-12 pr-4 h-12 text-base rounded-full border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className={`mb-4 ${bordered ? 'pb-4 border-b border-slate-200 dark:border-slate-800' : ''}`}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Buttons */}
          {filters.map((filter) => (
            <FilterButton
              key={filter.key}
              filter={filter}
              openPopover={openPopover}
              setOpenPopover={setOpenPopover}
            />
          ))}

          {/* Clear All Button */}
          {hasActiveFilters && onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-10 px-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          )}

          {/* Custom Actions */}
          {actions}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Custom Right Content */}
          {rightContent}

          {/* View Mode Toggles */}
          {showViewModes && onViewModeChange && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {viewModes.includes('grid') && (
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="w-9 h-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              )}
              {viewModes.includes('list') && (
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="w-9 h-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              )}
              {viewModes.includes('map') && (
                <Button
                  variant={viewMode === 'map' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange('map')}
                  className="w-9 h-8 p-0"
                >
                  <Map className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count & Active Filter Pills */}
      {(resultCount !== undefined || (showActivePills && hasActiveFilters)) && (
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Results Count */}
            {resultCount !== undefined && (
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {resultCount} {resultLabel}{resultCount !== 1 ? 's' : ''}
              </p>
            )}

            {/* Active Filter Pills */}
            {showActivePills && hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                  <FilterPill
                    key={filter.key}
                    label={filter.label}
                    icon={filter.icon}
                    color={filter.color}
                    bgColor={filter.bgColor}
                    onRemove={filter.onRemove}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterBar
export { FilterButton, FilterPill }
