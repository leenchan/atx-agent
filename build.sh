#!/bin/sh
CURR_DIR=$(cd "$(dirname "$0" 2>/dev/null)";pwd)
OUTPUT_DIR="$CURR_DIR/dist"
VERSION=$(cat "$CURR_DIR/main.go" | grep 'version\s*=' | grep -Eo '[0-9.]+')

while read GO_OS_ARCH
do
	[ -d "$OUTPUT_DIR" ] || mkdir -p "$OUTPUT_DIR"
	eval $(echo "$GO_OS_ARCH" | awk -F'/' '{print "GOOS="$1";GOARCH="$2}')
	echo "[INFO] Building atx-agent ($GO_OS_ARCH)..."
	GOOS=$GOOS GOARCH=$GOARCH go build -tags vfs -o "$OUTPUT_DIR/atx-agent" || exit 1
	COMRESSED_FILE="atx-agent_${VERSION}_${GOOS}_${GOARCH}.tar.gz"
	cd "$OUTPUT_DIR" && tar -zcf "$COMRESSED_FILE" atx-agent || exit 1
	rm atx-agent
	echo "[SUCCESS] Ouput: $OUTPUT_DIR/$COMRESSED_FILE"
	cd "$CURR_DIR"
done <<-EOF
$(go tool dist list | grep -E '^linux.*(arm|386|amd64|mips64)')
EOF


# 
