package system

import (
	"slim-app/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SystemRoutes(router *gin.RouterGroup) {
	ctrler := NewSystemConctroller()
	router.GET("/modules", ctrler.GetModules)
	router.POST("/roles", middlewares.ValidateBody[RoleBody], ctrler.CreateRole)
	router.PUT("/roles/:id", middlewares.ValidateBody[RoleBody], ctrler.UpdateRole)
	router.GET("/roles", ctrler.GetRoles)
}
