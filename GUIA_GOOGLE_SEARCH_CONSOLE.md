# SEO y Google Search Console — portal académico

Este repositorio es un prototipo universitario **no oficial**. La configuración publica descripciones y tarjetas para compartir enlaces, pero por defecto incluye una directiva `noindex,nofollow` para no confundir a personas que busquen el portal oficial de la clínica.

## Preparación incluida en GitHub

- Descripción, título, Open Graph, favicon y canonical en `frontend/index.html`.
- Metadato de verificación opcional para Search Console con `VITE_GSC_VERIFICATION`, incorporado durante la compilación por Vite.
- `frontend/public/robots.txt` permite a los robots consultar las páginas para respetar la etiqueta `noindex`.
- No se registran servicios de Google Analytics ni se envían datos personales a Search Console.

## Activar Google Search Console

1. Acceder a https://search.google.com/search-console con una cuenta propia.
2. Añadir la propiedad **Prefijo de URL** `https://vet-tambo-frontend.onrender.com/`.
3. Elegir la verificación por **Etiqueta HTML** y copiar solo el valor `content` del metadato.
4. En el servicio `vet-tambo-frontend` de Render, abrir Environment y crear `VITE_GSC_VERIFICATION` con ese valor.
5. Guardar mediante **Save, rebuild and deploy**. Vite incorpora la verificación al HTML de salida.
6. Después de que Render esté Live, usar **Verificar** en Search Console.
7. Documentar capturas de verificación y estado de indexación en el informe.

## Aviso para el equipo

Search Console no exige que el sitio esté indexado para verificar propiedad. No quitar la directiva `noindex` hasta contar con autorización de la clínica y una revisión del aviso de sitio no oficial. Tampoco afirmar que verificar una propiedad garantiza tráfico o posición en Google.

La rúbrica pide aplicación funcional, seguridad, pruebas y evidencias: Search Console es una **ampliación opcional**, no un requisito textual ni garantiza la calificación.
