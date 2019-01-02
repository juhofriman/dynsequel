import {dynsequel} from "./dynsequel";

describe('dynsequel.ts', () => {

    it('Should support simple SQL without arguments', () => {
        expect(dynsequel({sql: 'SELECT * FROM foo'}))
            .toEqual(['SELECT * FROM foo', []]);
    });

    it('Should support simple SQL with argument', () => {
        expect(dynsequel({sql: 'SELECT * FROM foo'}, ['bar = ?', 1]))
            .toEqual(['SELECT * FROM foo WHERE bar = ?', [1]]);
    });

    it('Should support boolean arguments', () => {
        expect(dynsequel({sql: 'SELECT * FROM foo'}, ['bar = ?', true]))
            .toEqual(['SELECT * FROM foo WHERE bar = ?', [true]]);
        expect(dynsequel({sql: 'SELECT * FROM foo'}, ['bar = ?', false]))
            .toEqual(['SELECT * FROM foo WHERE bar = ?', [false]]);
    });

    it('Should support simple SQL with missing argument', () => {
        expect(dynsequel({sql: 'SELECT * FROM foo'}, ['bar = ?', null]))
            .toEqual(['SELECT * FROM foo', []]);
        expect(dynsequel({sql: 'SELECT * FROM foo'}, ['bar = ?', undefined]))
            .toEqual(['SELECT * FROM foo', []]);
    });

    it('Should support multiple simple constraints', () => {
        expect(dynsequel({sql: 'SELECT * FROM foo'},
            ['bar = ?', 1],
            ['baz = ?', 2]))
            .toEqual(['SELECT * FROM foo WHERE bar = ? AND baz = ?', [1, 2]]);
    });

    it('Should drop missing constraints when having multiple constraints', () => {
        expect(dynsequel({sql: 'SELECT * FROM foo'},
            ['bar = ?', null],
            ['baz = ?', 2]))
            .toEqual(['SELECT * FROM foo WHERE baz = ?', [2]]);

        expect(dynsequel({sql: 'SELECT * FROM foo'},
            ['bar = ?', 1],
            ['baz = ?', null]))
            .toEqual(['SELECT * FROM foo WHERE bar = ?', [1]]);
    });

});