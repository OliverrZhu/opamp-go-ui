package apis

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/open-telemetry/opamp-go/internal"
	"github.com/open-telemetry/opamp-go/internal/examples/server/data"
	"github.com/open-telemetry/opamp-go/protobufs"
)

type APIHandler struct {
	mu sync.Mutex
}

func NewAPIHandler() *APIHandler {
	return &APIHandler{}
}

func (h *APIHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/agents", h.handleAgentsAPI)
	mux.HandleFunc("/api/agent/", h.handleAgentAPI)
	mux.HandleFunc("/api/save_config", h.saveCustomConfigForInstance)
	mux.HandleFunc("/api/rotate_client_cert", h.rotateInstanceClientCert)
	mux.HandleFunc("/api/health", h.healthCheck)
}

func (h *APIHandler) healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (h *APIHandler) handleAgentsAPI(w http.ResponseWriter, r *http.Request) {
	agentsMap := data.AllAgents.GetAllAgentsReadonlyClone()

	// Convert the map to a slice of agents
	agents := make([]*data.Agent, 0, len(agentsMap))
	for _, agent := range agentsMap {
		agents = append(agents, agent)
	}

	writeJSONResponse(w, agents)
}

func (h *APIHandler) handleAgentAPI(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	instanceID := pathParts[3]

	uid, err := uuid.Parse(instanceID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	agent := data.AllAgents.GetAgentReadonlyClone(data.InstanceId(uid))
	if agent == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	writeJSONResponse(w, agent)
}

func (h *APIHandler) saveCustomConfigForInstance(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	uid, err := uuid.Parse(r.Form.Get("instanceid"))
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	instanceId := data.InstanceId(uid)
	agent := data.AllAgents.GetAgentReadonlyClone(instanceId)
	if agent == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	configStr := r.PostForm.Get("config")
	config := &protobufs.AgentConfigMap{
		ConfigMap: map[string]*protobufs.AgentConfigFile{
			"": {Body: []byte(configStr)},
		},
	}

	notifyNextStatusUpdate := make(chan struct{}, 1)
	data.AllAgents.SetCustomConfigForAgent(instanceId, config, notifyNextStatusUpdate)

	// Wait for up to 5 seconds for a Status update
	timer := time.NewTicker(time.Second * 5)
	select {
	case <-notifyNextStatusUpdate:
	case <-timer.C:
	}

	w.WriteHeader(http.StatusOK)
}

func (h *APIHandler) rotateInstanceClientCert(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	uid, err := uuid.Parse(r.Form.Get("instanceid"))
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	instanceId := data.InstanceId(uid)
	agent := data.AllAgents.GetAgentReadonlyClone(instanceId)
	if agent == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	certificate, err := internal.CreateTLSCert("../../certs/certs/ca.cert.pem", "../../certs/private/ca.key.pem")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)
		return
	}

	offers := &protobufs.ConnectionSettingsOffers{
		Opamp: &protobufs.OpAMPConnectionSettings{
			Certificate: certificate,
		},
	}

	data.AllAgents.OfferAgentConnectionSettings(instanceId, offers)
	w.WriteHeader(http.StatusOK)
}

func writeJSONResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}
