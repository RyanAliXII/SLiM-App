ALTER TABLE IF EXISTS client.account
add search_vector tsvector
generated always as (
    setweight(to_tsvector('simple', surname), 'A')   
    || ' ' ||
    setweight(to_tsvector('simple', given_name), 'B')
    || ' ' ||
    setweight(to_tsvector('simple', display_name ), 'C') 
    || ' ' ||
    setweight(to_tsvector('simple', email), 'D') :: tsvector
) stored;