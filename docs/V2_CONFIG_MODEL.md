# V2 Configuration Model (dotup.yaml)

## 1. Purpose
The `dotup.yaml` configuration is the declarative definition of a desired development environment. It replaces the V1 `.conf` profile text files. Its primary goal is to specify *what* should be installed and configured, independent of the local operating system, package manager, or execution mechanism.

## 2. User Mental Model
Users should think of this file as a portable manifest. It can be shared with teammates, committed to a repository, or managed by a future web platform. DotUp acts as the interpreter that satisfies this manifest locally.

## 3. Configuration Hierarchy
The configuration is structured as follows:
```yaml
schema_version: 1
profile:
  name: string
  description: string (optional)
modules:
  <module_name>:
    <option_key>: <option_value>
```

## 4. Schema Versioning
- **Field:** `schema_version` (integer)
- **Current Version:** `1`
- **Purpose:** Identifies the structural layout of the YAML file. Future web backends and CLIs will use this to route the payload to the correct parser. It is distinct from the DotUp software version.

## 5. Profile Representation
The `profile` block provides metadata about the environment.
- `name`: Matches the intent of V1 profile names (e.g. `backend`, `frontend`).

## 6. Module Representation
Modules are defined as a key-value map under `modules:`.
```yaml
modules:
  system: {}
  git: {}
  node:
    version: "20"
```
Using a map instead of a list ensures that a module is only declared once, and allows intuitive attachment of module-specific options.

## 7. Module Options
Options are key-value pairs specific to a module. Currently, most DotUp V1 modules do not take options (they just install the latest). The model supports options (e.g., `version`), but modules will ignore them until explicitly updated to support them.

## 8. Version Constraints
Version constraints are represented simply as a string under the `version` option for a module:
```yaml
modules:
  python:
    version: "3.13"
```
**Limitation:** DotUp does not currently implement a dependency solver. If a version is provided, the underlying module is responsible for interpreting it (e.g., fetching a specific tarball or using a versioned package name like `python3.13`).

## 9. Platform-Specific Configuration
Platform-specific overrides are deliberately excluded from the base schema for now. The goal is portability. If a module cannot satisfy an installation on a platform, it should fail gracefully rather than requiring OS-specific directives in the YAML. 

## 10. Defaults
- If `schema_version` is missing, validation fails.
- If a module has no options, it can be defined as `<module_name>: {}` or `<module_name>: null`. The internal model treats it as an empty options map.

## 11. Validation
Validation occurs in two phases:
1. **Structural Validation:** Ensures the YAML matches the expected schema types (using a `yq` or simple `awk`/`grep` parser, or native bash YAML parsing depending on implementation strategy).
2. **Semantic Validation:** Ensures the requested modules actually exist in the `modules/` directory before any installation begins.

## 12. Unknown Fields
Unknown fields at the root level or inside `profile` are rejected to prevent typos and ensure strict schema adherence.

## 13. Unknown Modules
If `modules.imaginary-tool` is requested, semantic validation will detect that `modules/*/imaginary-tool.sh` does not exist and abort the operation with a clear error.

## 14. Backward Compatibility
V1 `.conf` files in `config/profiles/` remain fully functional. The CLI will detect the profile type and use the legacy text-loader for `.conf` and the new YAML loader for `.yaml`.

## 15. Migration from V1 .conf
A simple script or manual conversion can map `system\ngit\n` to `modules:\n  system: {}\n  git: {}`. V1 profiles will eventually be deprecated.

## 16. Export/Import Implications
Since the model is purely declarative and contains no secrets or local filesystem paths, it is inherently portable and safe for export/import via text copy-paste or a future backend API.

## 17. Future Web-Platform Compatibility
The configuration is structurally separated from web metadata. A web backend can easily wrap this configuration inside a database record (`id`, `owner_id`, `created_at`, `config_payload`). 

## 18. Explicitly Unsupported Configuration Capabilities
The following are permanently out of scope for this schema to maintain security and simplicity:
- Passwords, API keys, tokens, or credentials.
- Arbitrary shell scripts or inline commands.
- Dotfile/RC file contents (e.g. `.bashrc` strings).
