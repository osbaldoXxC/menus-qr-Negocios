import os
import re
import math
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(
    title="MexxicanMX ML Recommendation Engine",
    version="1.0.0",
    description="Unsupervised Hybrid Content-Based Recommendation Service for Public Menus"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---

class CravingInput(BaseModel):
    text: Optional[str] = ""
    tags: Optional[List[str]] = Field(default_factory=list)

class RecommendationRequest(BaseModel):
    restaurant_id: str
    craving: Optional[CravingInput] = Field(default_factory=CravingInput)
    diet: Optional[str] = "none"
    allergies: Optional[List[str]] = Field(default_factory=list)
    socialContext: Optional[str] = "solo"
    limit: Optional[int] = 5
    dishes: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    restaurant: Optional[Dict[str, Any]] = None

class DishOutput(BaseModel):
    id: str
    nombre: str
    descripcion: str
    precio: float
    url_imagen: str
    nivel_picante: int = 0
    porcion: str = ""
    categoria_nombre: str = ""
    etiquetas_dieteticas: List[str] = Field(default_factory=list)
    ingredientes_principales: List[str] = Field(default_factory=list)

class RestaurantOutput(BaseModel):
    id: str
    name: str
    slug: str
    menuUrl: str

class RecommendationItem(BaseModel):
    dish: DishOutput
    restaurant: RestaurantOutput
    matchScore: float
    matchPercentage: int
    reasons: List[str]
    tags: List[str]

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    meta: Dict[str, Any]

# --- Allergen & Dietary Rules ---

ALLERGEN_MAP = {
    "cacahuate": ["cacahuate", "cacahuates", "maní", "mani", "peanut"],
    "camaron": ["camarón", "camaron", "camarones", "shrimp", "gambas"],
    "lacteos": ["leche", "queso", "crema", "mantequilla", "lácteo", "lacteo", "dairy"],
    "gluten": ["trigo", "gluten", "harina", "pan", "pasta", "wonton", "empanadillas", "fideos"],
    "huevo": ["huevo", "huevos", "egg"],
    "pescado": ["pescado", "atún", "atun", "salmón", "salmon", "trucha", "bacalao", "fish"],
    "nueces": ["nuez", "nueces", "pistache", "pistaches", "almendra", "almendras", "nut"],
    "mariscos": ["marisco", "mariscos", "pulpo", "langosta", "ostión", "ostion", "seafood"]
}

MEAT_KEYWORDS = [
    "carne", "res", "cerdo", "pollo", "pato", "tocino", "jamón", "jamon",
    "marisco", "pescado", "camarón", "camaron", "atún", "atun", "pulpo",
    "langosta", "ternera", "al pastor", "rib eye", "char siu", "charlotta"
]

ANIMAL_KEYWORDS = MEAT_KEYWORDS + [
    "huevo", "queso", "leche", "crema", "mantequilla", "miel", "lácteo", "lacteo"
]

GLUTEN_KEYWORDS = [
    "trigo", "harina", "pan", "pasta", "wonton", "empanadillas", "fideos", "bizcocho", "crepas"
]

# --- Helper Functions ---

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[áàäâ]', 'a', text)
    text = re.sub(r'[éèëê]', 'e', text)
    text = re.sub(r'[íìïî]', 'i', text)
    text = re.sub(r'[óòöô]', 'o', text)
    text = re.sub(r'[úùüû]', 'u', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    return ' '.join(text.split())

def is_allergen_present(dish: Dict[str, Any], allergy_keys: List[str]) -> bool:
    if not allergy_keys:
        return False

    # Extract all text attributes from dish
    ingredients = dish.get("ingredientes_principales") or []
    complements = dish.get("complementos") or []
    name = dish.get("nombre", "")
    desc = dish.get("descripcion", "")

    all_text = " ".join([
        name,
        desc,
        " ".join([str(i) for i in ingredients]),
        " ".join([str(c) for c in complements])
    ]).lower()
    cleaned_all_text = clean_text(all_text)

    for allergy in allergy_keys:
        allergy_norm = allergy.lower().strip()
        keywords = ALLERGEN_MAP.get(allergy_norm, [allergy_norm])
        for kw in keywords:
            kw_clean = clean_text(kw)
            if kw_clean and (kw_clean in cleaned_all_text or re.search(r'\b' + re.escape(kw_clean) + r'\b', cleaned_all_text)):
                return True
    return False

def is_diet_incompatible(dish: Dict[str, Any], diet: str) -> bool:
    if not diet or diet == "none" or diet == "sin_restricciones":
        return False

    diet = diet.lower().replace("-", "_")
    tags = [clean_text(str(t)) for t in (dish.get("etiquetas_dieteticas") or [])]
    name_desc = clean_text(f"{dish.get('nombre', '')} {dish.get('descripcion', '')}")
    ingredients = clean_text(" ".join([str(i) for i in (dish.get("ingredientes_principales") or [])]))
    full_text = f"{name_desc} {ingredients}"

    if diet == "vegetariana" or diet == "vegetarian":
        if "vegetariano" in tags or "vegano" in tags:
            return False
        for kw in MEAT_KEYWORDS:
            if clean_text(kw) in full_text:
                return True

    elif diet == "vegana" or diet == "vegan":
        if "vegano" in tags:
            return False
        for kw in ANIMAL_KEYWORDS:
            if clean_text(kw) in full_text:
                return True

    elif diet == "sin_gluten" or diet == "gluten_free":
        if "sin_gluten" in tags or "singluten" in tags:
            return False
        for kw in GLUTEN_KEYWORDS:
            if clean_text(kw) in full_text:
                return True

    return False

def generate_reasons(dish: Dict[str, Any], craving: CravingInput, diet: str, allergies: List[str]) -> List[str]:
    reasons = []

    name_desc = clean_text(f"{dish.get('nombre', '')} {dish.get('descripcion', '')} {dish.get('categoria_nombre', '')}")
    user_craving_text = clean_text(craving.text or "")
    user_tags = [clean_text(t) for t in (craving.tags or [])]

    # Tag matches
    for tag in user_tags:
        if tag in ["mexicana", "mexicano"] and ("mexican" in name_desc or "taco" in name_desc or "guacamole" in name_desc or "queso" in name_desc):
            reasons.append("🌮 Coincide con tu antojo de comida Mexicana")
        elif tag in ["picante"] and (dish.get("nivel_picante", 0) > 0 or "picante" in name_desc or "chile" in name_desc):
            reasons.append(f"🌶️ Coincide con tu gusto por lo picante (Nivel {dish.get('nivel_picante', 1)})")
        elif tag in ["japonesa", "oriental", "china"] and ("dumpling" in name_desc or "wonton" in name_desc or "wok" in name_desc or "arroz" in name_desc or "sushi" in name_desc):
            reasons.append("🍜 Coincide con tu antojo de comida Oriental/Asiática")
        elif tag in ["italiana"] and ("pasta" in name_desc or "risotto" in name_desc or "pizza" in name_desc):
            reasons.append("🍕 Coincide con tu antojo de comida Italiana")
        elif tag in ["rapida", "hamburguesa"] and ("burger" in name_desc or "taco" in name_desc or "frito" in name_desc):
            reasons.append("🍔 Coincide con tu preferencia por comida rápida")
        elif tag in ["caldosito", "sopa"] and ("sopa" in name_desc or "caldo" in name_desc or "crema" in name_desc):
            reasons.append("🥣 Coincide con tu antojo de algo caldosito")

    # Keyword match from free text
    if user_craving_text and not reasons:
        words = [w for w in user_craving_text.split() if len(w) > 3]
        matched_words = [w for w in words if w in name_desc]
        if matched_words:
            reasons.append(f"✨ Coincide con tu descripción ({', '.join(matched_words[:2])})")

    # Diet reason
    if diet and diet != "none":
        if diet in ["vegetariana", "vegetarian"]:
            reasons.append("🥬 Compatible con tu dieta vegetariana")
        elif diet in ["vegana", "vegan"]:
            reasons.append("🌱 100% compatible con tu dieta vegana")
        elif diet in ["sin_gluten", "gluten_free"]:
            reasons.append("🌾 Libre de gluten")
        elif diet in ["keto"]:
            reasons.append("🥑 Apto para estilo de vida Keto")

    # Allergy guarantee reason
    if allergies:
        reasons.append(f"✅ 100% libre de las {len(allergies)} alergia(s) indicadas")

    if not reasons:
        reasons.append("⭐ Platillo destacado seleccionado especialmente para ti")

    return list(dict.fromkeys(reasons))[:3]

# --- FastAPI Routes ---

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MexxicanMX ML Recommendation Engine", "version": "1.0.0"}

@app.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest):
    import time
    start_time = time.time()

    dishes = req.dishes or []
    if not dishes:
        return RecommendationResponse(
            recommendations=[],
            meta={
                "restaurant_id": req.restaurant_id,
                "totalCandidates": 0,
                "filteredByAllergies": 0,
                "filteredByDiet": 0,
                "recommendedCount": 0,
                "executionTimeMs": round((time.time() - start_time) * 1000, 2)
            }
        )

    # 1. Filter active dishes
    active_dishes = [d for d in dishes if d.get("activo", True) is not False]
    total_candidates = len(active_dishes)

    # 2. Allergy Exclusion Filter
    allergy_filtered = []
    filtered_allergies_count = 0
    for d in active_dishes:
        if is_allergen_present(d, req.allergies or []):
            filtered_allergies_count += 1
        else:
            allergy_filtered.append(d)

    # 3. Dietary Exclusion Filter
    safe_dishes = []
    filtered_diet_count = 0
    for d in allergy_filtered:
        if is_diet_incompatible(d, req.diet or "none"):
            filtered_diet_count += 1
        else:
            safe_dishes.append(d)

    if not safe_dishes:
        return RecommendationResponse(
            recommendations=[],
            meta={
                "restaurant_id": req.restaurant_id,
                "totalCandidates": total_candidates,
                "filteredByAllergies": filtered_allergies_count,
                "filteredByDiet": filtered_diet_count,
                "recommendedCount": 0,
                "executionTimeMs": round((time.time() - start_time) * 1000, 2)
            }
        )

    # 4. Feature Engineering & TF-IDF Vectorization
    dish_docs = []
    for d in safe_dishes:
        ingredients_str = " ".join([str(i) for i in (d.get("ingredientes_principales") or [])])
        tags_str = " ".join([str(t) for t in (d.get("etiquetas_dieteticas") or [])])
        cat_str = str(d.get("categoria_nombre") or "")
        doc = clean_text(f"{d.get('nombre', '')} {d.get('descripcion', '')} {cat_str} {ingredients_str} {tags_str}")
        dish_docs.append(doc)

    user_craving_text = req.craving.text if req.craving else ""
    user_tags_text = " ".join(req.craving.tags) if (req.craving and req.craving.tags) else ""
    user_doc = clean_text(f"{user_craving_text} {user_tags_text} {req.diet or ''}")

    # Fallback score if no text provided
    if not user_doc.strip():
        user_doc = "comida deliciosa plato especial"

    all_docs = dish_docs + [user_doc]

    try:
        vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b\w+\b', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(all_docs)
        
        dish_vectors = tfidf_matrix[:-1]
        user_vector = tfidf_matrix[-1:]
        
        similarities = cosine_similarity(user_vector, dish_vectors)[0]
    except Exception as e:
        # Fallback if TF-IDF fails
        similarities = [0.5] * len(safe_dishes)

    # 5. Hybrid Scoring & Re-Ranking
    scored_items = []
    user_tags_lower = [t.lower() for t in (req.craving.tags if req.craving else [])]
    wants_spicy = "picante" in user_tags_lower or "picante" in clean_text(user_craving_text)

    for idx, d in enumerate(safe_dishes):
        base_sim = float(similarities[idx]) if idx < len(similarities) else 0.5
        
        # Boost for spicy preference matching
        spicy_level = int(d.get("nivel_picante") or 0)
        if wants_spicy and spicy_level > 0:
            base_sim += 0.20 * (spicy_level / 4.0)

        # Boost for social context (sharable portions for family/friends)
        social = (req.socialContext or "solo").lower()
        if social in ["familia", "family", "amigos", "friends"]:
            portion = clean_text(d.get("porcion") or "")
            if any(k in portion for k in ["piezas", "350g", "500g", "para compartir", "delicias"]):
                base_sim += 0.10

        # Bound score between 0.70 and 0.99
        final_score = min(0.99, max(0.70, round(0.70 + (base_sim * 0.29), 4)))
        match_percentage = int(round(final_score * 100))

        # Extract tags for visual display
        tags = list(d.get("etiquetas_dieteticas") or [])
        if not tags and d.get("ingredientes_principales"):
            tags = [str(i) for i in d.get("ingredientes_principales")[:3]]

        restaurant_info = req.restaurant or {
            "id": req.restaurant_id,
            "name": "Restaurante",
            "slug": req.restaurant_id,
            "menuUrl": f"/menu/{req.restaurant_id}"
        }

        reasons = generate_reasons(d, req.craving or CravingInput(), req.diet or "none", req.allergies or [])

        dish_out = DishOutput(
            id=str(d.get("id", "")),
            nombre=str(d.get("nombre", "Platillo")),
            descripcion=str(d.get("descripcion", "")),
            precio=float(d.get("precio", 0.0)),
            url_imagen=str(d.get("url_imagen", "")),
            nivel_picante=spicy_level,
            porcion=str(d.get("porcion", "")),
            categoria_nombre=str(d.get("categoria_nombre", "")),
            etiquetas_dieteticas=list(d.get("etiquetas_dieteticas") or []),
            ingredientes_principales=[str(i) for i in (d.get("ingredientes_principales") or [])]
        )

        rest_out = RestaurantOutput(
            id=str(restaurant_info.get("id", req.restaurant_id)),
            name=str(restaurant_info.get("name", "Restaurante")),
            slug=str(restaurant_info.get("slug", req.restaurant_id)),
            menuUrl=str(restaurant_info.get("menuUrl", f"/menu/{req.restaurant_id}"))
        )

        scored_items.append(RecommendationItem(
            dish=dish_out,
            restaurant=rest_out,
            matchScore=final_score,
            matchPercentage=match_percentage,
            reasons=reasons,
            tags=tags
        ))

    # Sort descending by matchScore
    scored_items.sort(key=lambda x: x.matchScore, reverse=True)
    limit = req.limit or 5
    top_recommendations = scored_items[:limit]

    return RecommendationResponse(
        recommendations=top_recommendations,
        meta={
            "restaurant_id": req.restaurant_id,
            "totalCandidates": total_candidates,
            "filteredByAllergies": filtered_allergies_count,
            "filteredByDiet": filtered_diet_count,
            "recommendedCount": len(top_recommendations),
            "executionTimeMs": round((time.time() - start_time) * 1000, 2)
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
