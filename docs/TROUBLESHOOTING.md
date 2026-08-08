# Troubleshooting

## Finding Logs
If any installation or repair module fails, highly detailed technical logs are immediately captured locally on your system. 
You can inspect the exact failure path by reading the logs at:
**`~/.devbootstrap/logs/`**
*(Note: For strict backward compatibility in internal path resolution, the core data directory currently remains `.devbootstrap`.)*

## Checksum Mismatch
**Symptom**: Installation aborts instantly with `Checksum verification failed!`.
**Solution**: This implies your network intercepted/corrupted the download payload, or a proxy modified the HTTP request. DotUp will unconditionally fail-closed in this scenario to protect your system. Retry on an unfiltered network.

## Package Manager Locks
**Symptom**: Installation fails with `Could not get lock /var/lib/dpkg/lock-frontend`.
**Solution**: Wait for background host updates (like `unattended-upgrades`) to finish natively, then run `dotup repair`.

## Docker Group Permissions
**Symptom**: `dotup doctor` reports Docker as broken because it cannot connect to the Docker daemon.
**Solution**: When DotUp installs Docker, it adds your user to the `docker` group. You must either log out and log back in, or run `newgrp docker` in your current terminal session for the OS group permissions to take effect.

## Headless Environments
**Symptom**: Chrome or VS Code installations report as skipped.
**Solution**: This is intentional. The scripts detect if `DISPLAY` or `WAYLAND_DISPLAY` is set. In a server or headless environment, GUI applications are automatically and safely skipped.
