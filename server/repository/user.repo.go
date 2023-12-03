package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type User struct {
	db * sqlx.DB
}
func NewUserRepository () UserRepository {
	return &User{
		db : db.Connect()}
}
type UserRepository interface {
	GetUserTypes() ([]model.UserType, error)
	GetUserProgramsAndStrands()([]model.UserProgramOrStrand, error) 
	GetUserTypesToMap() (map[int]model.UserType, error)
	GetUserProgramsAndStrandsToMap()(map[int]model.UserProgramOrStrand,error)
	
}

func (repo * User)GetUserTypes()([]model.UserType, error) {
	types := make([]model.UserType, 0)
	err := repo.db.Select(&types,"SELECT id, name from system.user_type")
	return types, err
}
func (repo * User)GetUserProgramsAndStrands()([]model.UserProgramOrStrand,error){
	programs := make([]model.UserProgramOrStrand, 0)
	err := repo.db.Select(&programs,"SELECT id, code, name from system.user_program")
	return programs, err
}
func (repo * User)GetUserTypesToMap() (map[int]model.UserType, error){
	typesMap := make(map[int]model.UserType, 0)
	types, err := repo.GetUserTypes()
	if err != nil {
		return typesMap, err
	}
	for _, t := range types {
		typesMap[t.Id] = t
	}
	return typesMap, nil
}
func (repo * User)GetUserProgramsAndStrandsToMap()(map[int]model.UserProgramOrStrand,error){
	programsMap := make(map[int]model.UserProgramOrStrand, 0)
	programs := make([]model.UserProgramOrStrand, 0)
	err := repo.db.Select(&programs,"SELECT id, code, name from system.user_program")
	if err != nil {
		return programsMap, err
	}
	for _, program := range programs {
		programsMap[program.Id] = program
	}
	return programsMap, nil
}