# Initial steps

Crear un `.venv` en el directorio `backend/`.

```bash
cd backend
python3 -m venv .venv
```

Y activar el entorno virtual para ejecutar la API.

```bash
source .venv/bin/activate
```

Para desactivar el entorno virtual, usar el siguiente comando:

```bash
deactivate
```

Una vez activado el entorno virtual, instalar las dependencias necesarias.

```bash
pip install librería_solicitada
```

Para ejecutar la API, usar el siguiente comando:

```bash
uvicorn main:app --reload
```

Para que el proyecto funcione, deben estar ingresadas las API keys necesarias en un archivo `.env` en la raíz del proyecto. Está de ejemplo el archivo `.env.example` que contiene las variables necesarias.

```bash
cp .env.example .env
```
