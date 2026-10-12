#!/usr/bin/env bash

docker_detect() {
    log_debug "Detecting Docker..."
    if command -v docker >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            echo "INSTALLED"
        else
            echo "BROKEN" # Installed but daemon not running or no permissions
        fi
    else
        echo "NOT_INSTALLED"
    fi
}

docker_detect_state() {
    # Check for platform support first
    local os_id
    os_id=$(platform_dist_id)
    if [[ "$os_id" != "ubuntu" && "$os_id" != "debian" && "$os_id" != "fedora" && "$os_id" != "arch" && "$os_id" != "manjaro" ]]; then
        echo "status=UNSUPPORTED"
        return
    fi

    if ! command -v docker >/dev/null 2>&1; then
        echo "status=NOT_INSTALLED"
        return
    fi

    if ! docker info >/dev/null 2>&1; then
        echo "status=BROKEN"
        return
    fi

    echo "status=INSTALLED"
    local v
    # docker --version output is usually "Docker version 26.1.4, build 5650f9b"
    v=$(docker --version | awk '{print $3}' | tr -d ',')
    if [[ -n "$v" ]]; then
        echo "version=$v"
    fi
}

docker_install() {
    log_info "Installing Docker..."

    if [[ "$PKG_MANAGER" == "apt" ]]; then
        ${SUDO_CMD:-} install -m 0755 -d /etc/apt/keyrings
        ${SUDO_CMD:-} curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
        ${SUDO_CMD:-} chmod a+r /etc/apt/keyrings/docker.asc

        local id_name
        id_name=$(platform_dist_id)
        if [[ "$id_name" == "linuxmint" ]] || [[ "$id_name" == "pop" ]]; then
            id_name="ubuntu"
        fi

        echo \
            "deb [arch=$(platform_architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${id_name} \
          $(lsb_release -cs) stable" |
            ${SUDO_CMD:-} tee /etc/apt/sources.list.d/docker.list >/dev/null

        pkg_update
        pkg_install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    elif [[ "$PKG_MANAGER" == "dnf" ]]; then
        pkg_install dnf-plugins-core
        ${SUDO_CMD:-} dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
        pkg_update
        pkg_install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    elif [[ "$PKG_MANAGER" == "pacman" ]]; then
        pkg_update
        pkg_install docker docker-compose
    else
        fail_critical "Unsupported package manager for Docker installation."
    fi
}

docker_repair() {
    log_warn "Repairing Docker..."
    docker_install
}

docker_configure() {
    log_info "Configuring Docker..."

    local target_user="${SUDO_USER:-${USER:-$(id -un)}}"

    # 1. Ensure docker group exists
    if ! getent group docker >/dev/null 2>&1; then
        log_info "Creating docker group..."
        ${SUDO_CMD:-} groupadd docker 2>/dev/null || true
    fi

    # 2. Add user to docker group if not already a member in /etc/group
    local in_group=false
    if id -nG "$target_user" 2>/dev/null | grep -qw "docker" || id -Gn 2>/dev/null | grep -qw "docker"; then
        in_group=true
    fi

    if [[ "$in_group" != "true" ]]; then
        log_info "Adding ${target_user} to the docker group..."
        ${SUDO_CMD:-} usermod -aG docker "${target_user}" 2>/dev/null || true
        log_warn "User ${target_user} added to docker group."
        log_warn "To run docker without sudo in your current terminal session, run: newgrp docker"
        log_warn "Or log out and log back into your desktop session for system-wide effect."
    fi

    # 3. Ensure Docker systemd service and socket are enabled and started
    if command -v systemctl >/dev/null 2>&1; then
        ${SUDO_CMD:-} systemctl enable docker.service >/dev/null 2>&1 || true
        ${SUDO_CMD:-} systemctl enable docker.socket >/dev/null 2>&1 || true
        ${SUDO_CMD:-} systemctl start docker.service >/dev/null 2>&1 || true
    fi

    # 4. Ensure docker socket has correct group ownership if present
    if [[ -S /var/run/docker.sock ]]; then
        ${SUDO_CMD:-} chown root:docker /var/run/docker.sock 2>/dev/null || true
        ${SUDO_CMD:-} chmod 660 /var/run/docker.sock 2>/dev/null || true
    fi
}

docker_validate() {
    log_debug "Validating Docker..."
    if ! command -v docker >/dev/null 2>&1; then
        fail_critical "Docker validation failed: docker command not found."
    fi

    if ! docker --version >/dev/null 2>&1; then
        fail_critical "Docker validation failed: docker --version failed."
    fi

    if ! docker compose version >/dev/null 2>&1; then
        log_warn "Docker Compose validation failed: docker compose version failed."
    fi

    if ! docker ps >/dev/null 2>&1; then
        log_warn "Cannot connect to Docker daemon. This is expected if you just added your user to the docker group without restarting your session."
    else
        log_success "Docker is fully validated and reachable."
    fi
}

docker_validate_options() {
    # shellcheck disable=SC2034
    local key="$1"
    # shellcheck disable=SC2034
    local val="$2"
    return 1
}
