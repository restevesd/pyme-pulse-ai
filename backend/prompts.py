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

PROMPT_BALANCE_SHEET = (
    "Extrae los siguientes datos clave del estado de situación financiera (balance sheet) \n"
    "proporcionado en el PDF y estructúralos en formato JSON. \n"
    "El objetivo es evaluar la salud financiera de la empresa para otorgamiento de crédito.\n\n"
    "Instrucciones:\n"
    "1. Identifica y extrae únicamente los campos numéricos (en la moneda especificada, ej: USD$) "
    "del estado de situación financiera.\n"
    "2. Si algún dato no está explícito en el documento, omítelo (no inventes valores).\n"
    "3. Usa el siguiente esquema JSON exactamente:\n"
    "{\n"
    '  "empresa": "Nombre de la empresa (si está disponible)",\n'
     '  "RUC": "RUC de la empresa (si está disponible)",\n'
    '  "fecha": "Fecha del estado financiero (ej: \'2024-12-31\')",\n'
    '  "moneda": "Moneda utilizada (ej: \'USD\')",\n'
    '  "activo_corriente": {\n'
    '    "efectivo_y_equivalentes": "Monto en efectivo y equivalentes",\n'
    '    "cuentas_por_cobrar": "Total de cuentas por cobrar",\n'
    '    "cuentas_por_cobrar_accionistas": "Cuentas por cobrar a accionistas (si está desglosado)",\n'
    '    "otros_activos_corrientes": "Otros activos corrientes (si aplica)",\n'
    '    "total_activo_corriente": "Total del activo corriente"\n'
    "  },\n"
    '  "activo_no_corriente": {\n'
    '    "inventarios": "Inventarios (si aplica)",\n'
    '    "activos_fijos": "Activos fijos netos",\n'
    '    "activos_intangibles": "Activos intangibles",\n'
    '    "otros_activos_no_corrientes": "Otros activos no corrientes",\n'
    '    "total_activo_no_corriente": "Total del activo no corriente"\n'
    "  },\n"
    '  "total_activo": "Total del activo",\n'
    '  "pasivo_corriente": {\n'
    '    "cuentas_por_pagar": "Cuentas por pagar comerciales",\n'
    '    "anticipos_de_clientes": "Anticipos de clientes",\n'
    '    "otros_pasivos_corrientes": "Otros pasivos corrientes",\n'
    '    "total_pasivo_corriente": "Total del pasivo corriente"\n'
    "  },\n"
    '  "pasivo_no_corriente": {\n'
    '    "deuda_largo_plazo": "Deudas a largo plazo",\n'
    '    "otros_pasivos_no_corrientes": "Otros pasivos no corrientes",\n'
    '    "total_pasivo_no_corriente": "Total del pasivo no corriente"\n'
    "  },\n"
    '  "total_pasivo": "Total del pasivo",\n'
    '  "patrimonio_neto": {\n'
    '    "capital_suscrito": "Capital suscrito",\n'
    '    "reservas": "Reservas",\n'
    '    "resultados_acumulados": "Resultados acumulados",\n'
    '    "ganancia_perdida_ejercicio": "Ganancia o pérdida del ejercicio actual",\n'
    '    "total_patrimonio_neto": "Total del patrimonio neto"\n'
    "  },\n"
    '  "total_pasivo_patrimonio": "Total pasivo + patrimonio neto (debe coincidir con total activo)"\n'
    "}\n\n"
    "Procesa el PDF y devuelve únicamente el objeto JSON anterior, sin texto adicional."
)

