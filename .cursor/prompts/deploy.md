# Deploy to Windows Server only

ROLE: Deployment only. Do not migrate modules.

Ground rules: `.cursor/rules/deployment-rules.mdc` + `security-rules.mdc`
Skill: `deployment-windows`

PRECONDITIONS:
- Scoped work is PASS with no open Unknowns
- Secrets available via environment (not git)

TASK: <build / migrate DB / deploy service / health check>

OUTPUT:
1. What deployed
2. Health checks
3. Rollback steps
4. Checklist updates
5. Stop
