import {parseExpression} from "../src/parsing";
import {expect} from "chai";

describe('Parsing tests', () => {
    it('parseExpression ok', () => {
        const parsedExpression = parseExpression("*/10 5/2 1-5,10-15 1-4/2,5-12/3, MON-WED,SAT-SUN");

        expect(parsedExpression).to.deep.equal({
            second: null,
            minute: {
                ranges: [
                    {from: 0, to: 59, step: 10}
                ]
            },
            hour: {
                ranges: [
                    {from: 5, to: 5, step: 2}
                ]
            },
            dayOfMonth: {
                ranges: [
                    {from: 1, to: 5, step: 1},
                    {from: 10, to: 15, step: 1}
                ]
            },
            month: {
                ranges: [
                    {from: 1, to: 4, step: 2},
                    {from: 5, to: 12, step: 3}
                ]
            },
            dayOfWeek: {
                ranges: [
                    {from: 1, to: 3, step: 1},
                    {from: 6, to: 7, step: 1}
                ]
            },
        });
    });

    it('parseExpression field count error', () => {
        expect(() => parseExpression("* * * *")).to.throw("Invalid number of fields: 4");
        expect(() => parseExpression("* * * * * * *")).to.throw("Invalid number of fields: 7")
    });

    it('parseExpression parse error', () => {
        expect(() => parseExpression("* * 1-/4 * *")).to.throw("Failed to parse field: 1-/4");
        expect(() => parseExpression("* * */4-5 * *")).to.throw("Failed to parse field: */4-5");
        expect(() => parseExpression("* * * * MOB-WED")).to.throw("Failed to parse field: MOB-WED");
    })
});
