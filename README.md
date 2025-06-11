# Initial steps

Instalar uv con:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Para que el proyecto funcione, deben estar ingresadas las API keys necesarias en un archivo `.env` en la raíz del proyecto. Está de ejemplo el archivo `.env.example` que contiene las variables necesarias.

```bash
cp .env.example .env
```

Descargar imagenes del dataset:

```bash
#!/bin/bash
curl -L -o /data/polyvore_data/
  https://www.kaggle.com/api/v1/datasets/download/dnepozitek/maryland-polyvore-images
```

Inicializar uv y ejecutar el backend:

```bash
crear .env
cd backend
uv sync
uv run uvicorn main:app --reload
```

Para añadir nuevas dependencias al proyecto, utilizar el comando:

```bash
uv add <nombre-dependencia>
```
