# Manuel Bienestar — Vercel + PayPal

Mantiene el diseño y la transformación del personaje. Los iconos son SVG para evitar los emojis de iOS. Esta edición añade PayPal Checkout y una **página privada de prueba**, no la guía final.

## Activar la prueba

En Vercel → proyecto manuel-bienestar → Settings → Environment Variables, selecciona Production. No subas secretos a GitHub ni los pegues en el chat.

| Variable | Valor |
| --- | --- |
| `SITE_URL` | `https://manuel-bienestar.vercel.app` |
| `PAYPAL_MODE` | `sandbox` |
| `PAYPAL_CLIENT_ID` | Client ID de la aplicación Sandbox en PayPal Developer |
| `PAYPAL_CLIENT_SECRET` | Secret de esa misma aplicación Sandbox |
| `ACCESS_TOKEN_SECRET` | Clave aleatoria privada de al menos 48 caracteres; conservar copia segura |
| `SALES_ENABLED` | `true` para habilitar el checkout de prueba |
| `LIVE_ACCESS_TEST_ENABLED` | `false` durante Sandbox |

Genera ACCESS_TOKEN_SECRET con un gestor de contraseñas (64 caracteres aleatorios), o ejecuta localmente `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. Pega el resultado solo en Vercel. No cambies esta clave sin planificar la recuperación de accesos: cambiarla invalida los enlaces existentes.

Después de guardar variables, Vercel → Deployments → último despliegue → Redeploy. El repositorio configura Framework: Other, build `npm run build`, output `public`, Node 22 o posterior. Si había ajustes manuales del proyecto que contradicen estos valores, quita esos overrides.

En PayPal Developer → Testing Tools → Sandbox Accounts utiliza una cuenta Personal de prueba distinta de la cuenta Business vendedora. El botón explica que no hay dinero real en Sandbox. Completa la aprobación manualmente, vuelve a la web y comprueba la página privada. Copia su enlace personal y ábrelo en otro navegador. Sin enlace ni cookie, `/mi-guia` no muestra contenido privado. Reembolsa la operación Sandbox y verifica que deja de dar acceso.

## Prueba con dinero real

Primero verifica el recorrido Sandbox. Sustituye ambas credenciales por las de **la misma app Live**, establece `PAYPAL_MODE=live` y, solo si quieres probar un cobro real, `LIVE_ACCESS_TEST_ENABLED=true`. Mantén SITE_URL y ACCESS_TOKEN_SECRET. Vuelve a desplegar. Un comprador distinto del vendedor debe completar voluntariamente el pago.

El precio está fijado en el servidor: **USD 9.90**. Esta versión muestra una advertencia y pide confirmar que el cobro real entrega solamente la página de prueba. No hay PDF, y no debe anunciarse como venta de la guía terminada. Para vender la guía final queda integrar su archivo privado y actualizar estos textos. `SALES_ENABLED=false` cierra nuevos pedidos sin revocar compras existentes.

## Acceso y verificación

- El servidor crea el pedido y firma una cookie HttpOnly/Secure/SameSite=Lax que lo vincula al navegador.
- La URL de retorno no concede acceso por sí sola. Se consulta/captura la orden, comprobando estado COMPLETED, referencia, USD 9.90 y captura final única.
- Las capturas usan una clave de idempotencia estable. Retomar un pago no genera automáticamente otro cobro.
- Cada acceso y recuperación consulta el estado de la captura en PayPal. Un pago pendiente, reembolsado o no disponible no abre contenido. No se necesita webhook para esta prueba síncrona.
- Se conserva una cookie durante un año y se ofrece un enlace personal firmado válido diez años. Cada uso sigue requiriendo pago vigente. Es un enlace portador: cualquiera con el enlace puede usarlo; no compartirlo. Viaja en el fragmento y luego por POST, no como query de una petición al servidor. La página elimina el fragmento tras restaurar acceso.
- No se usan cuentas de ChatGPT, base de datos adicional ni correos automáticos. El registro financiero queda en PayPal. El contenido privado se genera en el servidor; no se incluye en el HTML o JavaScript público.
- Si el comprador pierde cookie y enlace, necesita asistencia manual con el recibo. No existe portal de administración o recuperación automática por correo en esta edición. El comprador puede contactar al vendedor desde el detalle de la operación en PayPal.

## Código y validación

`src/`: interfaz React; `lib/transformation.ts`: geometría; `lib/paypal.js`: cliente PayPal y firmas; `api/shop.js`: función de Vercel; `tests/paypal.test.js`: pruebas de autorización, precio, idempotencia, devolución y recuperación.

Instalar `npm install`; verificar `npm test`; compilar `npm run build`. La carpeta `public/` se genera en Vercel. El HTML en la raíz se mantiene como entrada de compatibilidad; la aplicación completa se sirve desde `public/`.

Las pruebas automatizadas usan respuestas simuladas. No equivalen a una compra Sandbox o Live real. No se han almacenado credenciales en el repositorio.

Referencias: [PayPal Orders API](https://developer.paypal.com/api/orders/v2), [PayPal Payments API](https://developer.paypal.com/api/payments/v2), [Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js), [variables de entorno](https://vercel.com/docs/environment-variables).
