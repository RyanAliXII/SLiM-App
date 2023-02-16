package book

import (
	"time"
)

type MetaData struct {
	Id   int    `json:"id" binding:"required,min=1"`
	Name string `json:"name" binding:"required,gte=0"`
}

type BookBody struct {
	Id            string      `json:"id" `
	Title         string      `json:"title" binding:"required,min=1,max=150"`
	Description   string      `json:"description" `
	ISBN          string      `json:"isbn"  binding:"required,min=1,max=150,isbn"`
	Copies        int         `json:"copies" binding:"required,gte=1"`
	Pages         int         `json:"pages" binding:"required,gte=1"`
	Section       MetaData    `json:"section"  binding:"required,gte=1,dive"`
	Publisher     MetaData    `json:"publisher"  binding:"required,dive"`
	FundSource    MetaData    `json:"fundSource" binding:"required,dive"`
	CostPrice     float32     `json:"costPrice"  binding:"gte=0"`
	Edition       int         `json:"edition" binding:"gte=0" `
	YearPublished int         `json:"yearPublished"  binding:"required"`
	DDC           float64     `json:"ddc"  binding:"gte=0,lt=1000"`
	AuthorNumber  string      `json:"authorNumber" binding:"required,min=1,max=50"`
	ReceivedAt    time.Time   `json:"receivedAt" binding:"required"`
	Authors       AuthorsBody `json:"authors" binding:"dive"`
}

type AuthorsBody []struct {
	Id         int    `json:"id" db:"id" binding:"required,min=1"`
	GivenName  string `json:"givenName" db:"given_name" binding:"required,max=100,min=1"`
	MiddleName string `json:"middleName" db:"middle_name"`
	Surname    string `json:"surname" db:"surname" binding:"required,max=100,min=1"`
}
