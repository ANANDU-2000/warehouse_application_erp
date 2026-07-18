---
name: deployment-windows
description: Windows Server 2022 deployment steps for the migrated ERP — health checks and rollback. Use only when the user requests deploy and the module is PASS.
---
# Deployment

## Scope only

Deploy the approved build to Windows Server targets. Do not migrate new modules during deploy.

## Preconditions

- Scoped module(s) have Legacy vs New PASS
- No open Unknowns for the deploy scope
- Secrets provided via env — not from git

## Steps

1. Confirm checklist unlock for deployment phase.
2. Build artifacts for `new-app/`.
3. Apply DB migrations if included and approved.
4. Deploy service / static hosting per project docs.
5. Run health checks.
6. Record rollback steps actually tested or verified.
7. Stop.

## Output

- Deployed versions
- Health check results
- Rollback steps
