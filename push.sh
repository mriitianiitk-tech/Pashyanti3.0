#!/usr/bin/env bash
# Pashyanti 3.0 Git Push Automation
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================="
echo "   Pashyanti 3.0 Git Automation Utility"
echo "========================================="
echo ""

echo "Staging changes..."
git add .

read -p "Enter commit message (or press Enter for default 'Updated Pashyanti 3.0'): " commit_msg
if [ -z "$commit_msg" ]; then
  commit_msg="Updated Pashyanti 3.0"
fi

echo ""
echo "Committing changes..."
git commit -m "$commit_msg" || echo "Nothing to commit or already committed."

echo ""
echo "Pushing to GitHub (origin main)..."
git push -u origin main

echo ""
echo "========================================="
echo "   Push complete!"
echo "========================================="
