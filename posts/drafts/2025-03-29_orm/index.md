---
title: SQLAlchemy ORM
desc: |
    This article's topic is about database, orm and python.
tags:
  - orm
  - sqlalchemy
  - python
---


My problem was:

I wanted to add a column to my ORM Table Representation, based on a SQL query.
And that new columns, I wanted it to be part of my ORM Object definition.

like in this post: https://stackoverflow.com/questions/23553332/add-column-to-query-return-inside-mapped-class-in-sqlalchemy


I tried hybrid_property, column_property, query_selection.
the doc mke a ref to : https://docs.sqlalchemy.org/en/20/orm/mapped_sql_expr.html
The different possible options.

But wich one  to use ?

I started with "with expression"
but I had to stop because there was a caveat with it (https://docs.sqlalchemy.org/en/20/orm/queryguide/columns.html#loading-arbitrary-sql-expressions-onto-objects) -> look for caveat in this page and explain it

I finally used propetry 

## Conclusion
And just like that, we've build our opentelemetry stack.

honorable mention;: column property with self reference https://github.com/sqlalchemy/sqlalchemy/discussions/7210