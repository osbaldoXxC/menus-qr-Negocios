# 🎙️ GUION OFICIAL DE PRESENTACIÓN ACADÉMICA — MEXXICANMX
> **Duración Máxima Estricta:** 10 Minutos  
> **Modalidad:** Exposición con Pruebas y Demostración en Vivo en Producción  
> **Dominio Desplegado:** `https://mexxicanmx.oamdevsol.site`  
> **Dominio Admin:** `https://admin.oamdevsol.site`  

---

## ⏱️ DISTRIBUCIÓN DEL TIEMPO Y REPARTICIÓN DEL EQUIPO

| Diapositiva | Tema | Expositor Asignado | Tiempo Estimado |
| :--- | :--- | :--- | :---: |
| **Slide 1** | Portada e Introducción | **Integrante 1 (Osbaldo)** | 30 seg |
| **Slide 2** | El Problema Gastronómico y Búsqueda Rígida | **Integrante 1 (Osbaldo)** | 45 seg |
| **Slide 3** | La Solución MexxicanMX | **Integrante 2 (Backend Lead)** | 45 seg |
| **Slide 4** | Flujo Operativo del Sistema | **Integrante 2 (Backend Lead)** | 1 min |
| **Slide 5** | Arquitectura Real & AWS Infrastructure | **Integrante 3 (Cloud & DevOps)** | 1 min |
| **Slide 6** | Funcionalidades Principales en Producción | **Integrante 3 (Cloud & DevOps)** | 1 min |
| **Slide 7** | Motor de Recomendación IA / Machine Learning | **Integrante 4 (ML Engineer)** | 1 min 15 seg |
| **Slide 8** | Pruebas y Verificación de Calidad (Testing) | **Integrante 4 (ML Engineer)** | 1 min |
| **Slide 9** | **DEMOSTRACIÓN PRÁCTICA EN VIVO** | **Todo el Equipo / Presentador Principal** | **2 min 30 seg** |
| **Slide 10** | Conclusiones y Trabajo Futuro | **Integrante 1 (Osbaldo)** | 35 seg |
| **TOTAL** | | | **9 MIN 40 SEG** |

---

## 📢 GUION DETALLADO SLIDE POR SLIDE

### 📌 Slide 1: Portada (30 s)
* **Expositor:** Integrante 1 (Osbaldo)
* **Guion:**
  > "Buenos días profesor y compañeros. El día de hoy nuestro equipo va a presentar **MexxicanMX**, una plataforma web e inteligente de menús digitales interactivos con código QR y motor de recomendación gastronómica personalizada mediante Machine Learning. El sistema se encuentra 100% funcional y desplegado en la nube de AWS en `mexxicanmx.oamdevsol.site`."

---

### 📌 Slide 2: El Problema y la Oportunidad (45 s)
* **Expositor:** Integrante 1 (Osbaldo)
* **Guion:**
  > "Identificamos dos grandes problemas en la industria gastronómica actual:
  > 1. Para los restaurantes, los menús impresos representan un costo recurrente y son difíciles de actualizar. Además, los archivos PDF digitales comunes no son interactivos y son incómodos de leer en dispositivos móviles.
  > 2. Para los comensales, los buscadores tradicionales son totalmente rígidos. Si una persona busca 'algo caldosito' o 'sin carne de cerdo', o comete un error ortográfico al escribir 'tacos al pastro', los motores de búsqueda por texto exacto devuelven cero resultados o alimentos inadecuados que ignoran restricciones y alergias alimentarias."

---

### 📌 Slide 3: La Solución MexxicanMX (45 s)
* **Expositor:** Integrante 2 (Backend Lead)
* **Guion:**
  > "Para solucionar esto creamos **MexxicanMX**, compuesto por 3 pilares clave:
  > Primer pilar: Un **Menú QR Dinámico** interactivo para comensales, con carga ultrarrápida, filtros por picante y alérgenos.
  > Segundo pilar: Un **Panel de Administración** donde los negocios gestionan sus platillos, precios, categorías y generan sus códigos QR vectoriales de forma instantánea.
  > Tercer pilar: Un **Motor de Inteligencia Artificial** en Python capaz de interpretar el antojo en lenguaje natural, filtrar alergias estrictamente y recomendar las mejores opciones."

---

### 📌 Slide 4: Flujo Operativo del Sistema (1 min)
* **Expositor:** Integrante 2 (Backend Lead)
* **Guion:**
  > "El funcionamiento del sistema sigue un ciclo cerrado muy sencillo:
  > El restaurante crea su cuenta y accede a su panel para dar de alta su menú. Al publicar, el sistema genera automáticamente un código QR único.
  > El cliente escanea el QR en la mesa para ver la carta digital, o bien puede entrar al módulo de descubrimiento por IA. Responde un cuestionario de 5 pasos con su antojo y restricciones, y el motor analiza todo el catálogo de platillos para presentarle las mejores opciones en tiempo real."

---

