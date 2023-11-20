package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)



func GameRoutes(router * gin.RouterGroup) {
	ctrler := NewGameController()
	router.GET("", middlewares.BlockRequestFromClientApp, ctrler.GetGames)
	router.POST("",middlewares.ValidateBody[GameBody], middlewares.BlockRequestFromClientApp, ctrler.NewGame)
}