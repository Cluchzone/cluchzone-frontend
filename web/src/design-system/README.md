# design-system/

Componentes de UI reutilizáveis, agnósticos de domínio: `Button`, `Modal`
(Radix Dialog), `Toast` (Radix Toast), `DropdownMenu`, etc. Cada componente é
uma pasta com `Componente.tsx` + `Componente.module.css` (CSS Modules, CSS puro).

Regras:
- **Sem** Tailwind, sem CSS-in-JS. Estilo via CSS Modules sobre os design tokens.
- Primitivos de acessibilidade/comportamento vêm do **Radix UI** (headless).
- Nenhum import do frontend legado (raiz). Zero acoplamento a domínio.

Formalizado na **Fase 1** (tokens portados 1:1 de `style.css` + galeria dev-only).
O `Button/` atual é um seed da Fase 0 que prova o pipeline Radix + CSS Modules.
