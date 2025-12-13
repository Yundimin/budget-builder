import { AfterViewInit, Component, computed, signal } from '@angular/core';
import { DateRange, Month, RowItem } from '../../interfaces/budget.inferface';
import { BudgetType, KeyBoardType } from '../../enums/budget.enum';

@Component({
  selector: 'app-budget',
  imports: [],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
  standalone: true,
})
export class Budget implements AfterViewInit {
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
  protected readonly BudgetType = BudgetType;

  ngAfterViewInit() {
    setTimeout(() => {
      const rows = this.incomeRows();
      const months = this.tableMonths();

      if (!rows.length || !months.length) return;

      const firstRow = rows[0];
      const firstMonth = months[0];

      const id = `${BudgetType.Income}-${firstRow.id}-${firstMonth.id}`;
      const el = document.getElementById(id) as HTMLInputElement | null;

      el?.focus();
    }, 0);
  }

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

  changeLabelName(type: BudgetType, rowId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (type === BudgetType.Income) {
      this.incomeRows.update((rows) =>
        rows.map((row) => (row.id === rowId ? { ...row, label: value } : row))
      );
    } else {
      this.expenseRows.update((rows) =>
        rows.map((row) => (row.id === rowId ? { ...row, label: value } : row))
      );
    }
  }

  deleteRow(type: BudgetType, rowId: string) {
    if (type === BudgetType.Income) {
      this.incomeRows.update((rows) => rows.filter((row) => row.id !== rowId));
    } else {
      this.expenseRows.update((rows) => rows.filter((row) => row.id !== rowId));
    }
  }

  addRow(type: BudgetType) {
    if (type === BudgetType.Income) {
      this.incomeRows.update((rows) => [...rows, this.setNewRow('New Income')]);
    } else {
      this.expenseRows.update((rows) => [...rows, this.setNewRow('New Expense')]);
    }
  }

  handleKeydown(event: KeyboardEvent, section: BudgetType, rowId: string, monthId: string) {
    const key = event.key;

    const months = this.tableMonths();
    const rows = section === BudgetType.Income ? this.incomeRows() : this.expenseRows();

    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const colIndex = months.findIndex((month) => month.id === monthId);
    event.preventDefault();

    switch (key) {
      case KeyBoardType.Enter:
        const isLastRow = rowIndex === rows.length - 1;
        const isLastCol = colIndex === months.length - 1;

        if (isLastRow && isLastCol) {
          if (section === BudgetType.Income) {
            this.addRow(BudgetType.Income);
          } else {
            this.addRow(BudgetType.Expense);
          }

          setTimeout(() => {
            const newRows = section === BudgetType.Income ? this.incomeRows() : this.expenseRows();
            const newRowId = newRows[newRows.length - 1].id;

            const id = `${section}-${newRowId}-${months[colIndex].id}`;
            const el = document.getElementById(id) as HTMLInputElement | null;
            el?.focus();
          });

          return;
        }
        if (rowIndex < rows.length - 1) {
          this.focusCell(section, rows[rowIndex + 1].id, months[colIndex].id);
          return;
        }
        break;

      case KeyBoardType.Tab:
        if (colIndex < months.length - 1) {
          this.focusCell(section, rows[rowIndex].id, months[colIndex + 1].id);
        }
        return;
        break;

      case KeyBoardType.ArrowLeft:
        if (colIndex > 0) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex].id, months[colIndex - 1].id);
        }
        return;
        break;

      case KeyBoardType.ArrowRight:
        if (colIndex < months.length - 1) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex].id, months[colIndex + 1].id);
        }
        return;
        break;

      case KeyBoardType.ArrowUp:
        if (rowIndex > 0) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex - 1].id, months[colIndex].id);
        }
        return;

      case KeyBoardType.ArrowDown:
        if (rowIndex < rows.length - 1) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex + 1].id, months[colIndex].id);
        }
        return;
        break;
    }
  }

  focusCell(section: BudgetType, rowId: string, monthId: string) {
    const id = `${section}-${rowId}-${monthId}`;
    const el = document.getElementById(id) as HTMLInputElement | null;
    el?.focus();
  }
}
