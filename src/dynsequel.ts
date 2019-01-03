interface DynsequelDSL {
    sql: string;
    constraints?: Constraint[];
    end?: string;
}

type Constraint = [string, any, any?] | string;

function appendConstraintsToSQL(sql: string, constraints: Constraint[]): string {
    if (constraints.length === 0) {
        return sql;
    }
    return sql + ' WHERE ' + constraints.map(constraint => {
        if(typeof(constraint) === 'string') {
            return constraint;
        }
        const [clause, value] = constraint;
        if(value instanceof Array) {
            return '(' + value.map(() => clause).join(' OR ') + ')';
        }
        return clause;
    }).join(' AND ');
}

function defaults(params: DynsequelDSL): DynsequelDSL {
    if (!params.constraints) {
        params.constraints = [];
    }
    return params;
}

export function dynsequel(params: DynsequelDSL): [string, any[]] {
    params = defaults(params);
    const evaluatedConstraints = params.constraints.filter((constraint) => {
        if (typeof(constraint) === 'string') {
            return true;
        }
        const [_, value] = constraint;
        if(value instanceof Array) {
            //
        }
        return value !== null && value !== undefined;
    });
    return [appendConstraintsToSQL(params.sql, evaluatedConstraints),
        evaluatedConstraints
            .filter(constraint => typeof(constraint) !== 'string')
            .reduce((acc, constraint) => {
                if(typeof(constraint) === 'string') {
                    return acc;
                }
                const [_, value, mapping] = constraint;
                if(value instanceof Array) {
                    acc.push(...value);
                } else if (mapping) {
                    acc.push(mapping[value]);
                } else {
                    acc.push(value)
                }
                return acc;
            }, [])
    ]
}