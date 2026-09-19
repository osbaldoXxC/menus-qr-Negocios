import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs("presentacion/diagramas", exist_ok=True)

# Set global figure style
plt.style.use('dark_background')

# ----------------------------------------------------
# DIAGRAMA 1: ARQUITECTURA GENERAL E INFRAESTRUCTURA AWS
# ----------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
ax.set_facecolor('#0F0F10')
fig.patch.set_facecolor('#0F0F10')
ax.axis('off')

# Title
ax.text(6, 6.1, "ARQUITECTURA DE SOFTWARE E INFRAESTRUCTURA AWS", fontsize=16, fontweight='bold', color='#FF6B35', ha='center')

# Layer 1: Client & CloudFront CDN
box_client = patches.FancyBboxPatch((0.5, 4.2), 3.0, 1.4, boxstyle="round,pad=0.2", fc="#1E1E24", ec="#FF6B35", lw=2)
ax.add_patch(box_client)
ax.text(2.0, 5.1, "CLIENTES / USUARIOS", fontsize=11, fontweight='bold', color='white', ha='center')
ax.text(2.0, 4.6, "Navegadores Web / Móviles\n(QR Scanners)", fontsize=9, color='#A3A3A3', ha='center')

# CloudFront CDN & S3
box_cdn = patches.FancyBboxPatch((4.5, 4.2), 3.2, 1.4, boxstyle="round,pad=0.2", fc="#1E1E24", ec="#00E676", lw=2)
ax.add_patch(box_cdn)
ax.text(6.1, 5.1, "AWS CLOUDFRONT + S3", fontsize=11, fontweight='bold', color='#00E676', ha='center')
ax.text(6.1, 4.6, "mexxicanmx.oamdevsol.site\nadmin.oamdevsol.site", fontsize=9, color='#A3A3A3', ha='center')

# EC2 & Docker Stack
box_ec2 = patches.FancyBboxPatch((8.5, 0.8), 3.2, 4.8, boxstyle="round,pad=0.2", fc="#18181B", ec="#29B6F6", lw=2)
ax.add_patch(box_ec2)
ax.text(10.1, 5.2, "AWS EC2 (DOCKER STACK)", fontsize=11, fontweight='bold', color='#29B6F6', ha='center')

# Inside Docker Stack
services = [
    ("Backend API (Node.js)", "#FF9800", 4.3),
    ("ML Service (Python FastAPI)", "#E91E63", 3.3),
    ("PostgreSQL 16 (pgvector)", "#9C27B0", 2.3),
    ("Redis Cache", "#F44336", 1.3)
]
for name, color, y_pos in services:
    b = patches.FancyBboxPatch((8.8, y_pos), 2.6, 0.7, boxstyle="round,pad=0.1", fc="#27272A", ec=color, lw=1.5)
    ax.add_patch(b)
    ax.text(10.1, y_pos + 0.3, name, fontsize=9, fontweight='bold', color=color, ha='center')

# Arrows & Connectors
ax.annotate("", xy=(4.5, 4.9), xytext=(3.5, 4.9), arrowprops=dict(arrowstyle="->", color="#FF6B35", lw=2))
ax.annotate("", xy=(8.5, 4.9), xytext=(7.7, 4.9), arrowprops=dict(arrowstyle="->", color="#00E676", lw=2))

