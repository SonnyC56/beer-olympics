// Runtime type assertions for Material Web Components
// This avoids TypeScript compilation errors while still providing the components

export const MaterialElements = {
  // Buttons
  FilledButton: 'md-filled-button' as any,
  OutlinedButton: 'md-outlined-button' as any,
  TextButton: 'md-text-button' as any,
  ElevatedButton: 'md-elevated-button' as any,
  FilledTonalButton: 'md-filled-tonal-button' as any,
  
  // Icon
  Icon: 'md-icon' as any,
  IconButton: 'md-icon-button' as any,
  
  // Text Fields
  FilledTextField: 'md-filled-text-field' as any,
  OutlinedTextField: 'md-outlined-text-field' as any,
  
  // Dialog
  Dialog: 'md-dialog' as any,
  
  // Select
  FilledSelect: 'md-filled-select' as any,
  OutlinedSelect: 'md-outlined-select' as any,
  SelectOption: 'md-select-option' as any,
  
  // Switch
  Switch: 'md-switch' as any,
  
  // Tabs
  Tabs: 'md-tabs' as any,
  PrimaryTab: 'md-primary-tab' as any,
  SecondaryTab: 'md-secondary-tab' as any,
  
  // FAB
  Fab: 'md-fab' as any,
  BrandedFab: 'md-branded-fab' as any,
  
  // Chips
  ChipSet: 'md-chip-set' as any,
  AssistChip: 'md-assist-chip' as any,
  FilterChip: 'md-filter-chip' as any,
  InputChip: 'md-input-chip' as any,
  SuggestionChip: 'md-suggestion-chip' as any,
  
  // List
  List: 'md-list' as any,
  ListItem: 'md-list-item' as any,
  
  // Ripple
  Ripple: 'md-ripple' as any,
};