package model

import (
	"database/sql/driver"
	"encoding/json"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type Account struct {
	Id          string          `json:"id" db:"id" csv:"id" validate:"required,uuid"`
	DisplayName string          `json:"displayName" db:"display_name" csv:"display_name"`
	GivenName   string          `json:"givenName" db:"given_name" csv:"given_name"`
	Surname     string          `json:"surname" db:"surname" csv:"surname"`
	Email       string          `json:"email" db:"email" csv:"email" validate:"required"`
	ProfilePicture string 		`json:"profilePicture" db:"profile_picture"`
	UserType string `json:"userType" db:"user_type"`
	ProgramName string `json:"programName" db:"program_name"`
	ProgramCode string `json:"programCode" db:"program_code"`
	AccountMetadata AccountMetadata `json:"metadata" db:"metadata"`
	IsActive 	 bool `json:"isActive" db:"is_active"`
	IsDeleted 	 bool `json:"isDeleted" db:"is_deleted"`
	CreatedAt   db.NullableTime `json:"-" db:"created_at"`
	UpdatedAt   db.NullableTime `json:"-" db:"updated_at"`
}

type AccountJSON struct {
	Account
}

type AccountRoles []struct {
	Account AccountJSON `json:"account" db:"account"`
	Role    RoleJSON    `json:"role" db:"role"`
}

func (account *AccountJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := AccountJSON{
		Account: Account{},
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, account)
		if unmarshalErr != nil {
			*account = INITIAL_DATA_ON_ERROR
		}
	} else {
		*account = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (account AccountJSON) Value(value interface{}) (driver.Value, error) {
	return account, nil
}


type AccountMetadata struct {
	TotalPenalty float64 `json:"totalPenalty"`
	CheckedOutBooks int `json:"checkedOutBooks"`
	ReturnedBooks int `json:"returnedBooks"`
	PendingBooks int `json:"pendingBooks"`
	ApprovedBooks int `json:"approvedBooks"`
	CancelledBooks int `json:"cancelledBooks"`
}
func (meta *AccountMetadata) Scan(value interface{}) error {
	val, valid := value.([]byte)
	INITIAL_DATA_ON_ERROR := AccountMetadata{
		TotalPenalty: 0,
	}
	if valid {
		unmarshalErr := json.Unmarshal(val, meta)
		if unmarshalErr != nil {
			*meta = INITIAL_DATA_ON_ERROR
		}
	} else {
		*meta = INITIAL_DATA_ON_ERROR
	}
	return nil

}
func (meta AccountMetadata) Value(value interface{}) (driver.Value, error) {
	return meta, nil
}


type AccountActivation struct {
	Email string `json:"email" csv:"email"`
	GivenName string `json:"givenName" csv:"given_name"`
	Surname string	`json:"surname" csv:"surname"`
	StudentNumber string `json:"studentNumber" csv:"student_number"`
	UserType int `json:"userType" csv:"user_type"`
	Program string `json:"program" csv:"program"`
	ProgramId int `json:"programId"`
	ActiveUntil string `json:"activeUntil"`
}