plt.tight_layout()
plt.savefig("presentacion/diagramas/diagrama_arquitectura.png", bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()

# ----------------------------------------------------
# DIAGRAMA 2: MOTOR DE RECOMENDACIÓN ML & BÚSQUEDA MULTICAMPO
# ----------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
ax.set_facecolor('#0F0F10')
fig.patch.set_facecolor('#0F0F10')
ax.axis('off')

ax.text(6, 6.1, "PIPELINE DEL MOTOR MACHINE LEARNING EN PYTHON", fontsize=16, fontweight='bold', color='#FF6B35', ha='center')

steps = [
    ("1. Cuestionario IA", "Antojo: 'Tacos al pastro'\nAlergias: 'Camarón'", "#FF6B35", 0.5),
    ("2. Preprocesamiento", "Normalización, Regex\nExtractor de Negaciones", "#29B6F6", 3.3),
    ("3. Exclusión Estricta", "Filtro de Alérgenos\nScore = 0 si Inseguro", "#F44336", 6.1),
    ("4. Scoring & TF-IDF", "Multicampo + Fuzzy Match\nCosine Similarity Matrix", "#9C27B0", 8.9)
]

for title, desc, color, x_pos in steps:
    b = patches.FancyBboxPatch((x_pos, 2.5), 2.5, 2.6, boxstyle="round,pad=0.15", fc="#18181B", ec=color, lw=2)
    ax.add_patch(b)
    ax.text(x_pos + 1.25, 4.6, title, fontsize=10, fontweight='bold', color=color, ha='center')
    ax.text(x_pos + 1.25, 3.4, desc, fontsize=8.5, color='#E0E0E0', ha='center')

# Connections between steps
for x_start in [3.0, 5.8, 8.6]:
    ax.annotate("", xy=(x_start + 0.3, 3.8), xytext=(x_start, 3.8), arrowprops=dict(arrowstyle="->", color="#FF6B35", lw=2.5))

# Final Result Box
b_res = patches.FancyBboxPatch((4.0, 0.4), 4.0, 1.4, boxstyle="round,pad=0.15", fc="#1E1E24", ec="#00E676", lw=2)
ax.add_patch(b_res)
ax.text(6.0, 1.3, "RESULTADO FINAL RANKING", fontsize=11, fontweight='bold', color='#00E676', ha='center')
ax.text(6.0, 0.8, "Top 1: Tacos al Pastor Tradicionales (99% Match)\nExcluido: Tacos de Camarón (Alergia Detectada)", fontsize=8.5, color='white', ha='center')

plt.tight_layout()
plt.savefig("presentacion/diagramas/diagrama_ml_pipeline.png", bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()

# ----------------------------------------------------
# DIAGRAMA 3: BÚSQUEDA SEMÁNTICA MULTICAMPO ("TACOS")
# ----------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
ax.set_facecolor('#0F0F10')
fig.patch.set_facecolor('#0F0F10')
ax.axis('off')

ax.text(6, 6.1, "BÚSQUEDA SEMÁNTICA MULTICAMPO (EJEMPLO: 'TACOS')", fontsize=16, fontweight='bold', color='#FF6B35', ha='center')

# Query Input
b_q = patches.FancyBboxPatch((4.5, 4.8), 3.0, 0.9, boxstyle="round,pad=0.1", fc="#FF6B35", ec="white", lw=1.5)
ax.add_patch(b_q)
ax.text(6.0, 5.25, "Consulta: 'tacos'", fontsize=12, fontweight='bold', color='white', ha='center')

# Fields Scanned
fields = [
    ("Nombre Platillo", "Peso: 2.50\n'Tacos al Pastor'", "#29B6F6", 0.6),
    ("Categoría", "Peso: 1.20\n'Tacos Tradicionales'", "#00E676", 3.4),
    ("Ingredientes", "Peso: 1.00\n['cerdo', 'piña']", "#FF9800", 6.2),
    ("Descripción / Tags", "Peso: 0.50\n'Tortilla de maíz'", "#E91E63", 9.0)
]

for name, detail, color, x_pos in fields:
    b = patches.FancyBboxPatch((x_pos, 2.0), 2.4, 2.0, boxstyle="round,pad=0.1", fc="#18181B", ec=color, lw=2)
    ax.add_patch(b)
    ax.text(x_pos + 1.2, 3.5, name, fontsize=9.5, fontweight='bold', color=color, ha='center')
    ax.text(x_pos + 1.2, 2.6, detail, fontsize=8.5, color='#E0E0E0', ha='center')

    # Arrow from query to each field
    ax.annotate("", xy=(x_pos + 1.2, 4.0), xytext=(6.0, 4.8), arrowprops=dict(arrowstyle="->", color=color, lw=1.5))

# Score Aggregation
b_agg = patches.FancyBboxPatch((3.5, 0.4), 5.0, 1.1, boxstyle="round,pad=0.1", fc="#1E1E24", ec="#FF6B35", lw=2)
ax.add_patch(b_agg)
ax.text(6.0, 1.0, "CÁLCULO Y NORMALIZACIÓN DE SCORE PONDERADO", fontsize=10, fontweight='bold', color='#FF6B35', ha='center')
ax.text(6.0, 0.6, "raw_score = sum(pesos) + tfidf_sim  ➔  final_score = tanh(raw_score)  ➔  99% Match", fontsize=8.5, color='white', ha='center')

# ----------------------------------------------------
# DIAGRAMA 4: FLUJO DE INFORMACIÓN CON FLECHAS & APRENDIZAJE CONTINUO DE LA IA
# ----------------------------------------------------
fig, ax = plt.subplots(figsize=(14, 8), dpi=300)
ax.set_facecolor('#0F0F10')
fig.patch.set_facecolor('#0F0F10')
ax.axis('off')
ax.set_xlim(0, 14)
ax.set_ylim(0, 8)

ax.text(7.0, 7.4, "FLUJO DE INFORMACIÓN Y APRENDIZAJE CONTINUO DEL MOTOR DE IA", fontsize=16, fontweight='bold', color='#FF6B35', ha='center')

# Nodes in the flow (x, y, title, subtitle, color)
nodes = [
    (0.6, 4.6, "1. CAPTURA & RECOLECCIÓN", "• Antojo en Lenguaje Natural ('tacos picositos')\n• Filtros de Alergias (Camarón, Lactosa)\n• Catálogo Activo del Restaurante", "#FF6B35"),
    (5.0, 4.6, "2. EXTRACCIÓN & SINÓNIMOS", "• Normalización Regex & Lemmatization\n• Mapa de Sinónimos (cerdo=pastor)\n• Extractor de Negaciones ('sin')", "#29B6F6"),
    (9.4, 4.6, "3. EXCLUSIÓN DE SEGURIDAD", "• Filtro Estricto de Alérgenos\n• Bloqueo Inmediato (Score = 0)\n• Garantía de Seguridad Alimentaria", "#F44336"),
    (9.4, 1.2, "4. VECTORIAL & TF-IDF", "• Ponderación Multicampo (Nombre 2.5x)\n• Matriz Similitud Coseno + pgvector\n• Relevancia Ponderada por Contexto", "#9C27B0"),
    (5.0, 1.2, "5. RANKING & PRESENTACIÓN", "• Tarjeta Interactiva Swipe con Match %\n• Razones Claras de Recomendación\n• Acceso Directo al Menú Digital QR", "#00E676"),
    (0.6, 1.2, "6. APRENDIZAJE CONTINUO", "• Feedback Loop (Clics, Me Gusta ❤️)\n• Registro de Patrones de Búsqueda\n• Auto-Ajuste de Pesos por Popularidad", "#FFCB2B")
]

for x, y, title, desc, color in nodes:
    b = patches.FancyBboxPatch((x, y), 4.0, 2.2, boxstyle="round,pad=0.2", fc="#18181B", ec=color, lw=2.5)
    ax.add_patch(b)
    ax.text(x + 2.0, y + 1.7, title, fontsize=11, fontweight='bold', color=color, ha='center')
    ax.text(x + 2.0, y + 0.8, desc, fontsize=9.5, color='#FFFFFF', ha='center', va='center')

# Arrows connecting nodes sequentially
# 1 -> 2
ax.annotate("", xy=(5.0, 5.7), xytext=(4.6, 5.7), arrowprops=dict(arrowstyle="-|>", color="#FF6B35", lw=3, mutation_scale=20))
# 2 -> 3
ax.annotate("", xy=(9.4, 5.7), xytext=(9.0, 5.7), arrowprops=dict(arrowstyle="-|>", color="#29B6F6", lw=3, mutation_scale=20))
# 3 -> 4 (Down)
ax.annotate("", xy=(11.4, 3.4), xytext=(11.4, 4.6), arrowprops=dict(arrowstyle="-|>", color="#F44336", lw=3, mutation_scale=20))
# 4 -> 5 (Left)
ax.annotate("", xy=(9.0, 2.3), xytext=(9.4, 2.3), arrowprops=dict(arrowstyle="-|>", color="#9C27B0", lw=3, mutation_scale=20))
# 5 -> 6 (Left)
ax.annotate("", xy=(4.6, 2.3), xytext=(5.0, 2.3), arrowprops=dict(arrowstyle="-|>", color="#00E676", lw=3, mutation_scale=20))
# 6 -> 1 (Up Feedback Loop!)
ax.annotate("Feedback Loop & Re-entrenamiento", xy=(2.6, 4.6), xytext=(2.6, 3.4),
            arrowprops=dict(arrowstyle="-|>", color="#FFCB2B", lw=3, mutation_scale=20, connectionstyle="arc3,rad=-0.3"),
            fontsize=10, fontweight='bold', color='#FFCB2B', ha='center')

plt.savefig("presentacion/diagramas/diagrama_flujo_ia_flechas.png", bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()

print("[OK] Diagramas generados correctamente en /presentacion/diagramas/")


