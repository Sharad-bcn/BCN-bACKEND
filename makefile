start:
	@nodemon index.js

.PHONY: build
build:
	@rm -rf build
	@npm run webpack
	@npx javascript-obfuscator build/server.build.js --output build/server.build.min.js --self-defending true --dead-code-injection true --dead-code-injection-threshold 0.4
	@rm build/server.build.js
	@npm info ./ version > build/version.txt

sync-dev: build
	@rsync --verbose --compress --checksum --progress -e "ssh -i /keys/bcn.pem" ./build/server.build.min.js ubuntu@65.1.94.168:/home/ubuntu/api-server-dev/index.js
	@rsync --verbose --compress --checksum --progress -e "ssh -i /keys/bcn.pem" ./build/version.txt ubuntu@65.1.94.168:/home/ubuntu/api-server-dev/version.txt

sync-prod: build
	@rsync --verbose --compress --checksum --progress -e "ssh -i /keys/bcn.pem" ./build/server.build.min.js ubuntu@65.1.94.168:/home/ubuntu/api-server-prod/index.js
	@rsync --verbose --compress --checksum --progress -e "ssh -i /keys/bcn.pem" ./build/version.txt ubuntu@65.1.94.168:/home/ubuntu/api-server-prod/version.txt

