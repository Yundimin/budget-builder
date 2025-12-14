import { AfterViewInit, Component, computed, effect, signal } from '@angular/core';
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
    endYear: 2028,
    endMonth: 12,
  });
  public startMonth = computed<Month[]>(() => {
    const list: Month[] = [];
    const { startYear, endYear } = this.dateRange();

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthPad = month.toString().padStart(2, '0');
        list.push({
          id: `${year}-${monthPad}`,
          label: `${this.changeMonthToWord(month)} ${year}`,
          year,
          month,
        });
      }
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
  public totalIncomeByMonth = computed(() => {
    const months = this.tableMonths();
    const rows = this.incomeRows();
    const result: Record<string, number> = {};

    for (const month of months) {
      result[month.id] = rows.reduce((sum, row) => sum + (row.values[month.id] ?? 0), 0);
    }
    return result;
  });
  public totalExpenseByMonth = computed(() => {
    const months = this.tableMonths();
    const rows = this.expenseRows();
    const result: Record<string, number> = {};

    for (const month of months) {
      result[month.id] = rows.reduce((sum, row) => sum + (row.values[month.id] ?? 0), 0);
    }
    return result;
  });
  public profitLossByMonth = computed(() => {
    const months = this.tableMonths();
    const income = this.totalIncomeByMonth();
    const expense = this.totalExpenseByMonth();

    const result: Record<string, number> = {};

    for (const month of months) {
      result[month.id] = (income[month.id] ?? 0) - (expense[month.id] ?? 0);
    }
    return result;
  });
  public balancesByMonth = computed(() => {
    const months = this.tableMonths();
    const profit = this.profitLossByMonth();
    const opening: Record<string, number> = {};
    const closing: Record<string, number> = {};

    let current = 0;

    for (const month of months) {
      opening[month.id] = current;
      current = current + (profit[month.id] ?? 0);
      closing[month.id] = current;
    }

    return { opening, closing };
  });
  public contextMenu = signal<{
    visible: boolean;
    x: number;
    y: number;
    target: { type: BudgetType; rowId: string; monthId: string } | null;
  }>({ visible: false, x: 0, y: 0, target: null });
  protected readonly BudgetType = BudgetType;

  constructor() {
    effect(() => {
      const months = this.tableMonths();
      if (months.length) {
        this.resetAllValues(months);
      }
    });
  }

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

  changeEnd(event: Event) {
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

    switch (key) {
      case KeyBoardType.Enter:
        event.preventDefault();
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
        event.preventDefault();
        if (colIndex < months.length - 1) {
          this.focusCell(section, rows[rowIndex].id, months[colIndex + 1].id);
        }
        return;
        break;

      case KeyBoardType.ArrowLeft:
        event.preventDefault();
        if (colIndex > 0) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex].id, months[colIndex - 1].id);
        }
        return;
        break;

      case KeyBoardType.ArrowRight:
        event.preventDefault();
        if (colIndex < months.length - 1) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex].id, months[colIndex + 1].id);
        }
        return;
        break;

      case KeyBoardType.ArrowUp:
        event.preventDefault();
        if (rowIndex > 0) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex - 1].id, months[colIndex].id);
        }
        return;

      case KeyBoardType.ArrowDown:
        event.preventDefault();
        if (rowIndex < rows.length - 1) {
          event.preventDefault();
          this.focusCell(section, rows[rowIndex + 1].id, months[colIndex].id);
        }
        return;
        break;

      default:
        return;
        break;
    }
  }

  focusCell(section: BudgetType, rowId: string, monthId: string) {
    const id = `${section}-${rowId}-${monthId}`;
    const el = document.getElementById(id) as HTMLInputElement | null;
    el?.focus();
  }

  changeCellInput(type: BudgetType, rowId: string, monthId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    const update = (rows: RowItem[]) =>
      rows.map((r) =>
        r.id === rowId
          ? {
              ...r,
              values: { ...r.values, [monthId]: value },
            }
          : r
      );

    if (type === BudgetType.Income) {
      this.incomeRows.update(update);
    } else {
      this.expenseRows.update(update);
    }
  }

  resetAllValues(months: Month[]) {
    const reset = (rows: RowItem[]) =>
      rows.map((row) => {
        const values: Record<string, number> = {};
        months.forEach((month) => (values[month.id] = 0));
        return { ...row, values };
      });

    this.incomeRows.update(reset);
    this.expenseRows.update(reset);
  }

  onContextMenu(event: MouseEvent, type: BudgetType, rowId: string, monthId: string) {
    event.preventDefault();

    this.contextMenu.set({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      target: { type, rowId, monthId },
    });
  }

  closeContextMenu() {
    this.contextMenu.update((rest) => ({ ...rest, visible: false }));
  }

  applyToAll() {
    const target = this.contextMenu().target;
    if (!target) return;

    const { type, rowId, monthId } = target;

    const list = type === BudgetType.Income ? this.incomeRows() : this.expenseRows();
    const row = list.find((r) => r.id === rowId);
    if (!row) return;

    const base = row.values[monthId];

    const newValues: Record<string, number> = {};
    for (const key in row.values) {
      newValues[key] = base;
    }

    const updatedRows = list.map((row) => (row.id === rowId ? { ...row, values: newValues } : row));

    if (type === BudgetType.Income) {
      this.incomeRows.set(updatedRows);
    } else {
      this.expenseRows.set(updatedRows);
    }

    this.contextMenu.update((rest) => ({ ...rest, visible: false }));
  }
}
