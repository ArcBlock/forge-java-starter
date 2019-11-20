TOP_DIR=../
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))

run-client:
	@echo "Running the client..."
	@cd ./templates && yarn start:client

.PHONY: build init travis-init install dep pre-build post-build all test doc precommit travis clean watch run bump-version create-pr
