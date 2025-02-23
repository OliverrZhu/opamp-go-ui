package apisrv

import (
	"context"
	"net/http"
	"path"

	"github.com/open-telemetry/opamp-go/internal/examples/server/apis"
)

var htmlDir string
var srv *http.Server

func Start(rootDir string) {
	htmlDir = path.Join(rootDir, "uisrv/html")
	mux := http.NewServeMux()

	// Initialize and register API routes
	apiHandler := apis.NewAPIHandler()
	apiHandler.RegisterRoutes(mux)

	// Static files
	fs := http.FileServer(http.Dir(htmlDir))
	mux.Handle("/", fs)

	srv = &http.Server{
		Addr:    "0.0.0.0:4321",
		Handler: mux,
	}
	go srv.ListenAndServe()
}

func Shutdown() {
	srv.Shutdown(context.Background())
}
