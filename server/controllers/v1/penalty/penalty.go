package penalty

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"
)

type Penalty struct{
	services * services.Services
}

func (ctrler * Penalty) GetPenalties (ctx * gin.Context){
	requestorApp, hasRequestorApp := ctx.Get("requestorApp")
	parsedRequestorApp, isRequestorAppStr := requestorApp.(string)

	if!hasRequestorApp || !isRequestorAppStr{
        httpresp.Fail400(nil, "Bad request.")
        return
    }

	if parsedRequestorApp == azuread.AdminAppClientId {
		penalties := ctrler.services.Repos.PenaltyRepository.GetPenalties()
		ctx.JSON(httpresp.Success200(gin.H{
				"penalties": penalties,
		}, "penalties has been fetched."))
		return
	}
	ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
}

func (ctrler * Penalty)UpdatePenaltySettlement(ctx *gin.Context){
	penaltyId := ctx.Param("id")
	body := SettlePenaltyBody{}
	err := ctx.Bind(&body)
	isUpdate := ctx.Query("isUpdate")

	if isUpdate == "true"{
		err := ctrler.services.Repos.PenaltyRepository.UpdateSettlement(penaltyId, body.Proof, body.Remarks)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("UpdateSettlement"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))
		return
	}
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.services.Repos.PenaltyRepository.MarkAsSettled(penaltyId, body.Proof, body.Remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("	MarkAsSettled"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))

}
func (ctrler * Penalty)AddPenalty(ctx * gin.Context){
    penalty := model.Penalty{}
	ctx.ShouldBindBodyWith(&penalty, binding.JSON)
	addErr := ctrler.services.Repos.PenaltyRepository.AddPenalty(penalty)
	if addErr!= nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Penalty has been added."))
}
func (ctrler * Penalty)UpdatePenalty(ctx * gin.Context){
    penalty := model.Penalty{}
	ctx.ShouldBindBodyWith(&penalty, binding.JSON)
	addErr := ctrler.services.Repos.PenaltyRepository.UpdatePenalty(penalty)
	if addErr!= nil {
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
			return
	}
	ctx.JSON(httpresp.Success200(nil, "Penalty has been added."))
}
func(ctrler * Penalty)GetBill(ctx * gin.Context){
	id := ctx.Param("id")
	browser, err := browser.NewBrowser()

	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewBrowserErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	page, err := browser.Goto(fmt.Sprintf("http://localhost:5200/billing/penalty/%s",  id))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GotoErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	
	err = page.WaitLoad()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("waitLoadErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("PDFError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}
func NewPenaltyController(services * services.Services) PenaltyController {
	return &Penalty{
			services: services,
	}

}
type PenaltyController interface {
	GetPenalties (ctx * gin.Context)
	UpdatePenaltySettlement(ctx *gin.Context)
	AddPenalty( ctx * gin.Context)
	UpdatePenalty( ctx * gin.Context)
	NewClassfication(ctx * gin.Context) 
	GetPenaltyClasses(ctx * gin.Context)
	UpdatePenaltyClass(ctx * gin.Context)
	DeletePenaltyClass(ctx * gin.Context)
	GetBill(ctx * gin.Context)
}