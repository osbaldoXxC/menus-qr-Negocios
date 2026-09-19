import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from PIL import Image
Image.MAX_IMAGE_PIXELS = None

def create_presentation():

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    ORANGE = RGBColor(255, 107, 53)
    DARK_BG = RGBColor(15, 15, 16)
    CARD_BG = RGBColor(24, 24, 26)
    WHITE = RGBColor(255, 255, 255)
    GRAY_TEXT = RGBColor(163, 163, 163)
    LIGHT_GRAY = RGBColor(220, 220, 220)

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, title, category="MEXXICANMX"):
        set_slide_background(slide, DARK_BG)
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p1 = tf.paragraphs[0]
        p1.text = category.upper()
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = ORANGE

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(26)
        p2.font.bold = True
        p2.font.color.rgb = WHITE

    def add_card(slide, left, top, width, height, title, items, subtitle=""):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = RGBColor(40, 40, 45)
        shape.line.width = Pt(1)

        tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.2), Inches(width - 0.4), Inches(height - 0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        if subtitle:
            p_sub = tf.paragraphs[0]
            p_sub.text = subtitle.upper()
            p_sub.font.size = Pt(10)
            p_sub.font.bold = True
            p_sub.font.color.rgb = ORANGE
            p_title = tf.add_paragraph()
        else:
            p_title = tf.paragraphs[0]

        p_title.text = title
        p_title.font.size = Pt(18)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

        for item in items:
            p = tf.add_paragraph()
            p.text = f"• {item}"
            p.font.size = Pt(13)
            p.font.color.rgb = LIGHT_GRAY
            p.space_before = Pt(6)

    # ----------------------------------------------------
    # SLIDE 1: PORTADA
    # ----------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1, DARK_BG)

    tb1 = slide1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "MEXXICANMX"
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = ORANGE

    p = tf1.add_paragraph()
    p.text = "Plataforma Inteligente de Menús Digitales QR y Recomendación Multicampo con Machine Learning"
    p.font.size = Pt(20)
    p.font.color.rgb = WHITE
    p.space_before = Pt(12)

    p = tf1.add_paragraph()
    p.text = "Presentación Académica de Despliegue y Arquitectura Real | Tiempo estimado: 10 min"
    p.font.size = Pt(14)
    p.font.color.rgb = GRAY_TEXT
    p.space_before = Pt(24)

    # Info footer
    add_card(slide1, 1.0, 5.2, 11.333, 1.5, "Equipo de Desarrollo & Evaluación", [
        "Integrantes: [Osbaldo X. C. / Equipo MexxicanMX]",
        "Materia: Desarrollo de Software Integrador | Profesor: [Nombre del Profesor]",
        "Entorno en Producción: https://mexxicanmx.oamdevsol.site | AWS Cloud Infrastructure"
    ], "INFORMACIÓN DEL PROYECTO")

    # ----------------------------------------------------
    # SLIDE 2: EL PROBLEMA Y LA OPORTUNIDAD
    # ----------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "El Problema del Comercio Gastronómico y la Búsqueda Rígida")

    add_card(slide2, 0.8, 1.5, 5.6, 5.2, "Desafíos de los Restaurantes", [
        "Menús físicos costosos de actualizar y poco higiénicos.",
        "Dependencia de PDFs estáticos pesados que no se adaptan a celulares.",
        "Dificultad para gestionar disponibilidad de platillos en tiempo real.",
        "Falta de analítica y personalización para clientes recurrentes."
    ], "CONTEXTO DEL MERCADO")

    add_card(slide2, 6.8, 1.5, 5.6, 5.2, "Falla en Motores de Búsqueda Rígidos", [
        "Los buscadores tradicionales requieren coincidencias exactas de texto.",
        "Si el cliente busca 'algo caldosito' o 'sin carne', la búsqueda exacta falla.",
        "Errores ortográficos ('tacos al pastro') devuelven cero resultados.",
        "No consideran restricciones severas ni alergias alimentarias."
    ], "PROBLEMA TÉCNICO DE BÚSQUEDA")

    # ----------------------------------------------------
    # SLIDE 3: LA SOLUCIÓN MEXXICANMX
    # ----------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "¿Qué es MexxicanMX? Ecosistema Digital Completo")

    add_card(slide3, 0.8, 1.5, 3.6, 5.2, "1. Menú QR Dinámico", [
        "Carga ultrarrápida adaptada a móviles.",
        "Filtros por categorías, alérgenos y picante.",
        "Actualización instantánea desde el panel.",
        "Diseño adaptativo de alto impacto visual."
    ], "PARA COMENSALES")

    add_card(slide3, 4.8, 1.5, 3.6, 5.2, "2. Panel Administrativo", [
        "Gestión de restaurantes, cartas y precios.",
        "Generador de códigos QR vectoriales.",
        "Control de suscripciones y aprobaciones.",
        "Modulo de soporte en vivo por SSE."
    ], "PARA RESTAURANTES Y ADMIN")

    add_card(slide3, 8.8, 1.5, 3.6, 5.2, "3. Recomendador IA", [
        "Interpretación semántica del antojo.",
        "Fuzzy matching tolerante a tipografía.",
        "Exclusión estricta por alergias/dieta.",
        "Ranking ponderado multicampo en tiempo real."
    ], "MOTOR INTELIGENTE")

    # ----------------------------------------------------
    # SLIDE 4: FLUJO OPERATIVO DEL SISTEMA
    # ----------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Flujo Operativo de MexxicanMX")

    add_card(slide4, 0.8, 1.5, 11.733, 5.2, "Ciclo de Vida de la Información", [
        "1. REGISTRO Y GESTIÓN: El restaurante se registra en la plataforma y el Super Admin aprueba su cuenta.",
        "2. CREACIÓN DE MENÚ: El restaurante sube sus categorías, platillos, precios, alérgenos e imágenes.",
        "3. GENERACIÓN QR: El sistema genera dinámicamente un código QR vinculado al menú público del restaurante.",
        "4. CONSULTA PÚBLICA: El comensal escanea el QR o navega para explorar la carta digital interactiva.",
        "5. DESCUBRIMIENTO IA: El cliente completa un wizard de 5 pasos capturando su antojo, restricciones y alergias.",
        "6. RANKING Y NAVEGACIÓN: El microservicio ML califica el menú global y presenta las mejores opciones."
    ], "END-TO-END WORKFLOW")

    # ----------------------------------------------------
    # SLIDE 5: ARQUITECTURA E INFRAESTRUCTURA REAL (AWS + DOCKER)
    # ----------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Arquitectura de Software e Infraestructura AWS", "ARQUITECTURA REAL")

    add_card(slide5, 0.8, 1.4, 4.2, 5.6, "Stack & Cloud Infrastructure", [
        "Frontend: React 18, TypeScript, TailwindCSS.",
        "CDN: AWS CloudFront + S3 (mexxicanmx.oamdevsol.site).",
        "Backend API: Node.js Express detrás de api.oamdevsol.site.",
        "Microservicio ML: Python FastAPI en Docker (ml:8000).",
        "Persistencia: PostgreSQL 16 con pgvector & Redis 7.",
        "Despliegue: AWS EC2 + Docker Compose + CloudFormation."
    ], "COMPONENTES CLAVE")

    # Add white background container for architecture diagram
    bg_card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.1), Inches(1.3), Inches(7.5), Inches(5.7))
    bg_card.fill.solid()
    bg_card.fill.fore_color.rgb = RGBColor(255, 255, 255)
    bg_card.line.color.rgb = ORANGE
    bg_card.line.width = Pt(2)

    # Add diagram image
    if os.path.exists("arquitectura.png"):
        slide5.shapes.add_picture("arquitectura.png", Inches(5.2), Inches(1.4), width=Inches(7.1))
    elif os.path.exists(os.path.join("presentacion", "diagramas", "diagrama_arquitectura.png")):
        slide5.shapes.add_picture(os.path.join("presentacion", "diagramas", "diagrama_arquitectura.png"), Inches(5.2), Inches(1.4), width=Inches(7.1))


    # ----------------------------------------------------
    # SLIDE 6: FUNCIONALIDADES PRINCIPALES IMPLEMENTADAS
    # ----------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Funcionalidades Principales en Producción", "FUNCIONALIDADES")

    add_card(slide6, 0.8, 1.5, 5.6, 2.4, "📱 Menú Digital Interactivo", [
        "Navegación fluida en teléfonos móviles.",
        "Filtros instantáneos por alérgenos y nivel de picante.",
        "Modal interactivo de detalle de platillo con ingredientes."
    ], "COMENSAL")

    add_card(slide6, 6.8, 1.5, 5.6, 2.4, "📷 Generador de Códigos QR", [
        "Generación instantánea de códigos QR vectoriales.",
        "Impresión de códigos vinculados al menú del restaurante."
    ], "RESTAURANTE")

    add_card(slide6, 0.8, 4.2, 5.6, 2.5, "🛠️ Panel de Administración ABAC", [
        "Control de roles, planes de suscripción y estado.",
        "Canal de soporte en tiempo real vía Server-Sent Events (SSE)."
    ], "ADMINISTRACIÓN")

    add_card(slide6, 6.8, 4.2, 5.6, 2.5, "🤖 Motor de Recomendación IA", [
        "Wizard de 5 pasos para capturar antojos y restricciones.",
        "Evaluación multicampo y ranking dinámico en tiempo real."
    ], "MACHINE LEARNING")

    # ----------------------------------------------------
    # SLIDE 7: MOTOR DE RECOMENDACIÓN ML EN DETALLE & FLUJO DE FLECHAS
    # ----------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Flujo de Información y Algoritmo de Inteligencia Artificial", "MOTOR MACHINE LEARNING")

    add_card(slide7, 0.8, 1.4, 4.2, 5.6, "Pipeline & Reglas de IA", [
        "1. Captura antojo en lenguaje natural + alergias.",
        "2. Normalización, Lemmatization y Mapa de Sinónimos (cerdo=pastor).",
        "3. Filtro Estricto de Alérgenos: Bloqueo inmediato (Score = 0).",
        "4. Matriz TF-IDF + Cosine Similarity + pgvector.",
        "5. Ranking Ponderado: Nombre (2.5x), Categoría (1.2x), Ingredientes (1.0x).",
        "6. Feedback Loop: Registro de clics/interacciones para aprendizaje continuo."
    ], "PASOS DEL PIPELINE")

    diag4_path = os.path.join("presentacion", "diagramas", "diagrama_flujo_ia_flechas.png")
    if os.path.exists(diag4_path):
        slide7.shapes.add_picture(diag4_path, Inches(5.2), Inches(1.4), width=Inches(7.3))

    # ----------------------------------------------------
    # SLIDE 8: PRUEBAS Y VERIFICACIÓN DE CALIDAD (TESTING)
    # ----------------------------------------------------
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Resultados de Pruebas Automatizadas y Calidad", "VERIFICACIÓN DE TESTEO")

    add_card(slide8, 0.8, 1.5, 3.6, 5.2, "Pruebas Unitarias ML", [
        "Framework: Python unittest.",
        "Pruebas: 5 / 5 Exitosas (100%).",
        "Escenarios: Sinónimos (cerdo/puerco), negaciones ('sin carne'), exclusión estricta por alergias.",
        "Tiempo: 🟢 0.068 segundos",
        "Empíricamente verificado."
    ], "PYTHON UNIT TESTS")

    add_card(slide8, 4.8, 1.5, 3.6, 5.2, "Pruebas End-to-End", [
        "Framework: Playwright E2E.",
        "Pruebas: 8 / 8 Exitosas (100%).",
        "Navegadores: Chromium & Mobile.",
        "Escenarios: Cuestionario IA -> Scoring ML -> Menú QR.",
        "Tiempo: 🟢 30.2 segundos",
        "Pruebas de interfaz completas."
    ], "FRONTEND PLAYWRIGHT")

    add_card(slide8, 8.8, 1.5, 3.6, 5.2, "Auditoría de Despliegue", [
        "Infraestructura: AWS CloudFormation.",
        "Plantillas: 6 YAMLs Auditadas.",
        "Aislación: Puertos 5432 y 6379 privados en VPC.",
        "Cifrado: EBS 20GB gp3 Cifrado.",
        "Uptime: 🟢 99.9% Disponibilidad",
        "Producción en Vivo."
    ], "DESPLIEGUE AWS EN VIVO")

    # ----------------------------------------------------
    # SLIDE 9: DEMOSTRACIÓN EN VIVO (GUION 3 MINUTOS)
    # ----------------------------------------------------
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Demostración Práctica en Vivo (Demo en Producción)", "DEMO EN VIVO")

    add_card(slide9, 0.8, 1.5, 11.733, 5.2, "Pasos de la Demostración en Producción", [
        "1. LANDING & CUESTIONARIO: Navegar a https://mexxicanmx.oamdevsol.site/cuestionario.",
        "2. CAPTURA DE ANTOJO: Escribir 'Quiero tacos al pastor picositos y caldositos'.",
        "3. RESTRICCIONES & ALERGIAS: Marcar alergia a 'Camarón' para demostrar la exclusión de seguridad.",
        "4. EJECUCIÓN ML: Hacer clic en 'Descubrir Recomendaciones' (Llamada POST al microservicio Python).",
        "5. RESULTADO RANKING: Comprobar Coincidencia del 99% en Tacos al Pastor y CERO platillos con camarón.",
        "6. NAVEGACIÓN DIRECTA: Hacer clic en ❤️ para abrir el menú digital interactivo del restaurante."
    ], "PASO A PASO EN VIVO")

    # ----------------------------------------------------
    # SLIDE 10: CONCLUSIONES Y PRÓXIMOS PASOS
    # ----------------------------------------------------
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Conclusiones y Futuro del Sistema", "CONCLUSIÓN Y IMPACTO")

    add_card(slide10, 0.8, 1.5, 5.6, 5.2, "Logros Alcanzados", [
        "Plataforma Web full-stack 100% funcional y desplegada en AWS.",
        "Motor de Inteligencia Artificial en Python con respuesta <200ms y filtro estricto de seguridad.",
        "Arquitectura desacoplada basada en contenedores Docker y CloudFront CDN.",
        "Verificación empírica con 100% de pruebas unitarias y E2E pasadas exitosamente."
    ], "RESULTADO DEL PROYECTO")

    add_card(slide10, 6.8, 1.5, 5.6, 5.2, "Próximos Pasos & Escalabilidad", [
        "Integración de pasarela de pagos en línea (Stripe / Mercado Pago).",
        "Módulo de analítica avanzada para restaurantes sobre platillos más deseados.",
        "Búsqueda con embeddings vectoriales profundos con pgvector para catálogos masivos.",
        "¡MexxicanMX está listo para su uso comercial!"
    ], "IMPACTO Y TRABAJO FUTURO")

    os.makedirs("presentacion", exist_ok=True)
    pptx_path = os.path.join("presentacion", "presentacion_mexxicanmx.pptx")
    prs.save(pptx_path)
    print(f"[OK] Presentacion PPTX generada correctamente en: {pptx_path}")

if __name__ == '__main__':
    create_presentation()

