#!/usr/bin/env bash
# Prints the DotUp banner

# Use cyan for the banner
COLOR_CYAN='\033[0;36m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_CYAN}"
cat << "EOF"
 ____        _   _   _
|  _ \  ___ | |_| | | |_ __
| | | |/ _ \| __| | | | '_ \
| |_| | (_) | |_| |_| | |_) |
|____/ \___/ \__|\___/| .__/
                      |_|
EOF
echo -e "${COLOR_RESET}"
