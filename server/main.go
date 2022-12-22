package main

import (
	"net/http"
	"os"

	"slim-app/server/app/db"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/app/repository"
	"slim-app/server/app/src/v1"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

var logger *zap.Logger = slimlog.GetInstance()

func main() {
	envErr := godotenv.Load()
	if envErr != nil {
		panic(envErr.Error())
	}

	SPA_ADMIN := os.Getenv("SPA_ADMIN_URL")
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(CustomLogger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{SPA_ADMIN},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Hello from server",
		})
	})

	db := db.Connect()
	repos := repository.NewRepositories(db)
	src.RegisterRoutesV1(r, &repos)
	logger.Info("Server starting")
	r.Run(":5200")

}

func CustomLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()
		method := ctx.Request.Method
		statusCode := ctx.Writer.Status()
		clientIP := ctx.ClientIP()

		path := ctx.Request.URL.Path
		if ctx.Writer.Status() >= 500 {
			logger.Error("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP))
		} else {
			logger.Info("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP))
		}
	}
}
