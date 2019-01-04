
interface DynsequelDSLSelect {
    sql: string;
    constraints?: Constraint[];
    end?: string;
}

function selectDefaults(params: DynsequelDSLSelect): DynsequelDSLSelect {
    if(!params.constraints) {
        params.constraints = [];
    }
    return params;
}

interface DynsequelDSLUpdate {
    sql: string;
    set: Constraint[];
    constraints?: Constraint[];
    end?: string;
}

function updateDefaults(params: DynsequelDSLUpdate): DynsequelDSLUpdate {
    if(!params.constraints) {
        params.constraints = [];
    }
    return params;
}

interface DynsequelDSLInsert {
    sql: string;
    values: Constraint[];
    end?: string;
}

function insertDefaults(params: DynsequelDSLInsert): DynsequelDSLInsert {
    return params;
}

type Constraint = [string, (() => DynsequelDSLSelect)] | [string, any, any?] | string;

function filterConstraints(constraints: Constraint[]): Constraint[] {
    return constraints.filter((constraint) => {
        if (typeof(constraint) === 'string') {
            return true;
        }
        const [_, value] = constraint;
        if(value instanceof Array) {
            //
        }
        return value !== null && value !== undefined;
    });
}

function collectConstrainValues(constraints: Constraint[]): any[] {
    return constraints
        .filter(constraint => typeof(constraint) !== 'string')
        .reduce((acc, constraint) => {
            if(typeof(constraint) === 'string') {
                return acc;
            }
            const [_, value, mapping] = constraint;
            if(value instanceof Function) {
                acc.push(...select(value())[1]);
            } else if(value instanceof Array) {
                acc.push(...value);
            } else if (mapping) {
                acc.push(mapping[value]);
            } else {
                acc.push(value)
            }
            return acc;
        }, [])
}

function appendConstraintsToSQL(sql: string, constraints: Constraint[]): string {
    if (constraints.length === 0) {
        return sql;
    }
    return sql + ' WHERE ' + constraints.map(constraint => {
        if(typeof(constraint) === 'string') {
            return constraint;
        }
        const [clause, value] = constraint;
        if(value instanceof Function) {
            return clause + '(' + select(value())[0] + ')';
        }
        if(value instanceof Array) {
            return '(' + value.map(() => clause).join(' OR ') + ')';
        }
        return clause;
    }).join(' AND ');
}

export function insert(params: DynsequelDSLInsert): [string, any[]] {
    params = insertDefaults(params);
    const sqlkeys = params.values.map(constraint => {
        if(typeof(constraint) === 'string') {
            // this can't work here
            return constraint;
        }
        return constraint[0];
    }).join(', ');
    const placeholders = params.values.map(_ => '?').join(', ');
    return [
        params.sql + '(' + sqlkeys + ') VALUES(' + placeholders + ')',
        collectConstrainValues(params.values)
    ];
}

export function update(params: DynsequelDSLUpdate): [string, any[]] {
    params = updateDefaults(params);
    const evaluatedConstraints = filterConstraints(params.constraints);
    const sql = params.sql + ' SET ' + params.set.map((constraint) => {
        if(typeof(constraint) === 'string') {
            return constraint;
        }
        return constraint[0];
    }).join(', ');
    return [
        appendConstraintsToSQL(sql, evaluatedConstraints),
        collectConstrainValues(params.set).concat(collectConstrainValues(evaluatedConstraints))
    ];
}

export function select(params: DynsequelDSLSelect): [string, any[]] {
    params = selectDefaults(params);
    const evaluatedConstraints = filterConstraints(params.constraints);
    return [
        appendConstraintsToSQL(params.sql, evaluatedConstraints),
        collectConstrainValues(evaluatedConstraints)
    ];
}