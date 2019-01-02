interface DynsequelDSL {
    sql: string;
}

type Constraint = [string, any];

function appendConstraintsToSQL(sql: string, constraints: Constraint[]): string {
    if(constraints.length === 0) {
        return sql;
    }
    return sql + ' WHERE ' + constraints.map(c => c[0]).join(' AND ');
}

export function dynsequel(params: DynsequelDSL, ...constraints: Constraint[]): [string, any[]] {
    const evaluatedConstraints = constraints.filter(([sql, value]) => {
        return value !== null && value !== undefined;
    });
    return [appendConstraintsToSQL(params.sql, evaluatedConstraints),
        evaluatedConstraints.map(c => c[1])]
}