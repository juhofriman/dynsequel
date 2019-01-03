interface DynsequelDSL {
    sql: string;
    constraints?: Constraint[];
    end?: string;
}

type Constraint = [string, any?, any?] | string;

function appendConstraintsToSQL(sql: string, constraints: Constraint[]): string {
    if (constraints.length === 0) {
        return sql;
    }
    return sql + ' WHERE ' + constraints.map(constraint => {
        if(typeof(constraint) === 'string') {
            return constraint;
        }
        return constraint[0];
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
        return value !== null && value !== undefined;
    });
    return [appendConstraintsToSQL(params.sql, evaluatedConstraints),
        evaluatedConstraints
            .filter(constraint => typeof(constraint) !== 'string')
            .map((constraint) => {
                if(typeof(constraint) === 'string') {
                    return null;
                }
                const [_, value, mapping] = constraint;
                if (mapping) {
                    return mapping[value];
                }
                return value;
            })]
}