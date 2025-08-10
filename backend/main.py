import os
import re
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from markitdown import MarkItDown
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
import io
from PyPDF2 import PdfReader

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración del cliente de DeepSeek
DEEPSEEK_API_KEY = "sk-4c9d6fcc63954d11a0e7aded65948eee"
if not DEEPSEEK_API_KEY:
    raise ValueError("No se encontró la API Key de DeepSeek en las variables de entorno.")

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

PROMPT_MARKDOWN_A_JSON = (
    "Tarea: Convertir Análisis Financiero en Markdown a JSON\n\n"
    "Eres un asistente especializado en procesamiento de datos financieros. "
    "Tu tarea es analizar un texto en formato markdown que contiene un análisis de salud financiera para otorgamiento de crédito "
    "y convertirlo a un JSON estructurado siguiendo exactamente el esquema que se especifica.\n\n"
    "Instrucciones:\n"
    "1. Analiza cuidadosamente el markdown proporcionado que contiene un análisis financiero con la siguiente estructura:\n"
    "   - Encabezado con información de empresa, moneda y fecha\n"
    "   - Sección de indicadores clave con 5 dimensiones (Liquidez Inmediata, Solvencia y Endeudamiento, Rentabilidad, "
    "Calidad de Activos, Flexibilidad Financiera)\n"
    "   - Cada indicador incluye: dato clave, justificación, riesgo, puntuación y motivo\n"
    "   - Conclusión final con puntuación total, diagnóstico (fortalezas y debilidades) y recomendación\n\n"
    "2. Extrae toda la información relevante y organízala en el siguiente esquema JSON:\n"
    "{\n"
    '  "empresa": "",\n'
    '  "moneda": "",\n'
    '  "fecha": "",\n'
    '  "indicadores": [\n'
    "    {\n"
    '      "nombre": "",\n'
    '      "peso": 0,\n'
    '      "dato_clave": "",\n'
    '      "justificacion": "",\n'
    '      "riesgo": "",\n'
    '      "puntuacion": 0,\n'
    '      "motivo": ""\n'
    "    }\n"
    "  ],\n"
    '  "conclusion_final": {\n'
    '    "puntuacion_total": 0,\n'
    '    "diagnostico": {\n'
    '      "fortalezas": [],\n'
    '      "debilidades": []\n'
    "    },\n"
    '    "recomendacion_credito": "",\n'
    '    "detalle_recomendacion": ""\n'
    "  }\n"
    "}\n\n"
    "Reglas de conversión:\n"
    "- Extrae exactamente los valores numéricos para los campos \"peso\" y \"puntuacion\" (sin texto adicional)\n"
    '- Para "riesgo", extrae solo el nivel (Bajo, Moderado, Alto, etc.)\n'
    "- En \"diagnostico\", convierte las listas de fortalezas y debilidades en arrays de strings\n"
    '- Para "recomendacion_credito", extrae solo el término principal (Aprobado, Rechazado, Condicionado, etc.)\n'
    '- En "detalle_recomendacion", incluye el texto completo de la recomendación\n\n'
    "Procesa el texto markdown y devuelve únicamente el objeto JSON anterior, sin texto adicional."
)


