interface DashboardUnitType {
  type: 'chart' | 'filter' | 'none';
  title: string;
  unitInventory: { [key: string]: [] };
  property: { [key: string]: string | boolean }; // edit later
  filterId: string[];
  filterNum: { [key: string]: (number | string)[] }; // only range, date filter
  filterValue: { [key: string]: [] }; // only combo, list, tree filter
}
