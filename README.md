# humancron

Formats a cron expression into a human readable string.

## Installation

```sh
npm install --save humancron
```

## API

### formatCronAsString(expression: string): string

Parses a cron expression and formats it into a human readable string.

The expression can be made up of five parts (standard cron) or six, where the first element is seconds.

```typescript
formatCronAsString("10 5 5 * *")
"At 05:10 of the 5th day of every month"

formatCronAsString("20 10 5 5 5 5")
"At 05:10:20 of the 5th day and every Friday of May"

formatCronAsString("10-30 * 1-12 * *")
"At every minute between the 10th through the 30th minute of every hour of every day between the 1st through the 12th day of every month"

formatCronAsString("* 5-10/2 * JAN-MAY/3 MON-WED")
"At every minute of every 2nd hour between the 5th through the 10th hour of every day between Monday through Wednesday of every 3rd month between January through May"
```

### formatCronAsObject(expression: string): FormattedExpression

Does the same formatting as ```formatCronAsString(expression: string): string``` without joining the separate parts
together.

This will give you an object with the string for second, minute, hour, dayOfMonth, month and dayOfWeek separately. The
object also includes information on whether the time part has been simplified into clock (HH:MM:SS) format.

```typescript
formatCronAsObject("10-30 * 1-12 * *")
```

```json
{
  second: null,
  minute: 'every minute between the 10th through the 30th minute',
  hour: 'every hour',
  dayOfMonth: 'every day between the 1st through the 12th day',
  month: 'every month',
  dayOfWeek: '',
  timeAsClock: false,
  clockHasSeconds: false
}

```

### parseExpression(expression: string): ParsedExpression

Parses a cron expression. Used internally but might be useful in certain use cases.

```typescript
parseExpression("10-30 * 1-12 * *")
```

```json
{
  second: null,
  minute: {
    ranges: [
      {
        from: 10,
        to: 30,
        step: 1
      }
    ]
  },
  hour: {
    ranges: [
      {
        from: 0,
        to: 23,
        step: 1
      }
    ]
  },
  dayOfMonth: {
    ranges: [
      {
        from: 1,
        to: 12,
        step: 1
      }
    ]
  },
  month: {
    ranges: [
      {
        from: 1,
        to: 12,
        step: 1
      }
    ]
  },
  dayOfWeek: {
    ranges: [
      {
        from: 1,
        to: 7,
        step: 1
      }
    ]
  }
}
```