# Prompt para DeepSeek
PROMPT_DEEPSEEK = (
    "Tu tarea es analizar un documento PDF de varias páginas que contiene un \"Estado de Flujo de Efectivo por el Método Directo\" "
    "y otra información relevante de una empresa. "
    "Debes procesar el documento completo y devolver toda la información clave en un único objeto JSON estructurado.\n\n"
    "Instrucciones:\n"
    "1. Análisis Completo: Lee y analiza el contenido de todas las páginas del PDF proporcionado.\n"
    "2. Extracción de Datos Clave: Identifica y extrae las siguientes secciones de información:\n"
    "   • Información General de la Empresa: Ubicada en la cabecera del documento (Razón Social, Dirección, Expediente, RUC, Año, Formulario).\n"
    "   • Estado de Flujo de Efectivo: Extrae cada línea de cuenta con su respectivo CUENTA, CÓDIGO y SALDOS BALANCE. "
    "   Presta atención a la estructura jerárquica.\n"
    "   • Firmantes: Extrae los datos del Representante Legal y del Contador, incluyendo sus nombres completos y números de identificación.\n"
    "   • Resumen de Efectivo: Identifica y extrae por separado los valores clave como el efectivo al inicio y al final del periodo.\n"
    "3. Formato de Salida JSON: Estructura todos los datos extraídos en un único objeto JSON, siguiendo el formato exacto que se detalla a continuación.\n"
    "4. Tipos de Datos: Asegúrate de que todos los saldos monetarios se representen como números (tipo number), no como cadenas de texto (tipo string). "
    "Por ejemplo, 23691.91 en lugar de \"23691.91\".\n"
    "5. Jerarquía: Organiza las cuentas del estado de flujo de efectivo en las categorías principales: actividadesDeOperacion, actividadesDeInversion, "
    "actividadesDeFinanciacion y una categoría para los ajustes y otros cambios.\n\n"
    "Formato JSON de Salida Requerido:\n"
    "{\n"
    '  \"informacionGeneral\": {\n'
    '    \"razonSocial\": \"MASAPP S.A.\",\n'
    '    \"direccion\": \"AGUNTIN FREIRE Y MZ AC No. V 11 BARRIO: NORTE\",\n'
    '    \"expediente\": \"300220\",\n'
    '    \"ruc\": \"0992885971001\",\n'
    '    \"ano\": 2024,\n'
    '    \"formulario\": \"SCV.NIIF.300220.2024.1\"\n'
    "  },\n"
    '  \"estadoDeFlujoEfectivo\": {\n'
    '    \"actividadesDeOperacion\": {\n'
    '      \"titulo\": \"FLUJOS DE EFECTIVO PROCEDENTES DE (UTILIZADOS EN) ACTIVIDADES DE OPERACIÓN\",\n'
    '      \"codigo\": \"9501\",\n'
    '      \"saldoTotal\": 0.00,\n'
    '      \"items\": [\n'
    "        {\n"
    '          \"cuenta\": \"Cobros procedentes de las ventas de bienes y prestación de servicios\",\n'
    '          \"codigo\": \"95010101\",\n'
    '          \"saldo\": 0.00\n'
    "        },\n"
    "        {\n"
    '          \"cuenta\": \"Cobros procedentes de regalías, cuotas, comisiones y otros ingresos de actividades ordinarias\",\n'
    '          \"codigo\": \"95010102\",\n'
    '          \"saldo\": 0.00\n'
    "        }\n"
    "      ]\n"
    "    },\n"
    '    \"actividadesDeInversion\": {\n'
    '      \"titulo\": \"FLUJOS DE EFECTIVO PROCEDENTES DE (UTILIZADOS EN) ACTIVIDADES DE INVERSIÓN\",\n'
    '      \"codigo\": \"9502\",\n'
    '      \"saldoTotal\": 0.00,\n'
    '      \"items\": [\n'
    "        {\n"
    '          \"cuenta\": \"Efectivo procedentes de la venta de acciones en subsidiarias u otros negocios\",\n'
    '          \"codigo\": \"950201\",\n'
    '          \"saldo\": 0.00\n'
    "        },\n"
    "        {\n"
    '          \"cuenta\": \"Efectivo utilizado para adquirir acciones en subsidiarias u otros negocios para tener el control\",\n'
    '          \"codigo\": \"950202\",\n'
    '          \"saldo\": 0.00\n'
    "        }\n"
    "      ]\n"
    "    },\n"
    '    \"actividadesDeFinanciacion\": {\n'
    '      \"titulo\": \"FLUJOS DE EFECTIVO PROCEDENTES DE (UTILIZADOS EN) ACTIVIDADES DE FINANCIACIÓN\",\n'
    '      \"codigo\": \"9503\",\n'
    '      \"saldoTotal\": 0.00,\n'
    '      \"items\": [\n'
    "        {\n"
    '          \"cuenta\": \"Aporte en efectivo por aumento de capital\",\n'
    '          \"codigo\": \"950301\",\n'
    '          \"saldo\": 0.00\n'
    "        },\n"
    "        {\n"
    '          \"cuenta\": \"Financiamiento por emisión de títulos valores\",\n'
    '          \"codigo\": \"950302\",\n'
    '          \"saldo\": 0.00\n'
    "        }\n"
    "      ]\n"
    "    },\n"
    '    \"ajustesYOtros\": {\n'
    '      \"items\": [\n'
    "        {\n"
    '          \"cuenta\": \"GANANCIA (PÉRDIDA) ANTES DE 15% A TRABAJADORES E IMPUESTO A LA RENTA\",\n'
    '          \"codigo\": \"96\",\n'
    '          \"saldo\": 0.00\n'
    "        },\n"
    "        {\n"
    '          \"cuenta\": \"Ajustes por gasto de depreciación y amortización\",\n'
    '          \"codigo\": \"9701\",\n'
    '          \"saldo\": 0.00\n'
    "        },\n"
    "        {\n"
    '          \"cuenta\": \"(Incremento) disminución en cuentas por cobrar clientes\",\n'
    '          \"codigo\": \"9801\",\n'
    '          \"saldo\": 0.00\n'
    "        }\n"
    "      ]\n"
    "    }\n"
    "  },\n"
    '  \"resumenEfectivo\": {\n'
    '    \"incrementoNeto\": {\n'
    '      \"cuenta\": \"INCREMENTO (DISMINUCIÓN) NETO DE EFECTIVO Y EQUIVALENTES AL EFECTIVO\",\n'
    '      \"codigo\": \"9505\",\n'
    '      \"saldo\": 0.00\n'
    "    },\n"
    '    \"efectivoAlPrincipioPeriodo\": {\n'
    '      \"cuenta\": \"EFECTIVO Y EQUIVALENTES AL EFECTIVO AL PRINCIPIO DEL PERIODO\",\n'
    '      \"codigo\": \"9506\",\n'
    '      \"saldo\": 23691.91\n'
    "    },\n"
    '    \"efectivoAlFinalPeriodo\": {\n'
    '      \"cuenta\": \"EFECTIVO Y EQUIVALENTES AL EFECTIVO AL FINAL DEL PERIODO\",\n'
    '      \"codigo\": \"9507\",\n'
    '      \"saldo\": 23691.91\n'
    "    }\n"
    "  },\n"
    '  \"firmantes\": {\n'
    '    \"representanteLegal\": {\n'
    '      \"nombre\": \"ESTEVES DELGADO ROBERTO JAVIER\",\n'
    '      \"identificacion\": \"0917583791\"\n'
    "    },\n"
    '    \"contador\": {\n'
    '      \"nombre\": \"PEREZ NAARA\",\n'
    '      \"identificacion\": \"0925688145\"\n'
    "    }\n"
    "  }\n"
    "}\n\n"
    "Tarea:\n"
    "Aplica estas instrucciones al documento PDF proporcionado y genera el objeto JSON completo y preciso como resultado."
)

