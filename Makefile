TOP_DIR=.
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))
FORGE_HTTP_PORT=8210
FORGE_TCP_PORT=8210

build:
	@echo "Building the software..."

init: install dep
	@echo "Initializing the repo..."

travis-init:
	@echo "Initialize software required for travis (normally ubuntu software)"

install:
	@echo "Install software required for this repo..."

dep:
	@echo "Install dependencies required for this repo..."

pre-build: install dep
	@echo "Running scripts before the build..."

post-build:
	@echo "Running scripts after the build is done..."

all: pre-build build post-build

test:
	@echo "Running test suites..."

lint:
	@echo "Linting the software..."

doc:
	@echo "Building the documenation..."

precommit: dep lint doc build test

travis: precommit

travis-deploy: release
	@echo "Deploy the software by travis"

clean:
	@echo "Cleaning the build..."

run-client:
	@echo "Running the client..."
	@cd templates/
	@yarn start:client 

run-server:
	@echo "starting server..." 
	@cd templates/server
	@git submodule update
	@./templates/server/Forge-java-demo/gradlew bootRun -p ./templates/server/Forge-java-demo/  -Pargs=--forge.http.port=$(FORGE_HTTP_PORT),--forge.tcp.port=$(FORGE_TCP_PORT)


watch:
	@make build
	@echo "Watching templates and slides changes..."
	@fswatch -o src/ | xargs -n1 -I{} make build

run:
	@echo "Running the software..."

include .makefiles/*.mk

.PHONY: build init travis-init install dep pre-build post-build all test doc precommit travis clean watch run bump-version create-pr
