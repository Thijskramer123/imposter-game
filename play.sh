#!/usr/bin/env bash
# Launch the Imposter game — double-click or run: ./play.sh
cd "$(dirname "$0")"
pip3 install colorama -q 2>/dev/null
python3 imposter.py
