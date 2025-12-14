export interface Month {
  id: string;
  label: string;
  year: number;
  month: number;
}

export interface DateRange {
  initialStartYear: number;
  initialEndYear: number;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export interface RowItem {
  id: string;
  label: string;
  values: Record<string, number>;
}
