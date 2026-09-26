#!/bin/bash
# shellcheck shell=bash
# =============================================================================
# start_local.sh — Project DotUp local development.
#
# Goal: clone the repo, run this, start coding. Every edge case handled.
#
# Usage:
#   ./start_local.sh                 Start (reuse DB, rebuild if needed)
#   ./start_local.sh start --fresh   Nuke DB + images, full cold rebuild
#   ./start_local.sh stop            Stop services (keep DB)
#   ./start_local.sh restart         Stop + start
#   ./start_local.sh logs [service]  Follow logs (all services, or one)
#   ./start_local.sh shell <svc>     Open shell: backend|frontend|postgres
#   ./start_local.sh db              Open psql prompt
#   ./start_local.sh migrate         Run migrations (alembic upgrade head)
#   ./start_local.sh doctor          Diagnose common setup problems
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Colors & Helpers ──────────────────────────────────────────────────
NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'

fail() {
    echo -e "${RED}❌ $1${NC}"
    [[ -n "${2:-}" ]] && echo -e "   ${DIM}$2${NC}"
    exit 1
}
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    [[ -n "${2:-}" ]] && echo -e "   ${DIM}$2${NC}"
}
info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}
ok() {
    echo -e "${GREEN}✅ $1${NC}"
}
step() {
    echo -e "⏳ ${BOLD}$1${NC}"
}
hr() {
    echo -e "${DIM}----------------------------------------------------------------------${NC}"
}
banner() {
    echo -e "${CYAN}"
    cat << "EOF"
 ____        _   _   _
|  _ \  ___ | |_| | | |_ __
| | | |/ _ \| __| | | | '_ \
| |_| | (_) | |_| |_| | |_) |
|____/ \___/ \__|\___/| .__/
                      |_|
EOF
    echo -e "${NC}"
}

# ── Configuration ─────────────────────────────────────────────────────
PROJECT_NAME="dotup"

HEALTH_TIMEOUT=180

compose() {
    docker compose "$@"
}

# ── Pre-flight checks ─────────────────────────────────────────────────
check_prereq() {
    command -v docker >/dev/null 2>&1 \
        || fail "Docker not found" "Install Docker Desktop: https://docs.docker.com/get-docker/"
    docker compose version >/dev/null 2>&1 \
        || fail "Docker Compose v2 not found" "Upgrade Docker Desktop or install the compose plugin"
    docker info >/dev/null 2>&1 \
        || fail "Docker daemon not running" "Start Docker Desktop (or: sudo systemctl start docker)"
    command -v curl >/dev/null 2>&1 \
        || fail "curl not installed" "Install it: apt/brew install curl"
    ok "Docker, Compose, and Docker daemon are ready"
}

