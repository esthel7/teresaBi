interface DashboardUnitType {
  type: 'chart' | 'range' | 'combo' | 'list' | 'tree' | 'date' | 'none';
  title: string;
  source: string;
  unitInventory: { [key: string]: [] };
  property: { [key: string]: string | boolean }; // edit later
  filterId: string[];
  filterNum: { [key: string]: (number | string)[] }; // only range, date filter
  filterValue: { [key: string]: [] }; // only combo, list, tree filter
}
