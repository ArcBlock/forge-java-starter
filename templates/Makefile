TOP_DIR=../
README=$(TOP_DIR)/README.md
ENV_FILE=.env
VERSION=$(strip $(shell cat version))

run-client:
	@echo "Running the client..."
	@yarn start:client

run-server:
	@echo "starting server..."
	@git -C ./server pull --rebase
	@ENV_FILE=.env ./server/gradlew bootRun -p ./server/


.PHONY: build init travis-init install dep pre-build post-build all test doc precommit travis clean watch run bump-version create-pr
