# 03 - Estrategia de Ramas y Git Flow

## 1. Topología de Ramas
- Cada nueva característica o corrección se desarrolla en su propia rama aislada:
  - `feature/<nombre-descriptivo>` para nuevas funcionalidades.
  - `fix/<nombre-descriptivo>` para corrección de errores.
  - `hotfix/<nombre-descriptivo>` para parches críticos en producción.
- Flujo de integración: `feature/*` → `develop` → `main` / `deploy`.
- Está estrictamente prohibido mezclar dos funcionalidades o tareas no relacionadas en la misma rama o Pull Request.

## 2. Bloqueo Incondicional por Pruebas
- No se permite merge hacia `develop` sin que la suite de pruebas automatizadas de Playwright (definidas en `04-testing.md`) pase 100% en verde.
- Un test fallando bloquea automáticamente la integración. Prohibido omitir o desactivar tests en silencio; si en un caso excepcional se requiere omitir un test, debe justificarse de manera explícita y documentada con la autorización del usuario.

## 3. Checklist Obligatorio en Pull Requests
Todo PR debe incluir obligatoriamente:
- [ ] Descripción clara del cambio y contexto de negocio.
- [ ] Checklist de seguridad de `02-seguridad.md` revisado y cumplido.
- [ ] Tests de Playwright agregados o actualizados que validen el flujo completo.
- [ ] Verificación exhaustiva del `git diff` confirmando la ausencia total de secretos, tokens o variables `.env`.

## 4. Estándar de Commits
Se exige el uso riguroso de **Conventional Commits**:
- `feat(...)`: Nueva funcionalidad.
- `fix(...)`: Corrección de un defecto.
- `refactor(...)`: Cambio de código sin alterar comportamiento.
- `test(...)`: Incorporación o mejora de pruebas.
- `chore(...)`: Tareas de mantenimiento o configuración de herramientas.
- `docs(...)`: Actualización de documentación.
