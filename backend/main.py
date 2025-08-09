import os
import re
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from markitdown import MarkItDown
from openai import OpenAI
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración del cliente de DeepSeek
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    raise ValueError("No se encontró la API Key de DeepSeek en las variables de entorno.")

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

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
            
        # Analizar el texto con DeepSeek
        datos_json = analyze_with_deepseek(result.text_content)
        
        return datos_json
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"El archivo no se encontró en la ruta: {request.path}")
    except Exception as e:
        # Captura de otras posibles excepciones (ej. problemas de red con DeepSeek, etc.)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Bienvenido al servicio de análisis de PDF con DeepSeek."}
