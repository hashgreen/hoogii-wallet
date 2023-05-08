PKG_VERSION=`node -p "require('./package.json').version"`

.PHONY: check-%
check-%: ## check environment variable is exists
	@if [ -z '${${*}}' ]; then echo 'Environment variable $* not set' && exit 1; fi

.PHONY: help
help: ## show help
	@grep -hE '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-17s\033[0m %s\n", $$1, $$2}'

.PHONY: clean
clean: ## remove artifacts
	@rm -rf dist/* release_*.zip
	@echo 'Prior build removed!'

.PHONY: submodule
submodule: 
	@git submodule init 
	@git submodule update --init --recursive
	@ls -al hoogii-wallet-configs
	@echo 'submodule success'

.PHONY: env
env: ## move .env
	@ls -al
	@cp hoogii-wallet-configs/hoogii.env .env
	@echo 'move .env success'

.PHONY: build
build: clean ## the main program as dist folder
	@yarn build

.PHONY: package
package: build ## dist folder
	@echo 'Zipping up build files for upload...'
	@zip -r -X "release_$(PKG_VERSION).zip" dist/*
	@echo 'New extension build ready for upload!'

.PHONY: prerelease
patch:
	@npm run prerelease

.PHONY: release
patch: ## npm run patch
	@npm run release
