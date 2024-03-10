package clientlog

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

type ClientLogController interface {
	GetClientLogs(ctx * gin.Context)
}
type ClientLog struct {
	services * services.Services
}
func (ctrler * ClientLog) GetClientLogs(ctx * gin.Context){
	filter := NewFilter(ctx)
	filter.Filter.ExtractFilter(ctx)
	logs,metadata, err := ctrler.services.Repos.ClientLogRepository.GetLogs(&repository.ClientLogFilter{
		From: filter.From,
		To: filter.To,
		Filter: filter.Filter,
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetLogsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"clientLogs": logs,
		"metadata": metadata,
	}, "Client logs fetched."))
}
func NewClientLogController (services * services.Services) ClientLogController {
	return &ClientLog{
		services: services,
	}
}