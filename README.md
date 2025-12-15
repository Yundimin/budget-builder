# BudgetBuilder

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.13.

## Development server

To start a local development server, run:

```bash
ng serve

or

npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory.

By default, the production build optimizes your application for performance and speed.

## Data Model

### Months

Each month is represented as a plain object with a stable string-based id.

```ts
export interface Month {
  id: string; //  "2026-01"
  label: string; //  "Jan 2026"
  year: number;
  month: number;
}
```

### DateRange

```ts
export interface DateRange {
  initialStartYear: number;
  initialEndYear: number;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}
```

### RowItem

Each Row is represented as a plain object with a stable string-based id.

```ts
export interface RowItem {
  id: string;
  label: string;
  values: Record<string, number>;
}
```

# Signals and computed Signals

Signals and computed Signals are located in 'app/components/budget/budget.ts'

### Signals

dateRange // startYear, startMonth, endYear, endMonth

incomeRows // list of income line items

expenseRows // list of expense line items

contextMenu // state for right-click context menu

### Computed

startMonth // full list of selectable start months

endMonth // end-month options filtered by selected start month

tableMonths // months currently rendered in the table

totalIncomeByMonth // Sum of all Income line item values for that month.

totalExpenseByMonth // Sum of all Expenses line item values for that month.

profitLossByMonth // Income Total – Total Expenses by month

balancesByMonth // Closing Balance = Opening Balance + Profit/Loss ▪ The next month’s Opening Balance is the previous month’s Closing Balance
