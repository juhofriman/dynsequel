# DYNSEQUEL

> *A new way of constructing highly dynamic SQL Clauses.*
>
> *It's a builder, but not a builder.*

## The Problem

Constructing SQL clauses for REST endpoints can be cumbersome, because
HTTP parameters received can be optional and missing parameters shouldn't
usually affect the query constructed.

Think for instance an rest endpoint `GET /api/orders` which takes an optional 
query parameter `status`.

| Query                        | Expected result                                   |
|------------------------------|-------------------------------------------------- |
| /api/orders                  | All orders                                        |
| /api/orders?status=PENDING   | All order entities that have the status PENDING   |
| /api/orders?status=PROCESSED | All order entities that have the status PROCESSED |

Now, when you think of implementing persistence layer the endpoint, you probably will 
end up with something like following.

```typescript
fetchOrders(status?: string): Orders[] {
    if(!status) {
        return executeQuery('SELECT * FROM orders', []);
    } else {
        return executeQuery('SELECT * FROM orders WHERE status = ?', [status]);
    }
}
```

And this is perfectly fine, if you have just a couple of parameters. But what happens,
when you have lot's of parameters originating from your clients? Yes,
constructing queries become really cumbersome quickly.

Standard SQL query builders do not usually help, because they usually do not
have "null aware" semantics.

```typescript
fetchOrders(status?: string): Orders[] {
    return queryBuilder
        .from('orders')
        .where('status', '=', status)
        .execute();
}
```

When your `status` is `null` or `undefined` you will most probably
end up with a query such as `SELECT * FROM orders WHERE status = null`, and
this is not what we actually want. Not to mention that if we want to fetch all
the orders that **do not** have status, the query should be `SELECT * FROM orders WHERE status IS NULL`.

The problem is even harder, when you need to support multiple status values, such
as `GET /api/orders?status=PENDING&status=CANCELLED`.

## The Solution

Dynsequel takes a new approach of constructing highly dynamic SQL clauses by
using DSL for query construction dynamically.

*This is just an idea, not implemented yet*

```typescript
fetchOrders(status?: string): Orders[] {
    pg.manyOrNone(
        ...dysequel(
            'SELECT * FROM orders',
            ['status = ?', status]
        )
    )
}
```

Which would yield when `status` is not present:

```
['SELECT * FROM orders', []]
````

And when `status` has value `'PENDING', it would yield:

```
['SELECT * FROM orders WHERE status = ?', ['PENDING']]
````

When having support for multiple filtering values, it should work like this:

```typescript
fetchOrders(status: string[]): Orders[] {
    pg.manyOrNone(
        ...dynsequel(
            'SELECT * FROM orders',
            ['status = ?', status]
        )
    )
}
```

When `status` array is `['PENDING', 'CANCELLED']` it should yield:

```
['SELECT * FROM orders WHERE (status = ? OR status = ?)', ['PENDING', 'CANCELLED']]
````

When `status` array is `[]` it should yield:

```
['SELECT * FROM orders', []]
````

Get it? Now all we need is an implementation :P