PLANTILLA_ANALISIS_CREDITO = (
    "Análisis de Salud Financiera para Otorgamiento de Crédito\n"
    "Empresa: {empresa}\n"
    "Moneda: {moneda}\n"
    "Fecha: {fecha}\n\n"
    "Indicadores Clave y Ponderación (Total: 10 puntos)\n"
    "Se evalúan 5 dimensiones críticas para otorgar crédito, asignando pesos según su impacto en la solvencia y liquidez de la empresa.\n\n" \
    " 1. **Analiza los datos financieros** del JSON proporcionado, que sigue esta estructura:\n"
   "- Datos de identificación (empresa, fecha, moneda)\n"
   "- Activo corriente y no corriente desglosado\n"
   "- Pasivo corriente y no corriente desglosado\n"
   "- Patrimonio neto desglosado\n"
   "- Totales de activo, pasivo y patrimonio\n"

"2. **Evalúa 5 dimensiones críticas** para otorgamiento de crédito, asignando los siguientes pesos:\n"
 "  - Liquidez Inmediata (3 puntos)\n"
  " - Solvencia y Endeudamiento (2 puntos)\n"
   "- Rentabilidad (2 puntos)\n"
   "- Calidad de Activos (2 puntos)\n"
   "- Flexibilidad Financiera (1 punto)\n"

"3. **Para cada dimensión, incluye**:\n"
 "  - Datos clave relevantes extraídos del JSON\n"
  " - Justificación basada en los datos\n"
   "- Riesgos identificados\n"
   "- Puntuación parcial (según el peso de la dimensión) y motivo\n"

"4. **Elabora una conclusión final** que contenga:\n"
 "  - Puntuación total (sobre 10 puntos)\n"
  " - Diagnóstico detallado (fortalezas y debilidades)\n"
   "- Recomendación clara para otorgamiento de crédito (aprobado, rechazado o aprobado con condiciones)\n"
    "Consideraciones para el análisis:\n"
    "- **Liquidez Inmediata**: Evalúa la capacidad de la empresa para cumplir con sus obligaciones a corto plazo. Considera la proporción de efectivo y equivalentes respecto al activo corriente.\n"
    "- **Solvencia y Endeudamiento**: Analiza la estructura de capital de la empresa, la relación entre deuda y patrimonio, y la composición de los pasivos.\n"
    " - **Rentabilidad**: Examina la capacidad de generar beneficios, calculando indicadores como ROE (Return on Equity) si es posible con los datos disponibles.\n"
    "- **Calidad de Activos**: Evalúa la composición y diversificación de los activos, identificando posibles riesgos de concentración o iliquidez.\n"
    "- **Flexibilidad Financiera**: Considera la capacidad de la empresa para absorber pérdidas y hacer frente a imprevistos, analizando reservas y resultados acumulados.\n"
    "Liquidez Inmediata (Peso: 3 puntos)\n"
    "Dato clave: {dato_liquidez}\n"
    "Justificación:\n{justificacion_liquidez}\n"
    "Riesgo: {riesgo_liquidez}\n"
    "Puntuación: {puntuacion_liquidez}/3\n"
    "Motivo: {motivo_liquidez}\n\n"
    "Solvencia y Endeudamiento (Peso: 2 puntos)\n"
    "Dato clave: {dato_solvencia}\n"
    "Justificación:\n{justificacion_solvencia}\n"
    "Riesgo: {riesgo_solvencia}\n"
    "Puntuación: {puntuacion_solvencia}/2\n"
    "Motivo: {motivo_solvencia}\n\n"
    "Rentabilidad (Peso: 2 puntos)\n"
    "Dato clave: {dato_rentabilidad}\n"
    "Justificación:\n{justificacion_rentabilidad}\n"
    "Riesgo: {riesgo_rentabilidad}\n"
    "Puntuación: {puntuacion_rentabilidad}/2\n"
    "Motivo: {motivo_rentabilidad}\n\n"
    "Calidad de Activos (Peso: 2 puntos)\n"
    "Dato clave: {dato_calidad}\n"
    "Justificación:\n{justificacion_calidad}\n"
    "Riesgo: {riesgo_calidad}\n"
    "Puntuación: {puntuacion_calidad}/2\n"
    "Motivo: {motivo_calidad}\n\n"
    "Flexibilidad Financiera (Peso: 1 punto)\n"
    "Dato clave: {dato_flexibilidad}\n"
    "Justificación:\n{justificacion_flexibilidad}\n"
    "Riesgo: {riesgo_flexibilidad}\n"
    "Puntuación: {puntuacion_flexibilidad}/1\n"
    "Motivo: {motivo_flexibilidad}\n\n"
    "Conclusión Final\n"
    "Puntuación Total: {puntuacion_total}/10\n"
    "Diagnóstico:\n"
    "Fortalezas: {fortalezas}\n"
    "Debilidades: {debilidades}\n\n"
    "Recomendación para Crédito: {recomendacion}"
)

