#!/usr/bin/env bash
set -euo pipefail

# Generate concise repo artifacts for AI auditing
git rev-parse --short HEAD > COMMIT.txt || true

if command -v tree >/dev/null 2>&1; then
  tree -a -I '.git|node_modules|dist|build|.terraform|__pycache__' -L 3 > repo_tree.txt
else
  # Fallback if tree is not installed
  find . -maxdepth 3 -type d | sort > repo_tree.txt
fi

echo "File count (<= depth 3):" > repo_summary.txt
find . -type f -maxdepth 3 | wc -l >> repo_summary.txt

echo "Artifacts generated: COMMIT.txt, repo_tree.txt, repo_summary.txt"
