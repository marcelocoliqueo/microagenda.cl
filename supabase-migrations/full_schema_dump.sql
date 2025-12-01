-- Full Schema Audit Script
-- Run this to get a complete list of all tables, columns, and their types
-- This helps identify if any migration was missed from the beginning of time

SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable
FROM 
    information_schema.tables t
JOIN 
    information_schema.columns c ON t.table_name = c.table_name
WHERE 
    t.table_schema = 'public'
ORDER BY 
    t.table_name, 
    c.ordinal_position;