check_ports() {
    local REQUIRED_PORTS=(3000 8000 5432)
    local busy=()
    local port
    for port in "${REQUIRED_PORTS[@]}"; do
        if ss -tlnH "sport = :$port" 2>/dev/null | grep -q LISTEN \
            || lsof -i ":$port" -sTCP:LISTEN >/dev/null 2>&1; then
            if ! docker ps --format '{{.Ports}}' | grep -q ":$port->"; then
                busy+=("$port")
            fi
        fi
    done
    if [[ ${#busy[@]} -gt 0 ]]; then
        warn "Port(s) already in use: ${busy[*]}"
        echo -e "     ${DIM}Free them or stop the process using them. On Linux: sudo lsof -i :PORT${NC}"
    else
        ok "Required ports free: ${REQUIRED_PORTS[*]}"
    fi
}

# ── Env handling ──────────────────────────────────────────────────────
setup_local_env() {
    if [[ ! -f .env.example ]]; then
        fail ".env.example not found" "This is a repo bug. Contact the team."
    fi
    if [[ ! -f .env ]]; then
        warn "No .env found. Copying from .env.example..."
        cp .env.example .env
        ok ".env created"
    fi

    local new_keys=()
    while IFS='=' read -r key val; do
        [[ -z "$key" || "$key" =~ ^# ]] && continue
        if ! grep -q "^${key}=" .env 2>/dev/null; then
            new_keys+=("$key=$val")
        fi
    done < <(grep -E '^[A-Z_]+=' .env.example)
    if [[ ${#new_keys[@]} -gt 0 ]]; then
        {
            echo ""
            echo "# ── Auto-appended from .env.example ($(date '+%Y-%m-%d')) ─────────────"
            printf '%s\n' "${new_keys[@]}"
        } >> .env
        info "Appended new keys to .env: ${new_keys[*]%%=*}"
        info "Review and update values if needed."
    fi

    set -a
    source .env
    set +a
}

# ── Credentials box ───────────────────────────────────────────────────
print_ready() {
    echo ""
    echo -e "  ${PURPLE}┌────────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "  ${PURPLE}│${NC}  ${PURPLE}🚀${NC}  ${BOLD}DotUp is live${NC}                                                         ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}├────────────────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}Frontend:${NC}  ${CYAN}http://localhost:3000${NC}                                        ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}API:${NC}       ${CYAN}http://localhost:8000${NC}                                        ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}  ${BOLD}API Docs:${NC}  ${CYAN}http://localhost:8000/docs${NC}                                   ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}├────────────────────────────────────────────────────────────────────────────┤${NC}"    
    echo -e "  ${PURPLE}│${NC}  ${BOLD}Common:${NC}                                                                   ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}./start_local.sh logs${NC}           ${DIM}follow recent logs (last 100 lines)${NC}     ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}./start_local.sh migrate${NC}        ${DIM}run database migrations${NC}                 ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}./start_local.sh stop${NC}           ${DIM}stop services (keep DB)${NC}                 ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}./start_local.sh start --fresh${NC}  ${DIM}nuke everything, rebuild${NC}                ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}│${NC}    ${DIM}./start_local.sh doctor${NC}         ${DIM}diagnose problems${NC}                       ${PURPLE}│${NC}"
    echo -e "  ${PURPLE}└────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

# ── Commands ──────────────────────────────────────────────────────────
cmd_start() {
    local fresh=false
    [[ "${1:-}" == "--fresh" ]] && fresh=true

    setup_local_env

    banner
    hr; echo -e "  ${BOLD}PRE-FLIGHT${NC}"; hr; echo ""
    check_prereq
    check_ports
    echo ""

    hr; echo -e "  ${BOLD}LAUNCHING${NC}"; hr; echo ""

    if $fresh; then
        step "Fresh mode: stopping containers + removing volumes + images"
        compose down -v --rmi local 2>/dev/null || true
        ok "Old state wiped"
    fi

    step "Ensuring database is available"
    compose up -d --wait --wait-timeout 60 postgres
    ok "Database ready"

    cmd_migrate

    step "Building and starting services (compose handles build + health wait)..."
    if ! compose up -d --build --wait --wait-timeout "$HEALTH_TIMEOUT"; then
        local rc=$?
        compose logs --tail 30
        fail "Failed to build or start containers (exit $rc)" "Run: ./start_local.sh logs"
    fi
    ok "All services healthy"
    print_ready
}

cmd_stop() {
    step "Stopping services (keeping DB)..."
    compose stop
    ok "Stopped"
}

cmd_restart() {
    cmd_stop
    cmd_start "$@"
}

cmd_logs() {
    compose logs -f --tail 100 "$@"
}

cmd_shell() {
    local svc="${1:-backend}"
    compose exec "$svc" bash || compose exec "$svc" sh
}

cmd_db() {
    compose exec postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-dotup}"
}

cmd_migrate() {
    hr; echo -e "  ${BOLD}DATABASE MIGRATIONS${NC}"; hr; echo ""
    if ! compose ps --services --filter "status=running" 2>/dev/null | grep -q '^postgres$'; then
        step "Database not running. Starting it..."
        compose up -d postgres --wait 2>/dev/null || fail "Database failed to start"
    fi
    
    if [ -d "backend/alembic" ] || [ -f "backend/alembic.ini" ]; then
        # Run alembic upgrade head
        compose run --rm -it --no-deps backend alembic upgrade head || fail "Migration step failed"
        ok "Migrations complete"
    else
        warn "No Alembic migrations found. Skipping."
    fi
}

cmd_doctor() {
    setup_local_env
    banner
    hr; echo -e "  ${BOLD}DOCTOR${NC}"; hr; echo ""
    check_prereq
    check_ports
    echo ""

    hr; echo -e "  ${BOLD}CONTAINER STATE${NC}"; hr; echo ""
    compose ps
    echo ""

    hr; echo -e "  ${BOLD}BACKEND LOGS (last 20 lines)${NC}"; hr; echo ""
    compose logs backend --tail 20 2>/dev/null || warn "Backend container not running"
    echo ""
}

cmd_help() {
    echo -e "${BOLD}DotUp — start_local.sh${NC}"
    echo ""
    echo "Commands:"
    echo "  start [--fresh]        Start services (default)"
    echo "  stop                   Stop services (keep DB)"
    echo "  restart                Stop + start"
    echo "  logs [service]         Follow recent logs (defaults to last 100 lines)"
    echo "  shell <svc>            Open shell inside container (backend, frontend, postgres)"
    echo "  db                     Open psql prompt"
    echo "  migrate                Run alembic upgrade head"
    echo "  doctor                 Diagnose common issues"
    echo "  help                   This message"
}

# ── Dispatcher ────────────────────────────────────────────────────────
cmd="${1:-start}"
shift || true

case "$cmd" in
    start)              cmd_start "$@" ;;
    stop)               cmd_stop ;;
    restart)            cmd_restart "$@" ;;
    logs)               cmd_logs "$@" ;;
    shell)              cmd_shell "$@" ;;
    db)                 cmd_db ;;
    migrate)            cmd_migrate ;;
    doctor)             cmd_doctor ;;
    help|--help|-h)     cmd_help ;;
    *)                  echo "Unknown: $cmd"; cmd_help; exit 1 ;;
esac
