# Activar PayPal Live — Manuel Bienestar

## 1. Publicar el código actualizado primero
Descarga y extrae Actualizacion-produccion.zip. En GitHub, abre JuanManuel312/manuel-bienestar, rama main, Add file → Upload files. Arrastra el CONTENIDO del ZIP a la raíz, conservando las carpetas src, api, lib y tests. Confirma el commit y espera a que Vercel termine con estado Ready.
No subas el ZIP como un archivo, ni el HTML de vista previa. Este proyecto necesita el código del servidor además del frontend. El paquete incluye tu fotografía y los iconos SVG.

## 2. Obtener credenciales reales
1. Entra en https://developer.paypal.com/dashboard/applications con tu cuenta Business.
2. Abre Apps & Credentials y selecciona LIVE (no Sandbox).
3. Crea una aplicación REST llamada Manuel Bienestar o abre tu aplicación Live existente.
4. Copia su Client ID y su Secret. Ambos deben pertenecer a la misma aplicación Live.
5. Si PayPal solicita verificar o completar la cuenta Business, resuelve ese requisito en PayPal.
No envíes el Secret por chat, no lo subas a GitHub y no lo incluyas en capturas.

## 3. Cambiar variables en Vercel
Proyecto manuel-bienestar → Environment Variables. Edita las existentes para Production:

| Variable | Valor |
| --- | --- |
| PAYPAL_CLIENT_ID | Client ID de la aplicación Live |
| PAYPAL_CLIENT_SECRET | Secret de esa misma aplicación Live |
| PAYPAL_MODE | live |
| SITE_URL | https://manuel-bienestar.vercel.app |
| SALES_ENABLED | false por ahora; true cuando esté cargado el PDF |
| ACCESS_TOKEN_SECRET | Conserva el valor actual sin modificarlo |
| LIVE_ACCESS_TEST_ENABLED | false; la nueva versión ya no usa esta variable |

Después de guardar: Deployments → último despliegue → menú de tres puntos → Redeploy. Las variables nuevas se aplican en el nuevo despliegue. No mezcles claves Sandbox con modo live. Los accesos Sandbox no se convierten en compras reales.

## 4. Agregar el PDF cuando esté terminado
El archivo va en almacenamiento privado, NO en GitHub ni en public.
1. En Vercel → proyecto → Storage → Create Storage → Blob → Private. Conecta el almacén al proyecto.
2. Sube el PDF con tipo application/pdf al almacén privado. Puedes enviarme el PDF primero para revisar y acompañar este paso.
3. Copia la URL privada del archivo, que tiene la forma https://<store-id>.private.blob.vercel-storage.com/archivo.pdf.
4. Guarda esa URL en GUIDE_BLOB_URL para Production.
5. En las credenciales del almacén genera u obtén el token de lectura/escritura y guárdalo como BLOB_READ_WRITE_TOKEN para Production. Esta versión utiliza ese token explícitamente; BLOB_STORE_ID por sí solo no basta. No compartas el token en el chat.
6. Cambia SALES_ENABLED a true y vuelve a desplegar.

El servidor comprueba que exista un PDF accesible antes de crear un pedido Live. La descarga verifica la compra con PayPal y transmite el archivo sin revelar el token ni la URL privada. El PDF no está incluido en este paquete.

## 5. Comprobación final
Abre el sitio público después del despliegue. Debe aparecer Comprar mi guía · USD 9.90. Comprueba el flujo con un comprador real distinto de la cuenta vendedora: Live cobra dinero real. Confirma el pago en tu actividad de PayPal y comprueba la descarga y el enlace de recuperación. Abrir /mi-guia en un navegador sin acceso no debe entregar el archivo.
La prueba automática local pasó; no se ha realizado ni confirmado una compra Live con esta actualización.

## Textos y límites actuales
Se eliminaron las menciones públicas a ChatGPT y la pregunta sobre Frank Suárez. Las preguntas explican el producto, las comidas habituales, las expectativas de peso, el pago desde Perú y cómo recuperar el acceso. Se mantiene el carácter educativo y no se prometen kilos ni plazos.
No se envían correos automáticos: el comprador debe guardar su enlace personal. Antes de promocionar a gran escala conviene añadir un correo de soporte público y definir tus condiciones de atención/reembolso; no se ha inventado una política ni publicado tu correo privado.

Fuentes oficiales:
https://developer.paypal.com/api/rest/production/
https://vercel.com/docs/vercel-blob/private-storage
