#!/bin/bash
# Mirror the office to a local folder (macOS/Linux). Set TARGET to your drive, e.g. /Volumes/D/hqrs1-science-office.
TARGET="${TARGET:-$HOME/hqrs1-science-office}"
REPO="https://github.com/AKSVB/hqrs1-science-office.git"
if [ -d "$TARGET/.git" ]; then git -C "$TARGET" pull --ff-only; else git clone "$REPO" "$TARGET"; fi
echo "Office mirrored to $TARGET"
