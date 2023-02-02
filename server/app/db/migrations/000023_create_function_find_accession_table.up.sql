CREATE OR REPLACE FUNCTION find_accession_table(table_name TEXT default 'default_accession')
RETURNS TABLE (id INTEGER, book_id uuid, copy_number INTEGER, created_at timestamptz, deleted_at timestamptz) AS $$
DECLARE
  query TEXT := format('SELECT * FROM accession.%I', COALESCE(table_name, 'default_accession'));
BEGIN
  RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;
