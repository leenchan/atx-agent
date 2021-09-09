all: amd64 386 arm arm64 self
self: pre
	go build -o bin/atx-agent -tags vfs
amd64: pre
	GOOS=linux GOARCH=amd64 go build -o bin/atx-agent.amd64 -tags vfs
386: pre
	GOOS=linux GOARCH=386 go build -o bin/atx-agent.386 -tags vfs
arm: pre
	GOOS=linux GOARCH=arm go build -o bin/atx-agent.arm -tags vfs 
arm64:pre
	GOOS=linux GOARCH=arm64 go build -o bin/atx-agent.arm64 -tags vfs 
pre:
	go mod tidy
	go get github.com/shurcooL/vfsgen
	go generate

bin/atx-agent: self
	bin/atx-agent version 2>/dev/null >latest
upload: bin/atx-agent arm64 arm 386 amd64
	bcecmd bos cp bin/atx-agent.amd64 bos:/safe-sig/opinit/atx-agent/atx-agent_$(shell cat latest)_linux_amd64
	bcecmd bos cp bin/atx-agent.386 bos:/safe-sig/opinit/atx-agent/atx-agent_$(shell cat latest)_linux_386
	bcecmd bos cp bin/atx-agent.arm64 bos:/safe-sig/opinit/atx-agent/atx-agent_$(shell cat latest)_linux_armv7
	bcecmd bos cp bin/atx-agent.arm64 bos:/safe-sig/opinit/atx-agent/atx-agent_$(shell cat latest)_linux_arm64
	bcecmd bos cp bin/atx-agent.arm bos:/safe-sig/opinit/atx-agent/atx-agent_$(shell cat latest)_linux_arm
	bcecmd bos cp latest bos:/safe-sig/opinit/atx-agent/latest
	rm -rf latest