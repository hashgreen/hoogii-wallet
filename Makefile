PKG_VERSION=`node -p "require('./package.json').version"`

.PHONY: check-%
check-%: ## check environment variable is exists
	@if [ -z '${${*}}' ]; then echo 'Environment variable $* not set' && exit 1; fi

.PHONY: help
help: ## show help
	@grep -hE '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-17s\033[0m %s\n", $$1, $$2}'

.PHONY: clean
clean: env ## remove artifacts
	@rm -rf dist/* release_*.zip
	@echo 'Prior build removed!'

.PHONY: env
env: ## move .env
	@cp hoogii-wallet-configs/.env.yuumi-wallet .env
	@echo 'move .env success'

.PHONY: build
build: clean ## the main program as dist folder
	@yarn build

.PHONY: package
package: build ## dist folder
	@echo 'Zipping up build files for upload...'
	@zip -r -X "release_$(PKG_VERSION).zip" dist/*
	@echo 'New extension build ready for upload!'

.PHONY: patch
patch: ## npm run patch
	@npm run patch
