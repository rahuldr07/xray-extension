import { normalizePanelSettings } from './panelSettings';
import type { ActiveTab, ApiDrawerPlacement, ApiGroupingMode, ApiQuickFilter, ConsoleMiniTab, DetailTab, DetailView, NetworkFilter, PanelSettings, SortField, SortOrder } from '../types';

export const REACT_PANEL_PREFERENCES_KEY = 'react_panel_preferences';

export interface PanelPreferencesState {
  activeTab: ActiveTab;
  detailView: DetailView;
  detailTab: DetailTab;
  consoleMiniTab: ConsoleMiniTab;
  networkFilter: NetworkFilter;
  apiSearchQuery: string;
  apiQuickFilter: ApiQuickFilter;
  apiGroupingMode: ApiGroupingMode;
  apiDetailOpen: boolean;
  apiDrawerPlacement: ApiDrawerPlacement;
  methodFilters: Set<string>;
  statusFilters: Set<string>;
  typeFilters: Set<string>;
  expandedGroups: Set<string>;
  sortField: SortField;
  sortOrder: SortOrder;
  recording: boolean;
  pinnedIds: Set<string>;
  settings: PanelSettings;
}

export interface SerializedPanelPreferences {
  activeTab?: ActiveTab;
  detailView?: DetailView;
  detailTab?: DetailTab;
  consoleMiniTab?: ConsoleMiniTab;
  networkFilter?: NetworkFilter;
  apiSearchQuery?: string;
  apiQuickFilter?: ApiQuickFilter;
  apiGroupingMode?: ApiGroupingMode;
  apiDetailOpen?: boolean;
  apiDrawerPlacement?: ApiDrawerPlacement;
  methodFilters?: string[];
  statusFilters?: string[];
  typeFilters?: string[];
  expandedGroups?: string[];
  sortField?: SortField;
  sortOrder?: SortOrder;
  recording?: boolean;
  pinnedIds?: string[];
  settings?: Partial<PanelSettings>;
}

export function serializePanelPreferences(state: PanelPreferencesState): SerializedPanelPreferences {
  return {
    activeTab: state.activeTab,
    detailView: state.detailView,
    detailTab: state.detailTab,
    consoleMiniTab: state.consoleMiniTab,
    networkFilter: state.networkFilter,
    apiSearchQuery: state.apiSearchQuery,
    apiQuickFilter: state.apiQuickFilter,
    apiGroupingMode: state.apiGroupingMode,
    apiDetailOpen: state.apiDetailOpen,
    apiDrawerPlacement: state.apiDrawerPlacement,
    methodFilters: Array.from(state.methodFilters),
    statusFilters: Array.from(state.statusFilters),
    typeFilters: Array.from(state.typeFilters),
    expandedGroups: Array.from(state.expandedGroups),
    sortField: state.sortField,
    sortOrder: state.sortOrder,
    recording: state.recording,
    pinnedIds: Array.from(state.pinnedIds),
    settings: state.settings,
  };
}

export function applyPanelPreferences(preferences: SerializedPanelPreferences): Partial<PanelPreferencesState> {
  return {
    ...(preferences.activeTab ? { activeTab: preferences.activeTab } : {}),
    ...(preferences.detailView ? { detailView: preferences.detailView } : {}),
    ...(preferences.detailTab ? { detailTab: preferences.detailTab } : {}),
    ...(preferences.consoleMiniTab ? { consoleMiniTab: preferences.consoleMiniTab } : {}),
    ...(preferences.networkFilter ? { networkFilter: preferences.networkFilter } : {}),
    ...(typeof preferences.apiSearchQuery === 'string' ? { apiSearchQuery: preferences.apiSearchQuery } : {}),
    ...(preferences.apiQuickFilter ? { apiQuickFilter: preferences.apiQuickFilter } : {}),
    ...(preferences.apiGroupingMode ? { apiGroupingMode: preferences.apiGroupingMode } : {}),
    ...(typeof preferences.apiDetailOpen === 'boolean' ? { apiDetailOpen: preferences.apiDetailOpen } : {}),
    ...(preferences.apiDrawerPlacement ? { apiDrawerPlacement: preferences.apiDrawerPlacement } : {}),
    ...(Array.isArray(preferences.methodFilters) ? { methodFilters: new Set(preferences.methodFilters) } : {}),
    ...(Array.isArray(preferences.statusFilters) ? { statusFilters: new Set(preferences.statusFilters) } : {}),
    ...(Array.isArray(preferences.typeFilters) ? { typeFilters: new Set(preferences.typeFilters) } : {}),
    ...(Array.isArray(preferences.expandedGroups) ? { expandedGroups: new Set(preferences.expandedGroups) } : {}),
    ...(preferences.sortField ? { sortField: preferences.sortField } : {}),
    ...(preferences.sortOrder ? { sortOrder: preferences.sortOrder } : {}),
    ...(typeof preferences.recording === 'boolean' ? { recording: preferences.recording } : {}),
    ...(Array.isArray(preferences.pinnedIds) ? { pinnedIds: new Set(preferences.pinnedIds) } : {}),
    ...(preferences.settings ? { settings: normalizePanelSettings(preferences.settings) } : {}),
  };
}
