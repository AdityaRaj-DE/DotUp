#!/usr/bin/env bash

docker_detect() {
    log_debug "Detecting Docker..."
    if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
        echo "INSTALLED"
    else
        echo "NOT_INSTALLED"
    fi
}

docker_install() {
    log_info "Installing Docker..."

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
}

docker_repair() {
    log_warn "Repairing Docker..."
    docker_install
}

docker_configure() {
    log_info "Configuring Docker..."

    if ! groups "${USER}" | grep -q "\bdocker\b"; then
        log_info "Adding ${USER} to the docker group..."
        ${SUDO_CMD:-} usermod -aG docker "${USER}"
        log_warn "You will need to log out and log back in, or run 'newgrp docker' for group permissions to take effect."
    fi

    if command -v systemctl >/dev/null 2>&1; then
        ${SUDO_CMD:-} systemctl enable docker.service >/dev/null 2>&1 || true
        ${SUDO_CMD:-} systemctl start docker.service >/dev/null 2>&1 || true
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
