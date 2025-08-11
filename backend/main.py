import os
import re
import json
from io import BytesIO
from fastapi import FastAPI, HTTPException
from typing import Any
from markitdown import MarkItDown
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from prompts import *
from fastapi import Query,Body
from starlette.responses import Response

# Cargar variables de entorno desde .env

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# Configuración del cliente de DeepSeek
if not DEEPSEEK_API_KEY:
    raise ValueError("No se encontró la API Key de DeepSeek en las variables de entorno.")

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")


def generate_markdown_report(datos_json: dict) -> str:
    """
    Genera un informe en formato Markdown a partir de los datos JSON analizados.
    """
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un analista financiero especializado en evaluación de crédito. Tu tarea es realizar un análisis completo de salud financiera para determinar si una empresa es candidata a recibir crédito, utilizando los datos proporcionados en formato JSON."
                 + PLANTILLA_ANALISIS_CREDITO + " no agregar ninguna otra información adicional solamente el análisis de salud financiera y la estructura del análisis y presentar el resultado en markdown"},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacer el análisis" + str(datos_json)},
            ],
            temperature=0,
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error al generar el informe Markdown: {e}")
        raise HTTPException(status_code=500, detail="Error al generar el informe Markdown.")

def analyze_with_deepseek(text_content: str) -> dict:
    """
    Analiza el texto extraído con DeepSeek y devuelve un diccionario JSON.
    """
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un asistente de IA experto en la extracción de datos de documentos financieros." + PROMPT_BALANCE_SHEET },
                {"role": "user", "content": "Usa esta información para extraer los datos y hacerlos json" + text_content},
            ],
            temperature=0,
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
                {"role": "system", "content": "Eres un asistente de IA experto en la extracción de datos de documentos financieros." +  PROMPT_MARKDOWN_A_JSON},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacerlos json" + text_content},
            ],
            temperature=0,
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
    
def analyze_X_with_deepseek(text_content: list) -> dict:
    """
    Analiza el texto extraído con DeepSeek y devuelve un diccionario JSON.
    """
    try:
        # Convertir la lista de JSON a string para incluirla en el prompt
        # Si text_content contiene diccionarios, los convertimos a JSON string
        if isinstance(text_content, list):
            # Si los elementos son diccionarios, los convertimos a JSON string
            text_content_str = "\n".join([
                json.dumps(item, ensure_ascii=False) if isinstance(item, dict) else str(item) 
                for item in text_content
            ])
        else:
            text_content_str = str(text_content)
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un asistente de IA experto en la extracción de datos y análisis de redes sociales como X(Twitter) " +  PROMPT_ANALISIS_TWEETS},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacerlos json" + text_content_str},
            ],
            temperature=0,
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

def analyze_LNK_with_deepseek(text_content: list) -> dict:
    """
    Analiza el texto extraído con DeepSeek y devuelve un diccionario JSON.
    """
    try:
        # Convertir la lista de JSON a string para incluirla en el prompt
        # Si text_content contiene diccionarios, los convertimos a JSON string
        if isinstance(text_content, list):
            # Si los elementos son diccionarios, los convertimos a JSON string
            text_content_str = "\n".join([
                json.dumps(item, ensure_ascii=False) if isinstance(item, dict) else str(item) 
                for item in text_content
            ])
        else:
            text_content_str = str(text_content)
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un asistente de IA experto en la extracción de datos y análisis de redes sociales como LINKEDIN" +  PROMPT_RELEVANCIA_LINKEDIN},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacerlos json" + text_content_str},
            ],
            temperature=0,
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
    
