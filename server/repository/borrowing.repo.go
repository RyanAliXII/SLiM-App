package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type BorrowingRepository interface {

	BorrowBook(borrowedBooks []model.BorrowedBook, borrowedEbooks []model.BorrowedEBook) error
	GetBorrowingRequests()([]model.BorrowingRequest, Metadata, error)
	MarkAsReturned(id string, remarks string) error
	MarkAsUnreturned(id string, remarks string) error 
	MarkAsApproved(id string, remarks string) error 
	MarkAsCheckedOut(id string, remarks string, dueDate db.NullableDate) error
 	GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error)
	MarkAsCancelled(id string, remarks string) error
	GetBorrowedEBookByIdAndStatus (id string, status int)(model.BorrowedBook, error)
	UpdateRemarks(id string, remarks string) error 
	CancelByIdAndAccountId(id string, accountId string) error
	GetBookStatusBasedOnClient(bookId string, accountId string,)(model.BookStatus, error)
}
type Borrowing struct{
	db * sqlx.DB

}
func (repo * Borrowing)BorrowBook(borrowedBooks []model.BorrowedBook, borrowedEbooks []model.BorrowedEBook) error{
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}

	if(len(borrowedBooks) > 0){
		_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id, due_date, penalty_on_past_due ) VALUES(:accession_id, :group_id, :account_id, :status_id, :due_date, :penalty_on_past_due)", borrowedBooks)
		if err != nil {
			transaction.Rollback()
			return err
		}
	}
	if(len(borrowedEbooks) == 0) {
		transaction.Commit()
		return nil
	} 
	_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_ebook(book_id, group_id, account_id, status_id, due_date ) VALUES(:book_id, :group_id, :account_id, :status_id, :due_date)", borrowedEbooks)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}


func (repo * Borrowing)GetBorrowingRequests()([]model.BorrowingRequest, Metadata, error){

	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(
		goqu.C("group_id").As("id"),
		goqu.C("account_id"),
		goqu.C("client"),
		goqu.L("SUM(penalty)").As("total_penalty"),
		goqu.L("COUNT(1) filter (where status_id = 1)  as total_pending"),
		goqu.L("COUNT(1) filter(where status_id = 2) as total_approved"),
		goqu.L("COUNT(1) filter (where status_id = 3) as total_checked_out"),
		goqu.L("COUNT(1) filter(where status_id = 4) as total_returned"),
		goqu.L("COUNT(1) filter(where status_id = 5) as total_cancelled"),
		goqu.L("COUNT(1) filter (where status_id = 6) as total_unreturned"),
		goqu.MAX("bbv.created_at").As("created_at"),
	).From(goqu.T("borrowed_book_all_view").As("bbv")).GroupBy("group_id", "account_id", "client").
	Order(exp.NewOrderedExpression(goqu.I("created_at"), exp.DescSortDir,exp.NoNullsSortType))
    metadata := Metadata{}
	requests := make([]model.BorrowingRequest, 0) 
	query, _ ,err := ds.ToSQL()
    if err != nil {
		return requests, metadata, err
	}
	err = repo.db.Select(&requests, query)
	return requests, metadata, err
}

func (repo * Borrowing)GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_all_view where group_id = $1`
	err := repo.db.Select(&borrowedBooks, query, groupId)
	return borrowedBooks, err
}
func (repo * Borrowing) GetBorrowedEBookByIdAndStatus (id string, status int)(model.BorrowedBook, error) {
	borrowedBook := model.BorrowedBook{}
	err := repo.db.Get(&borrowedBook, "SELECT * FROM borrowed_book_all_view WHERE id = $1 and is_ebook = true and status_id = $2", id, status)
	if err != nil {
		return borrowedBook, err
	}
	return borrowedBook,nil
}

func (repo * Borrowing)GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_all_view where account_id = $1 and status_id != 6 order by created_at desc`
	err := repo.db.Select(&borrowedBooks, query, accountId)
	return borrowedBooks, err
}
func (repo * Borrowing)GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT * FROM borrowed_book_all_view where account_id = $1 and status_id = $2 order by created_at desc`
	err := repo.db.Select(&borrowedBooks, query, accountId, statusId)
	return borrowedBooks, err
}

func(repo *Borrowing) UpdateRemarks(id string, remarks string) error {
	query := "UPDATE borrowing.borrowed_book SET  remarks = $1 where id = $2"
	_, err := repo.db.Exec(query, remarks , id)
	return err 	
}

func NewBorrowingRepository ()  BorrowingRepository {
	return &Borrowing{
		db: db.Connect(),
	}
}