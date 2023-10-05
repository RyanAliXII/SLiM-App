package book

import (
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gocarina/gocsv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
)

type BookController struct {
	bookRepository repository.BookRepositoryInterface
	accessionRepo repository.AccessionRepository
	recordMetadataRepo repository.RecordMetadataRepository
}

func (ctrler *BookController) NewBook(ctx *gin.Context) {
	var book = model.Book{}
	err := ctx.ShouldBindBodyWith(&book, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid body."))
		return 
	}
	fmt.Println(book)
	_, newBookErr := ctrler.bookRepository.New(book)
	if newBookErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "New book added."))
}
func (ctrler * BookController) ImportBooks(ctx * gin.Context) {
	fileHeader, fileHeaderErr := ctx.FormFile("file")
	sectionId := ctx.PostForm("sectionId")
	parsedSectionId, err := strconv.Atoi(sectionId)
	if err != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid sectionId"))
		return 
	}
	if fileHeaderErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "No files uploaded."))
		return
	}
	file, fileErr := fileHeader.Open()
	if fileErr != nil {
		file.Close()
		logger.Error(fileErr.Error(), slimlog.Function("BookController.ImportBooks"), slimlog.Error("fileErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	defer file.Close()
	booksImports := make([]model.BookImport, 0)
	bytesFile, toBytesErr := io.ReadAll(file)

	if toBytesErr != nil {
		logger.Error(toBytesErr.Error(), slimlog.Function("BookController.ImportBook"), slimlog.Error("toBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	gocsv.SetCSVReader(func(in io.Reader) gocsv.CSVReader {
		return gocsv.LazyCSVReader(in)
	})
	parseErr := gocsv.UnmarshalBytes(bytesFile, &booksImports)

	if parseErr != nil {
		
		csvParseErr, isParseErr := parseErr.(*csv.ParseError);
		
		if isParseErr {
			message := "There's a problem with the value."
			numErr, isNumError := csvParseErr.Err.(*strconv.NumError)
			if isNumError  {
				message = fmt.Sprintf("Expected value is numerical. Given value: %s", numErr.Num)
			}
			ctx.JSON(httpresp.Fail400(gin.H{
				"errors": gin.H{
					"row": csvParseErr.Line,
					"column": csvParseErr.Column,
					"message": message,
					
				},
			}, "Invalid CSV structure or format."))
			return
		} 
		logger.Error(parseErr.Error(), slimlog.Function("BookController.ImportBook"), slimlog.Error("parseErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.bookRepository.ImportBooks(booksImports, parsedSectionId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ImportBooksErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}	
	
}
func (ctrler *BookController) GetBooks(ctx *gin.Context) {


	var books []model.Book = make([]model.Book, 0)
	filter := filter.ExtractFilter(ctx)
	books = ctrler.bookRepository.Get(filter)
	metadata, metaErr := ctrler.recordMetadataRepo.GetBookMetadata(30) // group rows by 30
	if metaErr != nil {
		logger.Error(metaErr.Error(), slimlog.Error("GetBookMetadataErr"))
		 ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		 return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"books": books,
		"metadata": metadata, 
	}, "Books fetched."))
}

func (ctrler *BookController) GetBookById(ctx *gin.Context) {
	id := ctx.Param("id")

	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	var book model.Book = ctrler.bookRepository.GetOne(id)
	if len(book.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Book not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"book": book,
	}, "Book fetched."))
}
func (ctrler *BookController) GetAccession(ctx *gin.Context) {
	accessions := ctrler.accessionRepo.GetAccessions()
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accession Fetched."))
}

func (ctrler *BookController) UpdateBook(ctx *gin.Context) {
	body := model.Book{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid body."))
		return 
	}
	updateErr := ctrler.bookRepository.Update(body)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail(500, nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Book updated."))
}

func (ctrler *BookController) GetAccessionByBookId(ctx *gin.Context) {
	id := ctx.Param("id")
	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	var	accessions []model.Accession; 
	ignoreWeeded := ctx.Query("ignoreWeeded")
    if ignoreWeeded == "false"{
          accessions = ctrler.accessionRepo.GetAccessionsByBookIdDontIgnoreWeeded(id)
	}else{
		accessions = ctrler.accessionRepo.GetAccessionsByBookId(id)
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accessions successfully fetched for specific book."))
}

func (ctrler *BookController) UploadBookCover(ctx *gin.Context) {
	body := BookCoverUploadBody{}

	bindErr := ctx.ShouldBind(&body)

	if bindErr != nil {
		logger.Error(bindErr.Error())
		ctx.JSON(httpresp.Fail400(nil, "Invalid request body."))
		return
	}

	_, parseIdErr := uuid.Parse(body.BookId)
	if parseIdErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	uploadErr := ctrler.bookRepository.NewBookCover(body.BookId, body.Covers)
	if uploadErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers uploaded."))
}
func (ctrler *BookController) UpdateBookCover(ctx *gin.Context) {
	body := BookCoverUploadBody{}

	bindErr := ctx.ShouldBind(&body)
	if bindErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid request body."))
		return
	}
	_, parseIdErr := uuid.Parse(body.BookId)
	if parseIdErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	updateCoverErr := ctrler.bookRepository.UpdateBookCover(body.BookId, body.Covers)
	if updateCoverErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers updated."))
}
func (ctrler * BookController) DeleteBookCovers(ctx * gin.Context){
	bookId := ctx.Param("bookId")
	_, parseIdErr := uuid.Parse(bookId)
	if parseIdErr != nil {
		logger.Error(parseIdErr.Error(), slimlog.Error("parseIdErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	deleteCoverErr := ctrler.bookRepository.DeleteBookCoversByBookId(bookId)
	if deleteCoverErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers deleted."))
}

 func (ctrler *  BookController) UpdateAccessionStatus(ctx * gin.Context) {
	id := ctx.Param("id")
	status, err := strconv.Atoi(ctx.Query("action"))
	const (
		weed = 1
		recirculate = 2
	)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	}
	switch(status){
		case weed: 
			ctrler.handleWeeding(id, ctx);
			return
		case recirculate: 
			ctrler.handleRecirculation(id, ctx)
			return 
	}
   ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))

 }
 func(ctrler * BookController) handleWeeding (id string, ctx * gin.Context ){
    body := WeedingBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
    err := ctrler.accessionRepo.WeedAccession(id, body.Remarks)
    if err != nil {
	 logger.Error(err.Error(), slimlog.Error("weedingErr"))
	 ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	 return
   }
	ctx.JSON(httpresp.Success200(nil, "Book weeded successfully."))
 }
 func(ctrler * BookController) handleRecirculation ( id string,  ctx * gin.Context ){
	 
	 err := ctrler.accessionRepo.Recirculate(id)
	if err != nil {
	  logger.Error(err.Error(), slimlog.Error("recirculateErr"))
	  ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	  return
	}
	 ctx.JSON(httpresp.Success200(nil, "Book re-circulated successfully."))
}

func(ctrler * BookController)AddBookCopies(ctx * gin.Context){
	id := ctx.Param("id")
	body := AddBookCopyBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.bookRepository.AddBookCopies(id, body.Copies)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("addBookCopiesErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "New copies added."))
}
 
func NewBookController() BookControllerInterface {
	return &BookController{
		bookRepository: repository.NewBookRepository(),
		accessionRepo: repository.NewAccessionRepository(),
		recordMetadataRepo: repository.NewRecordMetadataRepository(repository.RecordMetadataConfig{
			CacheExpiration: time.Minute * 5,
		}),
	}
}

type BookControllerInterface interface {
	GetBooks(ctx *gin.Context)
	NewBook(ctx *gin.Context)
	GetAccession(ctx *gin.Context)
	GetBookById(ctx *gin.Context)
	UpdateBook(ctx *gin.Context)
	GetAccessionByBookId(ctx *gin.Context)
	UploadBookCover(ctx *gin.Context)
	UpdateBookCover(ctx *gin.Context)
	DeleteBookCovers (ctx * gin.Context)
	UpdateAccessionStatus(ctx * gin.Context) 
	AddBookCopies(ctx * gin.Context)
	ImportBooks(ctx * gin.Context)
}
