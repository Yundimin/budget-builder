import { Component, computed, signal } from '@angular/core';
import { DateRange, Month, RowItem } from '../../interfaces/budget.inferface';

@Component({
  selector: 'app-budget',
  imports: [],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
  standalone: true,
})
export class Budget {
  public defaultNumber: number = 0;
  public dateRange = signal<DateRange>({
    startYear: 2026,
    startMonth: 1,
    endYear: 2026,
    endMonth: 12,
  });
  public startMonth = computed<Month[]>(() => {
    const list: Month[] = [];
    const year = 2026;

    for (let month = 1; month <= 12; month++) {
      const monthPad = month.toString().padStart(2, '0');
      list.push({
        id: `${year}-${monthPad}`,
        label: `${this.changeMonthToWord(month)} ${year}`,
        year: year,
        month: month,
      });
    }
    return list;
  });
  public endMonth = computed(() => {
    const all = this.startMonth();
    const { startYear, startMonth } = this.dateRange();

    return all.filter((m) => {
      return m.year > startYear || (m.year === startYear && m.month >= startMonth);
    });
  });
  public tableMonths = computed<Month[]>(() => {
    const { startYear, startMonth, endYear, endMonth } = this.dateRange();
    const list: Month[] = [];

    let year = startYear;
    let month = startMonth;

    while (year < endYear || (year === endYear && month <= endMonth)) {
      const monthPad = month.toString().padStart(2, '0');
      list.push({
        id: `${year}-${monthPad}`,
        label: `${this.changeMonthToWord(month)} ${year}`,
        year: year,
        month: month,
      });

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return list;
  });
  public incomeRows = signal<RowItem[]>([this.setNewRow('Sales'), this.setNewRow('Consulting')]);
  public expenseRows = signal<RowItem[]>([
    this.setNewRow('Salaries'),
    this.setNewRow('Cloud Hosting'),
  ]);

  changeMonthToWord(month: number): string {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
      month - 1
    ];
  }

  changeStart(event: Event) {
    const target = event.target as HTMLInputElement;

    this.dateRange.update((range) => ({
      ...range,
      startYear: +target.value.split('-')[0],
      startMonth: +target.value.split('-')[1],
    }));
  }

  changeEnd(event: any) {
    const target = event.target as HTMLInputElement;
    this.dateRange.update((range) => ({
      ...range,
      endYear: +target.value.split('-')[0],
      endMonth: +target.value.split('-')[1],
    }));
  }

  setNewRow(label: string): RowItem {
    const values: Record<string, number> = {};
    this.tableMonths().forEach((month) => (values[month.id] = 0));

    return {
      id: `row-${Date.now()}-${++this.defaultNumber}`,
      label,
      values,
    };
  }

  changeLabelName(type: 'income' | 'expense', rowId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (type === 'income') {
      this.incomeRows.update((rows) =>
        rows.map((row) => (row.id === rowId ? { ...row, label: value } : row))
      );
    } else {
      this.expenseRows.update((rows) =>
        rows.map((row) => (row.id === rowId ? { ...row, label: value } : row))
      );
    }
  }

  deleteRow(section: 'income' | 'expense', rowId: string) {
    if (section === 'income') {
      this.incomeRows.update((rows) => rows.filter((row) => row.id !== rowId));
    } else {
      this.expenseRows.update((rows) => rows.filter((row) => row.id !== rowId));
    }
  }

  addRow(section: 'income' | 'expense') {
    if (section === 'income') {
      this.incomeRows.update((rows) => [...rows, this.setNewRow('New Income')]);
    } else {
      this.expenseRows.update((rows) => [...rows, this.setNewRow('New Expense')]);
    }
  }
}
