package main

import (
	"log"
	"os"
	"os/signal"

	"github.com/open-telemetry/opamp-go/internal/examples/server/apisrv"
	"github.com/open-telemetry/opamp-go/internal/examples/server/data"
	"github.com/open-telemetry/opamp-go/internal/examples/server/opampsrv"
)

var logger = log.New(log.Default().Writer(), "[MAIN] ", log.Default().Flags()|log.Lmsgprefix|log.Lmicroseconds)

func main() {
	curDir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	logger.Println("OpAMP Server starting...")

	// Start servers
	apisrv.Start(curDir)
	opampSrv := opampsrv.NewServer(&data.AllAgents)
	opampSrv.Start()

	logger.Println("OpAMP Server running on :4321")
	logger.Println("Web UI available at http://localhost:4321")

	// Wait for interrupt signal
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	<-interrupt

	logger.Println("OpAMP Server shutting down...")
	apisrv.Shutdown()
	opampSrv.Stop()
}