def generate_markdown_report(datos_json: dict) -> str:
    """
    Genera un informe en formato Markdown a partir de los datos JSON analizados.
    """
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un analista financiero especializado en evaluación de crédito. Tu tarea es realizar un análisis completo de salud financiera para determinar si una empresa es candidata a recibir crédito, utilizando los datos proporcionados en formato JSON."
                 + PLANTILLA_ANALISIS_CREDITO+ " no agregar ninguna otra información adicional solamente el análisis de salud financiera y la estructura del análisis y presentar el resultado en markdown"},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacer el análisis" + str(datos_json)},
            ],
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error al generar el informe Markdown: {e}")
        raise HTTPException(status_code=500, detail="Error al generar el informe Markdown.")

app = FastAPI()

class PDFRequest(BaseModel):
    path: str

def analyze_with_deepseek(text_content: str) -> dict:
    """
    Analiza el texto extraído con DeepSeek y devuelve un diccionario JSON.
    """
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un asistente de IA experto en la extracción de datos de documentos financieros." + PROMPT_DEEPSEEK},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacerlos json" + text_content},
            ],
            stream=False
        )
        
        resultado = response.choices[0].message.content
        
        # 1. Eliminar ``` o ```json
        patron = re.compile(r'^```(?:json)?\s*|```$', re.MULTILINE)
        texto_limpio = patron.sub('', resultado).strip()

        # 2. Convertir a JSON (diccionario Python)
        datos_json = json.loads(texto_limpio)
        
        return datos_json

    except Exception as e:
        print(f"Error durante el análisis con DeepSeek: {e}")
        raise HTTPException(status_code=500, detail="Error al analizar el documento con el modelo de IA.")
    
