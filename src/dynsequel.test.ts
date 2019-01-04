import {select, update, insert} from "./dynsequel";

describe('dynsequel/select', () => {

    it('Should support different more complex use cases', () => {
        // Value mapping
        select({
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
        select({
            sql: 'select * from foo',
            constraints: [
                ['bar in ', () => {
                   return  {
                        sql: 'select id from barror',
                        constraints: [
                            ['baz = ?', 1],
                            ['bur = ?', 5]
                        ]
                    };
                }]
            ]
        });

        // Joins
        select({
            sql: 'select * from foo join bar on foo.a = bar.a',
            constraints: [
                ['bar.baz = ?', 'fozzez']
            ]
        });

        // OR Blocks for collection
        select({
            sql: 'select * from foo',
            constraints: [
                ['type = ?', ['PENDING', 'FINISHED']]
            ]
        });
    });

    it('Should support simple SQL without arguments', () => {
        expect(select({
            sql: 'SELECT * FROM foo'
        })).toEqual(['SELECT * FROM foo', []]);
    });

    it('Should support constraint without argument', () => {
        expect(select({
            sql: 'SELECT * FROM foo',
            constraints: [
                'bar IS NULL'
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar IS NULL', []]);
    });

    it('Should support simple SQL with argument', () => {
        expect(select({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', 1]
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar = ?', [1]]);
    });

    it('Should support boolean arguments', () => {
        expect(select({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', true]
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar = ?', [true]]);
        expect(select({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', false]
            ]
        })).toEqual(['SELECT * FROM foo WHERE bar = ?', [false]]);
    });

    it('Should support simple SQL with missing argument', () => {
        expect(select({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', null]
            ]
        })).toEqual(['SELECT * FROM foo', []]);
        expect(select({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', undefined]
            ]
        })).toEqual(['SELECT * FROM foo', []]);
    });

    it('Should support multiple simple constraints', () => {
        expect(select({
                sql: 'SELECT * FROM foo',
                constraints: [
                    ['bar = ?', 1],
                    ['baz = ?', 2]
                ]
            })).toEqual(['SELECT * FROM foo WHERE bar = ? AND baz = ?', [1, 2]]);
    });

    it('Should drop missing constraints when having multiple constraints', () => {
        expect(select({
                sql: 'SELECT * FROM foo',
                constraints: [
                    ['bar = ?', null],
                    ['baz = ?', 2]
                ]
            }
        )).toEqual(['SELECT * FROM foo WHERE baz = ?', [2]]);

        expect(select({
                sql: 'SELECT * FROM foo',
                constraints: [
                    ['bar = ?', 1],
                    ['baz = ?', null]
                ]
            })).toEqual(['SELECT * FROM foo WHERE bar = ?', [1]]);
    });

    it('Should support simple value mapping out of the box', () => {
        expect(select({
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
        expect(select({
            sql: 'SELECT * FROM foo',
            constraints: [
                ['bar = ?', [1, 2]]
            ]
        })).toEqual(['SELECT * FROM foo WHERE (bar = ? OR bar = ?)', [1, 2]]);
    });

    it('Should support subqueries', () => {
        expect(select({
            sql: 'select * from foo',
            constraints: [
                ['bar in ', () => {
                    return  {
                        sql: 'select id from barror',
                        constraints: [
                            ['baz = ?', 1],
                            ['bur = ?', 5]
                        ]
                    };
                }]
            ]
        })).toEqual(['select * from foo WHERE bar in (select id from barror WHERE baz = ? AND bur = ?)', [1, 5]]);
    });
});

describe('dynsequel/update', () => {

    it('Should support updating without constraints', () => {
        expect(update({
            sql: 'UPDATE foo',
            set: [
                ['bar = ?', 1]
            ]
        })).toEqual(['UPDATE foo SET bar = ?', [1]]);
    });

    it('Should support updating with constraints', () => {
        expect(update({
            sql: 'UPDATE foo',
            set: [
                ['bar = ?', 1]
            ],
            constraints: [
                ['foz = ?', 12]
            ]
        })).toEqual(['UPDATE foo SET bar = ? WHERE foz = ?', [1, 12]]);
    });

    // TODO: UPDATE x SET foo = y.bar FROM y WHERE y.baz = 'trick';
});

describe('dynsequel/insert', () => {

    it('Should support inserting', () => {
        expect(insert({
            sql: 'INSERT INTO foo',
            values: [
                ['bar', 1]
            ]
        })).toEqual(['INSERT INTO foo(bar) VALUES(?)', [1]]);
    });

});