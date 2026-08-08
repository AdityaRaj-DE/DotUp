# Troubleshooting

## Docker Group Permissions
**Symptom**: `doctor.sh` reports Docker as broken because it cannot connect to the Docker daemon.
**Solution**: When DevBootstrap installs Docker, it adds your user to the `docker` group. You must either log out and log back in, or run `newgrp docker` in your current terminal session for the permissions to take effect.

## Headless Environments
**Symptom**: Chrome or Antigravity installations report as skipped.
**Solution**: This is intentional. The scripts detect if `DISPLAY` or `WAYLAND_DISPLAY` is set. In a server or headless environment, GUI applications are safely skipped.

## Package Manager Locks
**Symptom**: Installation fails with `Could not get lock /var/lib/dpkg/lock-frontend`.
**Solution**: Wait for the background updates (like `unattended-upgrades`) to finish, or manually terminate the locked apt process if it's orphaned, then run `./repair.sh`.