def analyze_markdownd_with_deepseek(text_content: str) -> dict:
    """
    Analiza el texto extraído con DeepSeek y devuelve un diccionario JSON.
    """
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un asistente de IA experto en la extracción de datos de documentos financieros." + PROMPT_MARKDOWN_A_JSON},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacerlos json" + text_content},
            ],
            stream=False
        )
        
        resultado = response.choices[0].message.content
        
        # 1. Eliminar ``` o ```json
        patron = re.compile(r'^```(?:json)?\s*|```$', re.MULTILINE)
        texto_limpio = patron.sub('', resultado).strip()

        # 2. Convertir a JSON (diccionario Python)
        datos_json = json.loads(texto_limpio)
        
        return datos_json

    except Exception as e:
        print(f"Error durante el análisis con DeepSeek: {e}")
        raise HTTPException(status_code=500, detail="Error al analizar el documento con el modelo de IA.")

@app.post("/analyze-pdf/")
async def analyze_pdf(request: PDFRequest):
    """
    Recibe la ruta de un PDF, lo lee, lo analiza con DeepSeek y devuelve el JSON.
    """
    try:
        # Inicializar MarkItDown y convertir el PDF
        md = MarkItDown()
        result = md.convert(request.path)
        
        if not result.text_content:
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF.")

        
        # Convertir a markdown
        md = MarkItDown()
        result = md.convert(result.text_content)  
        
        if not result.text_content:
            raise HTTPException(400, "No se pudo extraer texto")
        
        # Analizar con DeepSeek
        datos_json = analyze_with_deepseek(result.text_content)
        markdown_report = generate_markdown_report(datos_json)
        scoring = analyze_markdownd_with_deepseek(markdown_report)
        
        return markdown_report, scoring
        
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/")
def read_root():
    return {"message": "Bienvenido al servicio de análisis de PDF con DeepSeek."}
