# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - img "CDS Logo" [ref=e8]
    - heading "Iniciar sesión" [level=1] [ref=e9]
    - paragraph [ref=e10]: Accede a tu cuenta para administrar el inventario.
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Usuario
        - textbox "Usuario" [ref=e14]:
          - /placeholder: Ingresa tu usuario
          - text: admin
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: Contraseña
          - link "¿Olvidaste tu contraseña?" [ref=e18] [cursor=pointer]:
            - /url: /
        - textbox "Contraseña" [ref=e19]:
          - /placeholder: ••••••••
          - text: admin123
      - button "Accediendo..." [disabled]
    - generic [ref=e20]:
      - text: ¿No tienes cuenta?
      - link "Regresa al inicio" [ref=e21] [cursor=pointer]:
        - /url: /
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e28] [cursor=pointer]:
    - generic [ref=e31]:
      - text: Rendering
      - generic [ref=e32]:
        - generic [ref=e33]: .
        - generic [ref=e34]: .
        - generic [ref=e35]: .
  - alert [ref=e36]
```