#!/bin/bash -e

project_dir=$(cd "$(dirname "$(dirname "${BASH_SOURCE[0]}")")" && pwd)
ln -s "${project_dir}/git-hooks/pre-commit" "${project_dir}/.git/hooks/pre-commit" --force