def analyze_FB_with_deepseek(text_content: list) -> dict:
    """
    Analiza el texto extraído con DeepSeek y devuelve un diccionario JSON.
    """
    try:
        # Convertir la lista de JSON a string para incluirla en el prompt
        # Si text_content contiene diccionarios, los convertimos a JSON string
        if isinstance(text_content, list):
            # Si los elementos son diccionarios, los convertimos a JSON string
            text_content_str = "\n".join([
                json.dumps(item, ensure_ascii=False) if isinstance(item, dict) else str(item) 
                for item in text_content
            ])
        else:
            text_content_str = str(text_content)
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Eres un asistente de IA experto en la extracción de datos y análisis de redes sociales como FACEBOOK" +  PROMPT_RELEVANCIA_FACEBOOK},
                {"role": "user", "content": "Usa esta información para extraer los datos y hacerlos json" + text_content_str},
            ],
            temperature=0,
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

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:8080","http://socialcredit.masappec.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/x-posts/{username}")
async def get_x_posts(username: str):
    # Simulated JSON response for X (Twitter) posts
    mock_x_posts = [
        {
            "url": "https://x.com/BancoPichincha/status/1952471967098974349",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1952471967098974349",
            "id": "1952471967098974349",
            "text": "https://t.co/F38AzhN69M",
            "retweetCount": 484,
            "replyCount": 0,
            "likeCount": 2682,
            "quoteCount": 210,
            "createdAt": "Mon Aug 04 20:49:26 +0000 2025",
            "bookmarkCount": 100,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1951977538554937785",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1951977538554937785",
            "id": "1951977538554937785",
            "text": "https://t.co/zMvuvr0gZH",
            "retweetCount": 216,
            "replyCount": 0,
            "likeCount": 1298,
            "quoteCount": 696,
            "createdAt": "Sun Aug 03 12:04:45 +0000 2025",
            "bookmarkCount": 129,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1951058894689878204",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1951058894689878204",
            "id": "1951058894689878204",
            "text": "Entérate de lo nuevo en Banco Pichincha en 40 segundos. \nPremiamos a las empresas que impulsan los mejores proyectos sostenibles.\nTe mostramos la manera de recibir dinero desde España, gratis y en minutos.\nSomos la marca financiera más influyente del país. https://t.co/SxGyaSSp1W",
            "retweetCount": 8,
            "replyCount": 0,
            "likeCount": 68,
            "quoteCount": 12,
            "createdAt": "Thu Jul 31 23:14:24 +0000 2025",
            "bookmarkCount": 5,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1948790052424696118",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1948790052424696118",
            "id": "1948790052424696118",
            "text": "https://t.co/U0tHncuCbP",
            "retweetCount": 36,
            "replyCount": 0,
            "likeCount": 206,
            "quoteCount": 66,
            "createdAt": "Fri Jul 25 16:58:49 +0000 2025",
            "bookmarkCount": 7,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1947884378367135877",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1947884378367135877",
            "id": "1947884378367135877",
            "text": "Confianza es creer... https://t.co/XnKwrjhEJD",
            "retweetCount": 33,
            "replyCount": 3,
            "likeCount": 450,
            "quoteCount": 20,
            "createdAt": "Wed Jul 23 05:00:00 +0000 2025",
            "bookmarkCount": 23,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1943787516009787599",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1943787516009787599",
            "id": "1943787516009787599",
            "text": "El amarillo no es solo un color. Es orgullo. Es pasión. \n¡Vamos a darlo todo en la cancha! ⚽️\n#ConfianzaEsCreer en el poder del deporte femenino que inspira y empodera.  https://t.co/NHvq2qD63g",
            "retweetCount": 2,
            "replyCount": 0,
            "likeCount": 10,
            "quoteCount": 2,
            "createdAt": "Fri Jul 11 21:40:32 +0000 2025",
            "bookmarkCount": 0,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1939733885665132783",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1939733885665132783",
            "id": "1939733885665132783",
            "text": "¿Tienes 40 segundos? Entérate de #LoNuevoEnBancoPichincha \nPagar o cobrar con tu QR es ahora más fácil.\nConoce la mejor iniciativa para empezar tu carrera laboral.\n Voluntariado para apoyar a comunidad de Cayambe. https://t.co/PuxFSjsC7f",
            "retweetCount": 3,
            "replyCount": 0,
            "likeCount": 14,
            "quoteCount": 9,
            "createdAt": "Mon Jun 30 17:12:51 +0000 2025",
            "bookmarkCount": 3,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1935809008977559845",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1935809008977559845",
            "id": "1935809008977559845",
            "text": " En Ecuador, 6 de cada 10 familias de zonas rurales aún no tienen acceso a agua potable. Conseguirla implica recorrer largas distancias o pagar altos costos.\nPor eso, Banco Pichincha impulsa Sumar Juntos, iniciativa que ya ha cambiado la vida a más de 26 mil personas. ",
            "retweetCount": 26,
            "replyCount": 0,
            "likeCount": 124,
            "quoteCount": 1,
            "createdAt": "Thu Jun 19 21:16:47 +0000 2025",
            "bookmarkCount": 8,
            "isRetweet": "false",
            "isQuote": "false"
        },
        {
            "url": "https://x.com/BancoPichincha/status/1934630404935524538",
            "twitterUrl": "https://twitter.com/BancoPichincha/status/1934630404935524538",
            "id": "1934630404935524538",
            "text": "Hoy celebramos el esfuerzo de quienes, a pesar de la distancia, siempre están presentes. ✨\nPorque detrás de cada envío que realizan, hay más que dinero… hay medicinas, educación, sueños y, sobre todo, ese amor de familia que nunca se pierde. \n#DíaInternacionalDeLasRemesas https://t.co/TRPxs73Yvj",
            "retweetCount": 3,
            "replyCount": 0,
            "likeCount": 29,
            "quoteCount": 0,
            "createdAt": "Mon Jun 16 15:13:26 +0000 2025",
            "bookmarkCount": 3,
            "isRetweet": "false",
            "isQuote": "false"
        }
    ]
    score_x = analyze_X_with_deepseek(mock_x_posts)
    return score_x

