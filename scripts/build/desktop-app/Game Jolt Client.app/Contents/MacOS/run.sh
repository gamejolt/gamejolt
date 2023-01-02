#!/usr/bin/env bash
DIR="$(dirname "$0")"
DIR="$(dirname "$DIR")/Resources/app"
"$DIR/game-jolt-client" --dir "$DIR"
