package repository

import "github.com/jmoiron/sqlx"

type Repositories struct {
	AuthorRepository AuthorRepositoryInterface
}

func NewRepositories(db *sqlx.DB) Repositories {
	return Repositories{
		AuthorRepository: NewAuthorRepository(db),
	}
}