@app.get("/lnk-posts/{username}")
async def get_lnk_posts(username: str):
    # Simulated JSON response for X (Twitter) posts
    mock_lnk_posts =[
  {
    "urn": "urn:li:fsd_company:3068933",
    "url": "https://linkedin.com/company/banco-pichincha-ca/",
    "name": "Banco Pichincha",
    "avatar": "https://media.licdn.com/dms/image/v2/C4E0BAQFypsb1Ke2ARg/company-logo_200_200/company-logo_200_200/0/1631366537945/banco_pichincha_ca_logo?e=1757548800&v=beta&t=2piSs0m1GYIOh6Z1gMDvYruStUXHJ2RTpn6CL47XZQk",
    "tagline": "En confianza",
    "description": "En Banco Pichincha estamos conscientes que hay nuevas maneras de ver el mundo; por eso, queremos aprovechar nuestra posición de liderazgo en Ecuador, avalada por 119 años de historia, para acercar a nuestros clientes las oportunidades que brinda la nueva era en que vivimos.\n\nFormamos parte del Grupo Pichincha con presencia, también, en Perú, Colombia, España, Estados Unidos y Panamá. El grupo financiero favorece la diversidad e impulsa la inclusión en el diseño de los servicios que ofrece a sus clientes. Es flexible a los cambios que demanda un entorno más global y competitivo con el propósito de generar valor para sus públicos de interés.\n\nHemos asumido el desafío de evolucionar hacia un modelo de banca con presencia internacional, moderna y ágil, sin perder la solidez y confianza a nivel local. Cada uno de nuestros más de 10.000 colaboradores en los seis países en los que estamos presentes son fundamentales para abrirnos a los nuevos retos del mercado que exige nuevas maneras de hacer las cosas.  \n\nLa sostenibilidad y la responsabilidad social corporativa son pilares fundamentales de nuestro modelo de negocio. Este compromiso que busca propiciar un impacto positivo y justo en la sociedad nos ha valido el reconocimiento de diferentes entidades y organismos latinoamericanos y europeos.",
    "industry": [
      "Banking"
    ],
    "websiteUrl": "http://www.pichincha.com",
    "headquarter": {
      "description": "matriz",
      "country": "EC",
      "city": "Quito",
      "postalCode": "null"
    },
    "hashtag": [
      "#bancopichincha",
      "#bancoconpropósito"
    ],
    "foundedOn": {
      "month": "null",
      "year": 1906,
      "day": "null"
    },
    "crunchbaseFunding": {
      "numberOfFundingRounds": 2,
      "lastFundingRound": {
        "localizedFundingType": "Debt financing",
        "leadInvestors": [
          {
            "name": "CAF",
            "crunchbaseUrl": "https://www.crunchbase.com/organization/caf?utm_source=linkedin&utm_medium=referral&utm_campaign=linkedin_companies&utm_content=investor"
          }
        ],
        "amountRaised": "137000000",
        "currencyCode": "USD",
        "announcedOn": {
          "month": 1,
          "year": 2025,
          "day": 17
        }
      },
      "crunchbaseUrl": "https://www.crunchbase.com/organization/banco-pichincha?utm_source=linkedin&utm_medium=referral&utm_campaign=linkedin_companies&utm_content=profile_cta"
    },
    "employeeCount": 7909,
    "followerCount": 294633
  }
]
    score_lnk = analyze_LNK_with_deepseek(mock_lnk_posts)
    return score_lnk

