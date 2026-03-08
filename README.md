# 🚀 IA-CreditScore: Scoring Alternativo para PYMEs impulsado por IA

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-AI-blue?style=for-the-badge)](https://deepseek.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📝 Descripción del Proyecto

**IA-CreditScore** es una plataforma innovadora diseñada para transformar la evaluación de riesgo crediticio para Pequeñas y Medianas Empresas (PYMEs). A diferencia de los métodos tradicionales que dependen exclusivamente de historiales crediticios formales a menudo inexistentes, nuestra solución utiliza **Inteligencia Artificial** para analizar datos no estructurados y fuentes alternativas, proporcionando una visión 360° de la salud y potencial de un negocio.

### 💡 Propuesta de Valor
Muchas PYMEs operan de manera saludable pero carecen de la "huella financiera" requerida por la banca tradicional. IA-CreditScore cierra esta brecha permitiendo a las instituciones financieras:
*   **Evaluar lo invisible:** Analizar la reputación y actividad comercial a través de huella digital.
*   **Automatizar la burocracia:** Extraer datos financieros complejos de PDFs en segundos.
*   **Reducir el riesgo:** Tomar decisiones basadas en datos multi-fuente (financieros + sociales).
*   **Inclusión Financiera:** Facilitar el acceso al crédito a negocios emergentes.

---

## ✨ Características Principales

*   **📄 Análisis Inteligente de Documentos:** Extracción automática de datos desde Estados de Situación Financiera en PDF mediante **MarkItDown** y modelos LLM (**DeepSeek**).
*   **🌐 Scoring Digital (Social Credit):** Evaluación de la presencia y reputación en redes sociales (**X/Twitter, LinkedIn, Facebook**) para medir la tracción y consistencia del negocio.
*   **⚖️ Motor de Decisión Ponderado:** Algoritmo personalizable que combina salud financiera tradicional con señales digitales alternativas.
*   **📊 Informes Profesionales:** Generación de reportes detallados en Markdown con conclusiones accionables, bandas de riesgo y límites de crédito recomendados.
*   **🎨 Interfaz Moderna:** Dashboard intuitivo construido con **React** y **Shadcn UI**, enfocado en la experiencia del analista de riesgos.

---

## 🛠️ Stack Tecnológico

### Frontend
*   **Framework:** React 18 con TypeScript.
*   **Herramienta de Construcción:** Vite.
*   **Estilos:** Tailwind CSS & Lucide Icons.
*   **Componentes:** Shadcn UI (Radix UI).
*   **Estado y Rutas:** React Router DOM & TanStack Query.

### Backend
*   **Lenguaje:** Python 3.10+.
*   **Framework:** FastAPI.
*   **IA & NLP:** DeepSeek API (OpenAI compatible client).
*   **Procesamiento de Documentos:** Microsoft MarkItDown.
*   **Contenerización:** Docker & Docker Compose.

---

## 🚀 Instalación y Configuración

### Requisitos Previos
*   Node.js (v18+)
*   Python (v3.10+)
*   Docker (opcional)

### Configuración del Backend
1. Navega al directorio `backend/`.
2. Crea un archivo `.env` basado en las necesidades del sistema:
   ```env
   DEEPSEEK_API_KEY=tu_api_key_aqui
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Ejecuta el servidor:
   ```bash
   uvicorn main:app --reload
   ```

### Configuración del Frontend
1. Navega a la raíz del proyecto.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta en modo desarrollo:
   ```bash
   npm run dev
   ```

---

## 📊 Flujo de Uso

1.  **Carga de Datos:** El analista sube el PDF del balance financiero de la PYME.
2.  **Procesamiento IA:** El sistema extrae activos, pasivos y patrimonio automáticamente.
3.  **Análisis Social:** Se ingresan las URLs de las redes sociales de la empresa.
4.  **Generación de Score:** El motor calcula el score final y define una banda de riesgo (Excelente, Fuerte, Moderado, Débil, Crítico).
5.  **Decisión:** El sistema recomienda un límite de crédito y condiciones específicas.

---

## 🗺️ Roadmap

- [ ] Integración directa con APIs de redes sociales (actualmente simulado/scraping).
- [ ] Soporte para análisis de estados de pérdidas y ganancias.
- [ ] Panel de administración para configurar pesos del algoritmo de scoring.
- [ ] Exportación de informes en formato PDF profesional.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulte el archivo `LICENSE` para más detalles.

---

Desarrollado con ❤️ para impulsar el ecosistema PYME.
