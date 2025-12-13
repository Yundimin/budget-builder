import { Component, computed, signal } from '@angular/core';
import { DateRange, Month } from '../../interfaces/budget.inferface';

@Component({
  selector: 'app-budget',
  imports: [],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
  standalone: true,
})
export class Budget {
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
}