@app.get("/fb-posts/{username}")
async def get_fb_posts(username: str):

    mock_fb_posts =[
  {
    "title": "Banco Pichincha | Quito",
    "categories": [
      "Page",
      "Financial service"
    ],
    "likes": 1135817,
    "info": [
      "Banco Pichincha, Quito. 1,135,817 likes",
      "30,357 talking about this",
      "2,833 were here. 119 años cultivando confianza comprometidos con un país que crece..."
    ],
    "email": "facebook@pichincha.com",
    "phone": "+593 2-299-9999",
    "address": "Amazonas 4560 y Pereira, Quito, Ecuador https://maps.google.com/maps?q=-0.17125498%2C-78.48520535&hl=en",
    "website": "pichincha.com",
    "pageUrl": "https://www.facebook.com/BancoPichinchaEcuador/"
  }
]
    score_fb = analyze_FB_with_deepseek(mock_fb_posts)
    return score_fb


@app.post("/analyze-pdf/")
async def analyze_pdf(file: UploadFile = File(..., description="PDF a convertir")) -> Any:
    """
    Recibe un PDF de un estado financiero, lo lee, lo analiza con DeepSeek y devuelve el JSON.
    """
    try:
        
        if file.content_type not in ("application/pdf", "application/x-pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail="Solo se acepta PDF")
    
        # Leemos el PDF a memoria y lo convertimos
        data = await file.read()
        if not data:
            raise ValueError("Archivo vacío")
    
        # Inicializar MarkItDown y convertir el PDF
        md = MarkItDown()
        result = md.convert_stream(BytesIO(data), file_name=file.filename)
        
        if not result.text_content:
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF.")
        
        print(f"Texto extraído del PDF: {result.text_content[:100]}...")
        
        # Analizar con DeepSeek
        datos_json = analyze_with_deepseek(result.text_content)
        print(f"Datos JSON extraídos con Deepseek: {datos_json}")
        
        markdown_report = generate_markdown_report(datos_json)
        print(f"Informe Markdown generado: {markdown_report[:100]}...")
        
        scoring = analyze_markdownd_with_deepseek(markdown_report)
        print(f"Scoring obtenido: {scoring}")
        
        result = {
            "datos_json": datos_json,
            "markdown_report": str(markdown_report),
            "scoring": scoring
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f'Error Interno {str(e)}')
    
@app.get("/social-score/v2/{username}")
async def social_score_v2(
    username: str,
    w_x: float = Query(0.40, ge=0.0),
    w_lnk: float = Query(0.35, ge=0.0),
    w_fb: float = Query(0.25, ge=0.0),
):
    """
    Metodología:
      1) Pesos base (ajustables): X=0.40, LNK=0.35, FB=0.25
      2) Confianza:
         - X: min(1, n_tweets/10)
         - LinkedIn: 0.8 + 0.2 * completitud.proporcion
         - Facebook: 0.7 + 0.3 * completitud.proporcion
         (si falta, 0.7)
      3) Agregación: peso_efectivo = peso_base * confianza; renormaliza; media ponderada
      4) Banda: Excelente / Fuerte / Moderado / Débil / Crítico
    """
    errors = []
    per_platform = []

    # Helper local para parsear posibles JSONResponse sin helpers externos
    def parse_json(resp):
        if isinstance(resp, Response):
            try:
                return json.loads(resp.body.decode("utf-8"))
            except Exception:
                return {}
        return resp if isinstance(resp, (dict, list)) else {}

    # --- X (Twitter) ---
    try:
        x_data = parse_json(await get_x_posts(username))
        x_score = (
            x_data.get("resumen_lote", {})
                  .get("promedios", {})
                  .get("general", None)
        )
        n_tweets = x_data.get("resumen_lote", {}).get("n", None)
        if isinstance(x_score, (int, float)):
            conf_x = min(1.0, max(0.0, float(n_tweets)/10.0)) if isinstance(n_tweets, (int, float)) else 0.7
            per_platform.append({
                "platform": "x",
                "score_1_10": float(x_score),
                "base_weight": float(w_x),
                "confidence": float(conf_x),
                "meta": {"n_tweets": int(n_tweets or 0)}
            })
        else:
            errors.append("X: score no disponible (resumen_lote.promedios.general).")
    except Exception as e:
        errors.append(f"X error: {e}")

    # --- LinkedIn ---
    try:
        lnk_data = parse_json(await get_lnk_posts(username))
        lnk_score = lnk_data.get("relevancia_1_10", None)
        comp_lnk = lnk_data.get("completitud", {}).get("proporcion", None)
        if isinstance(lnk_score, (int, float)):
            conf_lnk = (0.8 + 0.2 * float(comp_lnk)) if isinstance(comp_lnk, (int, float)) else 0.7
            conf_lnk = max(0.0, min(1.0, conf_lnk))
            per_platform.append({
                "platform": "linkedin",
                "score_1_10": float(lnk_score),
                "base_weight": float(w_lnk),
                "confidence": float(conf_lnk),
                "meta": {"completitud": comp_lnk}
            })
        else:
            errors.append("LinkedIn: score no disponible (relevancia_1_10).")
    except Exception as e:
        errors.append(f"LinkedIn error: {e}")

    # --- Facebook ---
    try:
        fb_data = parse_json(await get_fb_posts(username))
        best_fb_score, best_fb_comp = None, None
        if isinstance(fb_data, list):
            for p in fb_data:
                if not isinstance(p, dict):
                    continue
                s = p.get("relevancia_1_10", None)
                c = p.get("completitud", {}).get("proporcion", None)
                if isinstance(s, (int, float)) and (best_fb_score is None or s > best_fb_score):
                    best_fb_score, best_fb_comp = float(s), c
        elif isinstance(fb_data, dict):
            s = fb_data.get("relevancia_1_10", None)
            c = fb_data.get("completitud", {}).get("proporcion", None)
            if isinstance(s, (int, float)):
                best_fb_score, best_fb_comp = float(s), c

        if best_fb_score is not None:
            conf_fb = (0.7 + 0.3 * float(best_fb_comp)) if isinstance(best_fb_comp, (int, float)) else 0.7
            conf_fb = max(0.0, min(1.0, conf_fb))
            per_platform.append({
                "platform": "facebook",
                "score_1_10": float(best_fb_score),
                "base_weight": float(w_fb),
                "confidence": float(conf_fb),
                "meta": {"completitud": best_fb_comp}
            })
        else:
            errors.append("Facebook: score no disponible (relevancia_1_10).")
    except Exception as e:
        errors.append(f"Facebook error: {e}")

    if not per_platform:
        raise HTTPException(status_code=500, detail={"message": "No hay datos para calcular el score.", "errors": errors})

    # --- Agregación con renormalización de pesos efectivos ---
    eff_weights = [p["base_weight"] * p["confidence"] for p in per_platform]
    total_eff = sum(eff_weights)
    if total_eff <= 0:
        total_eff = float(len(per_platform))
        eff_weights = [1.0] * len(per_platform)

    for p, ew in zip(per_platform, eff_weights):
        p["effective_weight_share"] = float(ew / total_eff)

    final_score = sum(p["score_1_10"] * p["effective_weight_share"] for p in per_platform)

    # Banda simple
    if final_score >= 9: band = "Excelente"
    elif final_score >= 7: band = "Fuerte"
    elif final_score >= 5: band = "Moderado"
    elif final_score >= 3: band = "Débil"
    else: band = "Crítico"

    return {
        "version": "2.0",
        "username": username,
        "methodology": {
            "weights_base": {"x": w_x, "linkedin": w_lnk, "facebook": w_fb},
            "confidence_rules": {
                "x": "min(1, n_tweets/10)",
                "linkedin": "0.8 + 0.2 * completitud.proporcion",
                "facebook": "0.7 + 0.3 * completitud.proporcion",
                "default_if_missing": 0.7
            },
            "aggregation": "peso_efectivo = peso_base * confianza; renormalización; media ponderada"
        },
        "per_platform": per_platform,
        "final_score_1_10": round(float(final_score), 2),
        "band": band,
        "errors": errors or None
    }

def _band(x: float) -> str:
    return "Excelente" if x >= 9 else "Fuerte" if x >= 7 else "Moderado" if x >= 5 else "Débil" if x >= 3 else "Crítico"

@app.post("/credit-score/v1")
async def credit_score_v1(
    payload: dict = Body(..., description="{'username': str, 'financial_scoring': {...} | optional, 'score_fin': float | optional, 'w_fin': float=0.7, 'w_soc': float=0.3}")
):
    print(f"Payload recibido: {payload}")
    username = payload.get("username")
    if not username:
        raise HTTPException(400, "Falta 'username'")

    # Pesos (usuario decide)
    w_fin = float(payload.get("w_fin", 0.7))
    w_soc = float(payload.get("w_soc", 0.3))
    if (w_fin + w_soc) <= 0:
        raise HTTPException(400, "w_fin y w_soc no pueden ser ambos cero.")

    # ------- Financiero (ya calculado) -------
    fin_scoring = payload.get("financial_scoring") or {}
    score_fin = payload.get("score_fin")

    # score_fin: usa el que te pasan; si no, intenta extraer del JSON; si no, suma parciales
    if not isinstance(score_fin, (int, float)):
        score_fin = (
            fin_scoring.get("conclusion_final", {}).get("puntuacion_total", None)
            if isinstance(fin_scoring, dict) else None
        )
    if not isinstance(score_fin, (int, float)):
        indicadores = (fin_scoring.get("indicadores") or []) if isinstance(fin_scoring, dict) else []
        score_fin = sum(float(i.get("puntuacion", 0) or 0) for i in indicadores) if indicadores else 0.0

    score_fin = max(0.0, min(10.0, float(score_fin)))
    
    # completitud -> confianza financiera (sin fechas)
    indicadores = (fin_scoring.get("indicadores") or []) if isinstance(fin_scoring, dict) else []
    vals = [i.get("puntuacion") for i in indicadores if isinstance(i.get("puntuacion"), (int, float))]
    completeness = min(1.0, (len(vals) / 5.0)) if indicadores else 0.6
    conf_fin = max(0.3, min(1.0, 0.6 + 0.4 * completeness))
    band_fin = _band(score_fin)
    
    # ------- Social (reusa tu endpoint v2) -------
    w_x  = float(payload.get("w_x", 0.40))
    w_lnk = float(payload.get("w_lnk", 0.35))
    w_fb  = float(payload.get("w_fb", 0.25))

    soc = await social_score_v2(username=username, w_x=w_x, w_lnk=w_lnk, w_fb=w_fb)
    score_soc = float(soc.get("final_score_1_10", 0.0))
    per_platform = soc.get("per_platform", []) or []
    conf_soc = sum(
        float(p.get("confidence", 0)) * float(p.get("effective_weight_share", 0))
        for p in per_platform
    ) if per_platform else 0.7
    conf_soc = max(0.0, min(1.0, conf_soc))
    band_soc = soc.get("band", "N/A")
    
    
    # ------- Agregación simple -------
    eff_fin = w_fin * conf_fin
    eff_soc = w_soc * conf_soc
    total = (eff_fin + eff_soc) or 1.0
    share_fin = eff_fin / total
    share_soc = eff_soc / total

    final_score = round(score_fin * share_fin + score_soc * share_soc, 2)
    band_final = _band(final_score)
    
    # ------- Reglas -------
    if score_fin < 4.0:
        decision, limit_usd = "Rechazado", 0
    elif final_score >= 8.5 and score_fin >= 7.0:
        decision, limit_usd = "Aprobado", 5000
    elif final_score >= 7.0:
        decision, limit_usd = "Aprobado", 3500
    elif final_score >= 5.5:
        decision, limit_usd = "Aprobado con condiciones", 2000
    elif final_score >= 4.0:
        decision, limit_usd = "Revisión manual", 1000
    else:
        decision, limit_usd = "Rechazado", 0

    conditions = []
    if decision in ("Aprobado con condiciones", "Revisión manual"):
        conditions = ["Domiciliación de pagos", "Garante/colateral ligero"]

    result = {
        "version": "1.1",
        "weights_input": {"financial": round(w_fin, 2), "social": round(w_soc, 2)},
        "confidences": {"financial": round(conf_fin, 2), "social": round(conf_soc, 2)},
        "components": {
            "financial": {
                "score_1_10": round(score_fin, 2),
                "band": band_fin,
                "completeness": round(completeness, 2)
            },
            "social": {
                "score_1_10": round(score_soc, 2),
                "band": band_soc,
                "per_platform": per_platform
            }
        },
        "shares": {"financial": round(share_fin, 2), "social": round(share_soc, 2)},
        "final_score_1_10": final_score,
        "band": band_final,
        "decision": decision,
        "credit_limit_recommended_usd": limit_usd,
        "conditions": conditions
    }
    
    print(f"Resultado final: {result}")

    return result


@app.get("/")
def read_root():
    return {"message": "Bienvenido al servicio de análisis de PDF con DeepSeek."}