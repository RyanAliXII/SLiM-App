DROP VIEW book_view;
CREATE OR REPLACE VIEW book_view as 
SELECT book.id,title, isbn, 
	description, 
	copies,
	pages,
	cost_price,
	edition,
	year_published,
	received_at,
	ddc,
	author_number,
	book.created_at,
	jsonb_build_object('id', source_of_fund.id, 'name', source_of_fund.name) as fund_source,
	jsonb_build_object('id', section.id, 'name', section.name, 'hasOwnAccession',(CASE WHEN section.accession_table is not null then true else false end), 'accessionTable', accession_table) as section,
	jsonb_build_object('id', publisher.id, 'name', publisher.name) as publisher,
	jsonb_build_object(
	'people', COALESCE((SELECT  jsonb_agg(jsonb_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
			  as authors
			  FROM catalog.book_author
			  INNER JOIN catalog.author on book_author.author_id = catalog.author.id
			  where book_id = book.id
			  group by book_id),'[]'),
		
	'organizations', COALESCE((SELECT jsonb_agg(json_build_object('id', org.id, 'name', org.name)) 
							 FROM catalog.org_book_author as oba 
							 INNER JOIN catalog.organization as org on oba.org_id = org.id 
							  where book_id = book.id group by book_id ),'[]'),
		
	'publishers', COALESCE((SELECT jsonb_agg(json_build_object('id', pub.id, 'name', pub.name)) 
						  FROM catalog.publisher_book_author as pba 
						  INNER JOIN catalog.publisher as pub on pba.publisher_id = pub.id 
						  where book_id = book.id group by book_id
						  ),'[]')
	) as authors,
	COALESCE(jsonb_agg(jsonb_build_object('id', accession.id, 'number', accession.number, 'copyNumber', accession.copy_number )), '[]') as accessions,
	COALESCE((SELECT array_agg(path) FROM catalog.book_cover where book_id = book.id), '{}') as covers,
	jsonb_build_object(
		'id', book.id,
		'title', book.title,
		'description', book.description,
		'ddc', book.ddc,
		'authorNumber', book.author_number,
		'isbn', book.isbn,
		'copies', book.copies,
		'pages', book.pages,
		'costPrice', book.cost_price,
		'edition', book.edition,
		'yearPublished', book.year_published,
		'receivedAt', book.received_at,
		'fundSource', jsonb_build_object('id', source_of_fund.id, 'name', source_of_fund.name),
		'publisher', jsonb_build_object('id', publisher.id, 'name', publisher.name),
		'section', jsonb_build_object('id', section.id, 'name', section.name),
		'createdAt',book.created_at,
		'covers', COALESCE((SELECT array_agg(path) FROM catalog.book_cover where book_id = book.id), '{}'),
		'authors', jsonb_build_object(
			'people', COALESCE((SELECT  jsonb_agg(jsonb_build_object( 'id', author.id, 'givenName', author.given_name , 'middleName', author.middle_name,  'surname', author.surname )) 
					  as authors
					  FROM catalog.book_author
					  INNER JOIN catalog.author on book_author.author_id = catalog.author.id
					  where book_id = book.id
					  group by book_id),'[]'),
				
			'organizations', COALESCE((SELECT jsonb_agg(json_build_object('id', org.id, 'name', org.name)) 
									 FROM catalog.org_book_author as oba 
									 INNER JOIN catalog.organization as org on oba.org_id = org.id 
									  where book_id = book.id group by book_id ),'[]'),
				
			'publishers', COALESCE((SELECT jsonb_agg(json_build_object('id', pub.id, 'name', pub.name)) 
								  FROM catalog.publisher_book_author as pba 
								  INNER JOIN catalog.publisher as pub on pba.publisher_id = pub.id 
								  where book_id = book.id group by book_id
								  ),'[]')
		) 
	  
	) as json_format,
	search_vector
	FROM catalog.book
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id 
	INNER JOIN get_accession_table() as accession on book.id = accession.book_id
	GROUP BY 
	book.id,
	source_of_fund.id,
	section.id,
	publisher.id