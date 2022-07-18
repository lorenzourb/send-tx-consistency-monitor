SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

export GOPATH := $(HOME)/go
export GOBIN  := $(HOME)/go/bin

.PHONY: help build docker
help: ## View help information
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build:
	go install go.k6.io/xk6/cmd/xk6@latest 
	$(GOBIN)/xk6 build --with github.com/grafana/xk6-output-prometheus-remote 

docker:
	[ "$(BC_NODETYPE)" = "fullnode" ] && BC_VERSION=$(BC_FULLNODE_VERSION) || BC_VERSION=$(BC_LIGHTNODE_VERSION)
	[ "$(BC_NETWORK)" = "prod" ] && BC_TAG=mainnet || BC_TAG=$(BC_NETWORK)
	docker build --pull -t k6 -f Dockerfile .
