import {dynsequel} from "./dynsequel";

describe('dynsequel.ts', () => {

    it('Should support different more complex use cases', () => {
        // Value mapping
        dynsequel({
            sql: "SELECT * FROM bar",
            constraints: [
                ['bar = ?', 'JEE', {
                    "JEE": 1,
                    "BEE": 2
                }]
            ],
            end: "ORDER BY foo"
        });

        // Subqueries
        dynsequel({
            sql: 'select * from foo',
            constraints: [
                ['bar in (select id from baz where class = ?)', 'fozzez']
            ]
        });

        // Joins
        dynsequel({
            sql: 'select * from foo join bar on foo.a = bar.a',
            constraints: [
                ['bar.baz = ?', 'fozzez']
            ]
        });

        // OR Blocks, this does not work right now
        const ac = dynsequel({
            sql: 'select * from foo',
            constraints: [
                ['type = ?', ['PENDING', 'FINISHED']]
            ]
        });
        // Should yield
        // select * from foo WHERE (type = ? OR type = ?) ['PENDING', 'FINISHED*]
    });

    it('Should support simple SQL without arguments', () => {
        expect(dynsequel({
            sql: 'SELECT * FROM foo'
        })).toEqual(['SELECT * FROM foo', []]);
    });

    it('Should support constraint without argument', () => {
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                'bar IS NULL'
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar IS NULL', []]);
    });

    it('Should support simple SQL with argument', () => {
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', 1]
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar = ?', [1]]);
    });

    it('Should support boolean arguments', () => {
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', true]
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar = ?', [true]]);
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', false]
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar = ?', [false]]);
    });

    it('Should support simple SQL with missing argument', () => {
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', null]
            ]
        })).toEqual(['SELECT * FROM foo', []]);
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', undefined]
            ]
        })).toEqual(['SELECT * FROM foo', []]);
    });

    it('Should support multiple simple constraints', () => {
        expect(dynsequel({
                sql: 'SELECT * FROM foo',
                constraints: [
                    ['bar = ?', 1],
                    ['baz = ?', 2]
                ]
            })).toEqual(['SELECT * FROM foo WHERE bar = ? AND baz = ?', [1, 2]]);
    });

    it('Should drop missing constraints when having multiple constraints', () => {
        expect(dynsequel({
                sql: 'SELECT * FROM foo',
                constraints: [
                    ['bar = ?', null],
                    ['baz = ?', 2]
                ]
            }
        )).toEqual(['SELECT * FROM foo WHERE baz = ?', [2]]);

        expect(dynsequel({
                sql: 'SELECT * FROM foo',
                constraints: [
                    ['bar = ?', 1],
                    ['baz = ?', null]
                ]
            })).toEqual(['SELECT * FROM foo WHERE bar = ?', [1]]);
    });

    it('Should support simple value mapping out of the box', () => {
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', 1, {
                    1: 'foo',
                    2: 'bar'
                }]
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar = ?', ['foo']]);
    });

    it('Should support mapping array of values to OR block', () => {
        expect(dynsequel({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', [1, 2]]
            ]
        })).toEqual(['SELECT * FROM foo WHERE (bar = ? OR bar = ?)', [1, 2]]);
    });
});