PLANTILLA_ANALISIS_CREDITO = (
    "Análisis de Salud Financiera para Otorgamiento de Crédito\n"
    "Empresa: {empresa}\n"
    "Moneda: {moneda}\n"
    "Fecha: {fecha}\n\n"
    "Indicadores Clave y Ponderación (Total: 10 puntos)\n"
    "Se evalúan 5 dimensiones críticas para otorgar crédito, asignando pesos según su impacto en la solvencia y liquidez de la empresa.\n\n" 
    " 1. **Analiza los datos financieros** del JSON proporcionado, que sigue esta estructura:\n"
   "- Datos de identificación (empresa, fecha, moneda)\n"
   "- Activo corriente y no corriente desglosado\n"
   "- Pasivo corriente y no corriente desglosado\n"
   "- Patrimonio neto desglosado\n"
   "- Totales de activo, pasivo y patrimonio\n\n"

"2. **Evalúa 5 dimensiones críticas** para otorgamiento de crédito, asignando los siguientes pesos:\n"
 "  - Liquidez Inmediata (3 puntos)\n"
  " - Solvencia y Endeudamiento (2 puntos)\n"
   "- Rentabilidad (2 puntos)\n"
   "- Calidad de Activos (2 puntos)\n"
   "- Flexibilidad Financiera (1 punto)\n\n"

"3. **Para cada dimensión, incluye**:\n"
 "  - Datos clave relevantes extraídos del JSON\n"
  " - Justificación basada en los datos\n"
   "- Riesgos identificados\n"
   "- Puntuación parcial (según el peso de la dimensión) y motivo\n\n"

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

# -*- coding: utf-8 -*-
"""
Variable de entrada para el análisis de tweets.
Contiene el prompt completo con marcadores de plantilla {{tweets_json}} y {{params}}
listos para ser sustituidos por valores reales antes de enviar al modelo.
"""

PROMPT_ANALISIS_TWEETS = (
    "TAREA\n"
    "Analiza un conjunto de tweets y devuelve:\n"
    "1) actividad_1_10 (1= muy baja, 10= muy alta),\n"
    "2) sentimiento_1_10 (1= muy negativo, 10= muy positivo),\n"
    "3) general_1_10 = promedio ponderado de actividad y sentimiento.\n\n"
    "ENTRADA\n"
    "- tweets_json: lista de objetos con, al menos:\n"
    "  id, text, createdAt, retweetCount, replyCount, likeCount, quoteCount, bookmarkCount,\n"
    "  isRetweet, isQuote\n"
    "- params (opcionales con defaults razonables):\n"
    "  {\n"
    '    "weights_engagement": {"like":1.0,"retweet":3.0,"reply":2.0,"quote":2.5,"bookmark":1.5},\n'
    "    \"half_life_hours\": 48,                 // decaimiento temporal del engagement\n"
    "    \"winsor_p\": 0.95,                      // recorte superior para outliers antes de normalizar\n"
    "    \"activity_scale\": \"minmax_1_10\",       // normalización\n"
    "    \"general_weights\": {\"activity\":0.5,\"sentiment\":0.5},\n"
    "    \"neutral_if_only_url\": true,\n"
    "    \"include_retweets\": false,             // si false, ignora retweets al calcular sentimiento\n"
    "    \"language\": \"es\",\n"
    "    \"return_explanations\": false           // si true, agrega 'explicacion' breve por tweet\n"
    "  }\n\n"
    "MÉTODO\n"
    "A) Preproceso\n"
    "- Limpia 'text' de URLs SOLO para el análisis de sentimiento (no toques el original).\n"
    "- Si el texto queda vacío o era solo URL y neutral_if_only_url = true ⇒ sentimiento base = 5.\n"
    "- Si isRetweet = true y include_retweets = false ⇒ SENTIMIENTO: no evalúes el texto; usa 5.\n\n"
    "B) Actividad (1–10)\n"
    "1. engagement_bruto = Σ (métrica * peso) =\n"
    "   like*weights.like + retweet*weights.retweet + reply*weights.reply\n"
    "   + quote*weights.quote + bookmark*weights.bookmark\n"
    "2. Ajuste por tiempo (decaimiento): \n"
    "   horas = ahora - createdAt (UTC). \n"
    "   engagement_ajustado = engagement_bruto / (1 + horas/half_life_hours)\n"
    "3. Winsorización: limita engagement_ajustado al percentil winsor_p dentro del mismo lote.\n"
    "4. Normaliza a [1..10] dentro del lote:\n"
    "   - Si todos iguales ⇒ actividad_1_10 = 5 para todos.\n"
    "   - Si no: actividad_1_10 = 1 + 9 * (x - min) / (max - min).\n\n"
    "C) Sentimiento (1–10)\n"
    "Usa un enfoque híbrido simple, robusto al español:\n"
    "- Reglas: puntúa palabras/frases (case-insensitive):\n"
    "  POSITIVAS (suma +1 punto léxico por match): \"confianza\", \"orgullo\", \"pasión\", \"vamos\",\n"
    "  \"gracias\", \"feliz\", \"logro\", \"mejor\", \"gratis\", \"fácil\", \"apoya\", \"iniciativa\", \"éxito\",\n"
    "  hashtags positivos (p.ej., #ConfianzaEsCreer).\n"
    "  NEGATIVAS (suma +1 punto léxico por match): \"problema\", \"error\", \"caído\", \"lento\",\n"
    "  \"fraude\", \"denuncia\", \"queja\", \"interrupción\", \"no funciona\".\n"
    "- Señales contextuales:\n"
    "  • Exclamaciones múltiples y emojis positivos (+0.5) o negativos (-0.5).\n"
    "  • Imperativos de queja (“arreglen”, “solucionen”) (-1).\n"
    "- Puntaje base:\n"
    "  score = 5 + 1.5*(positivos) - 2.0*(negativos) + ajustes contextuales.\n"
    "- Clipa a [1..10]. Si include_retweets=false y es RT ⇒ 5.\n\n"
    "**Adicional:**\n"
    "| Nivel | Rango | Características |\n"
    "|-------|-------|----------------|\n"
    "| Muy Negativo | 1-2 | Críticas, quejas, problemas graves, lenguaje agresivo |\n"
    "| Negativo | 3-4 | Problemas menores, insatisfacción, preocupación |\n"
    "| Neutral | 5-6 | Información objetiva, enlaces sin contexto, datos |\n"
    "| Positivo | 7-8 | Logros, soluciones, lenguaje optimista, promociones |\n"
    "| Muy Positivo | 9-10 | Éxitos destacados, impacto social, valores positivos, reconocimiento |\n"
    "**Factores a considerar:**\n"
    "- Palabras clave positivas: \"éxito\", \"logro\", \"mejor\", \"gracias\", \"orgullo\", \"celebramos\", \"apoyo\", \"solución\"\n"
    "- Palabras clave negativas: \"problema\", \"error\", \"falla\", \"lamentamos\", \"incapacidad\", \"difícil\"\n"
    "- Contexto del mensaje: ¿Resuelve problemas? ¿Comunica logros? ¿Informa neutralemente?\n"
    "- Emojis y símbolos: Positivos (✨, ⚽️, ❤️) vs Negativos (😠, ❌, ⚠️)\n"
    "- Hashtags: ¿Refuerzan mensaje positivo o son neutrales?\n"
    "Rubrica de control:\n"
    "  1–2: queja severa/alerta de incidente / tono hostil\n"
    "  3–4: negativo leve, disconformidad\n"
    "  5: informativo/neutro\n"
    "  6–7: positivo leve (beneficios, invitación)\n"
    "  8–9: positivo fuerte (logros, premios, impacto social)\n"
    "  10: euforia / hit contundente\n\n"
    "D) Indicador General (1–10)\n"
    "general_1_10 = activity_w * actividad_1_10 + sentiment_w * sentimiento_1_10,\n"
    "con general_weights por defecto 0.5/0.5. Redondea a 2 decimales todas las escalas.\n\n"
    "E) QA y bordes\n"
    "- Si faltan métricas numéricas, asúmelas 0.\n"
    "- createdAt inválido ⇒ omite decaimiento y documenta en 'explicacion' si está activo.\n"
    "- isQuote: evalúa sentimiento del texto citado SOLO si aparece explícito en 'text'; si no, ignóralo.\n\n"
    "SALIDA (JSON)\n"
    "{\n"
    '  "params_usados": { ... },\n'
    '  "resumen_lote": {\n'
    '    "n": <int>,\n'
    '    "promedios": {\n'
    '      "actividad": <float>,\n'
    '      "sentimiento": <float>,\n'
    '      "general": <float>\n'
    '    },\n'
    '    "top_por_general": [{"id": "...", "general_1_10": <float>}],\n'
    '    "fecha_proceso_utc": "<ISO8601>"\n'
    "  },\n"
    '  "por_tweet": [\n'
    "    {\n"
    '      "id": "<string>",\n'
    '      "actividad_1_10": <float>,\n'
    '      "sentimiento_1_10": <float>,\n'
    '      "general_1_10": <float>,\n'
    '      "actividad_componentes": {\n'
    '        "engagement_bruto": <float>,\n'
    '        "engagement_ajustado": <float>\n'
    "      },\n"
    '      "banderas": {\n'
    '        "solo_url": <bool>,\n'
    '        "retweet_ignorado": <bool>,\n'
    '        "texto_vacio": <bool>\n'
    "      }\n"
    '      // incluir "explicacion": "<string corta>" SOLO si return_explanations = true\n'
    "    }\n"
    "  ]\n"
    "}\n\n"
    "DATOS\n"
    'tweets_json = {{tweets_json}}\n'
    "params = {{params}}"
)

# -*- coding: utf-8 -*-
"""
Variable de entrada para calcular la relevancia 1-10 de empresas.
Contiene el prompt completo con marcadores de plantilla {{empresas_json}}
listo para ser sustituido por la lista real de empresas.
"""

PROMPT_RELEVANCIA_LINKEDIN = (
    "Recibirás un array JSON de empresas con posibles campos:\n"
    "- name (string)\n"
    "- employeeCount (number)\n"
    "- followerCount (number)\n"
    "- foundedOn.year (number)\n"
    "- industry (array de strings)\n"
    "- websiteUrl (string)\n"
    "- headquarter.description (string)\n"
    "- headquarter.country (string)\n"
    "- headquarter.city (string)\n"
    "- headquarter.postalCode (string o null)\n\n"
    "Objetivo: calcular \"relevancia_1_10\" (escala 1–10) por empresa.\n\n"
    "Parámetros:\n"
    "- anio_actual = {usar aquí el año en curso}\n"
    "- empleados_score  = min(employeeCount / 50000, 1) si existe\n"
    "- seguidores_score = min(followerCount / 1000000, 1) si existe\n"
    "- antiguedad_score = min((anio_actual - foundedOn.year) / 150, 1) si existe\n"
    "- completitud_score = (# de campos presentes y no vacíos entre:\n"
    "  industry (no vacío), websiteUrl, headquarter.description, headquarter.country,\n"
    "  headquarter.city, headquarter.postalCode) / 6\n\n"
    "Cálculo:\n"
    "1) recopila los scores disponibles entre empleados/seguidores/antiguedad (ignora los faltantes)\n"
    "2) agrega completitud_score a esa lista\n"
    "3) Promedio_0_1 = promedio de la lista resultante\n"
    "4) relevancia_1_10 = 1 + 9 * Promedio_0_1\n"
    "5) redondea relevancia_1_10 a 2 decimales\n\n"
    "Devuelve SOLO un JSON con:\n"
    "  {\n"
    '    "empresa": "<name>",\n'
    '    "empleados": <number|null>,\n'
    '    "seguidores": <number|null>,\n'
    '    "anio_fundacion": <number|null>,\n'
    '    "completitud": {\n'
    '      "industry": <bool>,\n'
    '      "websiteUrl": <bool>,\n'
    '      "headquarter": {\n'
    '        "description": <bool>,\n'
    '        "country": <bool>,\n'
    '        "city": <bool>,\n'
    '        "postalCode": <bool>\n'
    "      },\n"
    '      "proporcion": <number redondeado a 2>\n'
    "    },\n"
    '    "relevancia_1_10": <number>\n'
    "  }\n"
    "DATOS\n"
    "empresas_json = {{empresas_json}}"
)

"""
Variable de entrada para calcular la relevancia 1-10 de páginas de Facebook.
Contiene el prompt completo con marcador de plantilla {{paginas_json}}
listo para ser sustituido por la lista real de páginas.
"""

PROMPT_RELEVANCIA_FACEBOOK = (
    "Eres un sistema que recibe un array JSON de páginas de Facebook con posibles campos:\n"
    "- title (string)\n"
    "- likes (number)\n"
    "- info (array de strings que puede incluir \"likes\", \"talking about this\", \"were here\")\n"
    "- email (string), phone (string), address (string), website (string), pageUrl (string)\n\n"
    "Objetivo: calcular \"relevancia_1_10\" (escala 1–10) por página usando:\n"
    "1) Extrae métricas numéricas:\n"
    "   - likes: usa el campo \"likes\" si existe; si no, busca en \"info\" una línea con \"likes\" y extrae el número.\n"
    "   - talking_about: busca en \"info\" \"talking about this\" y extrae el número.\n"
    "   - were_here: busca en \"info\" \"were here\" y extrae el número.\n"
    "   - Los números pueden venir con separadores de miles (comas o puntos); elimínalos antes de parsear.\n"
    "2) completitud_score = (# presentes y no vacíos entre {email, phone, address, website}) / 4.\n"
    "3) Normalización:\n"
    "   - likes_score     = min(likes / 2_000_000, 1)             si existe\n"
    "   - talking_score   = min(talking_about / 100_000, 1)        si existe\n"
    "   - were_here_score = min(were_here / 50_000, 1)             si existe\n"
    "4) Construye la lista de scores disponibles entre {likes_score, talking_score, were_here_score} y agrega siempre completitud_score.\n"
    "5) promedio_0_1 = promedio simple de esa lista.\n"
    "6) relevancia_1_10 = redondea_a_2_decimales(1 + 9 * promedio_0_1).\n\n"
    "Devuelve SOLO un JSON (array) con objetos:\n"
    "[\n"
    "  {\n"
    '    "pagina": "<title>",\n'
    '    "likes": <number|null>,\n'
    '    "talking_about": <number|null>,\n'
    '    "were_here": <number|null>,\n'
    '    "completitud": {\n'
    '      "email": <bool>,\n'
    '      "phone": <bool>,\n'
    '      "address": <bool>,\n'
    '      "website": <bool>,\n'
    '      "proporcion": <number redondeado a 2>\n'
    "    },\n"
    '    "relevancia_1_10": <number>\n'
    "  }\n"
    "]\n\n"
    "DATOS\n"
    "paginas_json = {{paginas_json}}"
)