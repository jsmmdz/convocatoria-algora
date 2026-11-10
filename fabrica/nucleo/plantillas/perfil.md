# Perfil del proyecto — <nombre>

> Plantilla. Se copia a `fabrica/proyecto/perfil.md` al empezar una web nueva y se llena
> con el autor **antes** de escribir la primera tarea. Todo lo que diga «cerrado» aquí los
> agentes no lo rediscuten.

## 1. El proyecto en una frase

Qué es, para quién, y la idea que lo hace distinto.

## 2. Estructura del recorrido

Páginas, niveles o secciones, con lo que tiene cada una y su tratamiento visual.

## 3. Fuentes de verdad (se leen, los agentes no las editan)

| Documento | Qué decide |
|---|---|
| `docs/1-PRODUCTO.md` | qué se construye: recorrido, niveles, referentes, dirección de arte |
| `docs/2-TECNICO.md` | cómo se construye: stack, rutas, contratos, tokens, presupuestos |
| `docs/3-ESTADO.md` | tareas y siguiente paso |

## 4. Cerrado — no se rediscute

- **Stack:** framework, librerías permitidas y **prohibidas**.
- **Paleta:** hex exactos, qué es cada uno. «No se agregan colores.»
- **Tipografía:** familias y roles. «No hay tercera fuente.»
- **Reglas de dirección de arte:** con código si las hay.
- **Móvil:** qué se exige hoy y qué se deja para después.

## 5. Técnica del proyecto

- Dónde viven los tokens y qué nombres usan.
- Comandos: dev, build, check, sincronizar assets.
- Contratos compartidos entre tareas (estado global, atributos en `<body>`, eventos).

## 6. Rutas

- **Protegidas:** las que ningún agente toca (van también en `compuertas.json`).
- **Personales:** material que no se lee, no se copia y no se sube a ningún servicio.

## 7. Compuertas

Qué agrega este proyecto a las del núcleo en `fabrica/proyecto/compuertas.json`:
patrones prohibidos propios, presupuestos de peso.
