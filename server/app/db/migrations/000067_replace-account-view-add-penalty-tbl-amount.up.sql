DROP VIEW IF EXISTS account_view;
CREATE OR REPLACE VIEW account_view as 
SELECT account.id, email, display_name, given_name, surname,
json_build_object('totalPenalty', COALESCE(SUM(bbv.penalty), 0 ) + COALESCE(SUM(obbv.penalty), 0) + COALESCE(SUM(penalty_tbl.total), 0), 
'walkInCheckedOutBooks', COALESCE(walk_in_checked_out.total, 0),
'walkInReturnedBooks', COALESCE(walk_in_returned.total, 0),
'onlinePendingBooks', COALESCE(online_pending.total, 0),
'onlineApprovedBooks', COALESCE(online_approved.total, 0),
'onlineCheckedOutBooks', COALESCE(online_checked_out.total, 0),
'onlineReturnedBooks', COALESCE(online_returned.total, 0),	
'onlineCancelledBooks', COALESCE(online_cancelled.total, 0)
)
 as meta_data, 
 search_vector 
 FROM system.account 
LEFT JOIN borrowed_book_view as bbv on account.id = bbv.account_id and bbv.returned_at is null
LEFT JOIN  online_borrowed_book_view as obbv on account.id = obbv.account_id and obbv.status = 'checked-out'
LEFT JOIN (
	SELECT SUM(amount) as total , account_id FROM circulation.penalty where settled_at is null GROUP BY account_id 
) as penalty_tbl on account.id = penalty_tbl.account_id
LEFT JOIN 
(
	SELECT account_id, COUNT(*) as total FROM circulation.borrowed_book as cbb
	INNER JOIN circulation.borrow_transaction as cbt on transaction_id =  cbt.id
	where cbb.returned_at is null 
	GROUP BY account_id
) as walk_in_checked_out on account.id = walk_in_checked_out.account_id
LEFT JOIN 
(
	SELECT account_id, COUNT(*) as total FROM circulation.borrowed_book as cbb
	INNER JOIN circulation.borrow_transaction as cbt on transaction_id =  cbt.id
	where cbb.returned_at is not null
	GROUP BY account_id
) as walk_in_returned on account.id = walk_in_returned.account_id
LEFT JOIN 
(
	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
	where status = 'pending'
	GROUP BY account_id
) as online_pending on account.id = online_pending.account_id
LEFT JOIN 
(
	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
	where status = 'approved'
	GROUP BY account_id
) as online_approved on account.id = online_approved.account_id
LEFT JOIN 
(
	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
	where status = 'checked-out'
	GROUP BY account_id
) as online_checked_out on account.id = online_checked_out.account_id
LEFT JOIN 
(
	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
	where status = 'returned'
	GROUP BY account_id
) as online_returned on account.id = online_returned.account_id
LEFT JOIN 
(
	SELECT account_id, COUNT(*) as total from circulation.online_borrowed_book
	where status = 'cancelled'
	GROUP BY account_id
) as online_cancelled on account.id = online_cancelled.account_id
GROUP BY account.id, 
walk_in_checked_out.account_id,
walk_in_checked_out.total, 
walk_in_returned.total,
walk_in_returned.account_id,
online_pending.account_id,
online_pending.total,
online_approved.account_id,
online_approved.total,
online_checked_out.account_id,
online_checked_out.total,
online_returned.account_id,
online_returned.total,
online_cancelled.account_id,
online_cancelled.total