### 📌 Slide 5: Arquitectura Real & AWS Infrastructure (1 min)
* **Expositor:** Integrante 3 (Cloud & DevOps)
* **Guion:**
  > "En cuanto a la arquitectura real del sistema:
  > En el **Frontend** utilizamos React 18 con TypeScript y TailwindCSS, compilado y desplegado globalmente mediante **AWS S3 y CloudFront CDN** para máxima velocidad.
  > La API del **Backend** está construida en Node.js Express con arquitectura basada en controladores y persistencia en **PostgreSQL 16 con extensión pgvector** y caché en **Redis**.
  > El **Microservicio de ML** está desarrollado en Python 3.12 con **FastAPI**. Toda la infraestructura Backend e IA corre en contenedores Docker sobre una instancia de **AWS EC2**, gestionada mediante plantillas automatizadas de **AWS CloudFormation**."

---

### 📌 Slide 6: Funcionalidades Principales en Producción (1 min)
* **Expositor:** Integrante 3 (Cloud & DevOps)
* **Guion:**
  > "Dentro de las funcionalidades activas en producción destacamos:
  > - La carta digital interactiva con filtros dinámicos.
  > - El generador automático de códigos QR.
  > - El panel de administración con control de acceso basado en atributos (ABAC) y sistema de canales de soporte en tiempo real por Server-Sent Events (SSE).
  > - Y el asistente de descubrimiento gastronómico con tarjetas interactivas de swipe."

---

### 📌 Slide 7: Motor de Recomendación IA / Machine Learning (1 min 15 s)
* **Expositor:** Integrante 4 (ML Engineer)
* **Guion:**
  > "Queremos destacar el motor de Inteligencia Artificial que desarrollamos en Python.
  > El sistema aplica **normalización de texto**, **mapa de sinónimos y proteínas** (entendiendo que cerdo, puerco, pastor y carnitas se relacionan), y **Fuzzy Matching por distancia de Levenshtein** para tolerar errores ortográficos.
  > Combina una matriz **TF-IDF con similitud de coseno** para evaluación semántica multicampo (nombre, categoría, descripción, alérgenos e ingredientes).
  > Y lo más importante: aplica **REGLAS DE CONTROL ESTRICTO**. Si el usuario indica alergia al camarón o dieta vegetariana, o expresa negaciones como 'sin carne', la IA excluye inmediatamente los platillos no seguros antes del ranking. Además, si el puntaje de coincidencia no supera un umbral mínimo, el sistema no muestra platillos irrelevantes de relleno."

---

### 📌 Slide 8: Pruebas y Verificación de Calidad (Testing) (1 min)
* **Expositor:** Integrante 4 (ML Engineer)
* **Guion:**
  > "Tal como se solicitó para la evaluación del programa, realizamos auditorías y pruebas automatizadas reales:
  > 1. **Pruebas Unitarias de Python (`unittest`):** 5 de 5 pruebas exitosas (100%), validando sinónimos, negaciones y exclusión por alergias en 0.34 segundos.
  > 2. **Pruebas End-to-End (`Playwright`):** 8 de 8 pruebas integrales pasando limpiamente (100%) en navegadores Chromium Desktop y Mobile Chrome.
  > 3. **Auditoría de Infraestructura AWS (`CloudFormation`):** 6 plantillas YAML validadas con sintaxis limpia y comprobando la aislación privada de los puertos de base de datos."

---

### 📌 Slide 9: DEMOSTRACIÓN EN VIVO (2 min 30 s)
* **Expositor:** Presentador Principal / Todo el equipo
* **Guion de Acción:**
  1. *"Procederemos a realizar la demostración en vivo de la plataforma publicada en internet."*
  2. Abrir el navegador en `https://mexxicanmx.oamdevsol.site/cuestionario`.
  3. Ingresar el antojo: *"Quiero tacos al pastor picositos"*.
  4. Seleccionar etiquetas de antojo y avanzar.
  5. En el paso de alérgenos, marcar *"camarón"* para demostrar el filtro estricto.
  6. Hacer clic en **Descubrir Recomendaciones**.
  7. Mostrar la tarjeta resultantes: señalar la coincidencia del **99%**, la explicación de recomendación por IA y comprobar que **no aparece ningún platillo con camarón**.
  8. Hacer clic en el botón ❤️ de la tarjeta para demostrar la apertura directa de la carta digital del restaurante en una nueva pestaña.

---

### 📌 Slide 10: Conclusiones y Trabajo Futuro (35 s)
* **Expositor:** Integrante 1 (Osbaldo)
* **Guion:**
  > "En conclusión, logramos construir una plataforma web integral, robusta y completamente funcional en la nube. MexxicanMX no sólo cumple con la digitación de menús, sino que resuelve el problema de la búsqueda gastronómica mediante Inteligencia Artificial real y tolerante a fallos.
  > Como trabajo futuro, se contempla la integración de pasarelas de pago directo desde la mesa y el uso de embeddings vectoriales profundos.
  > Muchas gracias por su atención. Quedamos abiertos a sus preguntas."
