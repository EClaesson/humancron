import {expect} from "chai";
import {formatCronAsString} from "../src";

describe('Formatting tests', () => {
    it('formatCronAsString fields', () => {
        expect(formatCronAsString("* * * * *")).to.equal("At every minute of every hour");
        expect(formatCronAsString("10 * * * *")).to.equal("At the 10th minute of every hour");
        expect(formatCronAsString("10 5 * * *")).to.equal("At 05:10 of every day");
        expect(formatCronAsString("10 5 5 * *")).to.equal("At 05:10 of the 5th day of every month");
        expect(formatCronAsString("10 5 5 5 *")).to.equal("At 05:10 of the 5th day of May");
        expect(formatCronAsString("10 5 5 5 5")).to.equal("At 05:10 of the 5th day and every Friday of May");
        expect(formatCronAsString("* 5 5 5 5")).to.equal("At every minute of the 5th hour of the 5th day and every Friday of May");
        expect(formatCronAsString("* * 5 5 5")).to.equal("At every minute of every hour of the 5th day and every Friday of May");
        expect(formatCronAsString("* * * 5 5")).to.equal("At every minute of every hour of every Friday of May");
        expect(formatCronAsString("* * * * 5")).to.equal("At every minute of every hour of every Friday");
        expect(formatCronAsString("10 * 5 5 5")).to.equal("At the 10th minute of every hour of the 5th day and every Friday of May");
        expect(formatCronAsString("10 * * 5 5")).to.equal("At the 10th minute of every hour of every Friday of May");
        expect(formatCronAsString("10 * * * 5")).to.equal("At the 10th minute of every hour of every Friday");
        expect(formatCronAsString("10 5 * 5 5")).to.equal("At 05:10 of every Friday of May");
        expect(formatCronAsString("10 5 5 * 5")).to.equal("At 05:10 of the 5th day and every Friday of every month");
        expect(formatCronAsString("10 * 5 * 5")).to.equal("At the 10th minute of every hour of the 5th day and every Friday of every month");
    });

    it('formatCronAsString seconds', () => {
        expect(formatCronAsString("* * * * * *")).to.equal("At every second of every minute of every hour");
        expect(formatCronAsString("20 10 * * * *")).to.equal("At the 20th second of the 10th minute of every hour");
        expect(formatCronAsString("20 10 5 * * *")).to.equal("At 05:10:20 of every day");
        expect(formatCronAsString("* 10 5 5 * *")).to.equal("At every second of 05:10 of the 5th day of every month");
        expect(formatCronAsString(" * 10 5 5 5 *")).to.equal("At every second of 05:10 of the 5th day of May");
        expect(formatCronAsString("20 10 5 5 5 5")).to.equal("At 05:10:20 of the 5th day and every Friday of May");
    });

    it('formatCronAsString ranges', () => {
        expect(formatCronAsString("10-30 * 1-12 * *")).to.equal("At every minute between the 10th through the 30th minute of every hour of every day between the 1st through the 12th day of every month");
        expect(formatCronAsString("* 5-10 * JAN-MAY MON-WED")).to.equal("At every minute of every hour between the 5th through the 10th hour of every day between Monday through Wednesday of every month between January through May");
    });

    it('formatCronAsString steps', () => {
        expect(formatCronAsString("10-30/4 * 1-12 */2 *")).to.equal("At every 4th minute between the 10th through the 30th minute of every hour of every day between the 1st through the 12th day of every 2nd month");
        expect(formatCronAsString("* 5-10/2 * JAN-MAY/3 MON-WED")).to.equal("At every minute of every 2nd hour between the 5th through the 10th hour of every day between Monday through Wednesday of every 3rd month between January through May");
    });
});
