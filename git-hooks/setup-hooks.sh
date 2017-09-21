#!/bin/sh

cp git-hooks/pre-commit .git/hooks/pre-commit || exit 0
chmod +x .git/hooks/pre-commit || exit 0
