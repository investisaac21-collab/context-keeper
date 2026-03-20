import Navbar from '@/components/Navbar'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
          <p className="text-sm text-gray-400 mb-8">Última actualización: marzo 2026</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Información que recopilamos</h2>
              <p>Recopilamos la siguiente información cuando usas Context Keeper:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Información de cuenta: email y nombre proporcionado al registrarte con Google</li>
                <li>Contenido creado: prompts, proyectos, variables y versiones que guardas en la plataforma</li>
                <li>Datos de uso: páginas visitadas, funciones usadas y frecuencia de uso</li>
                <li>Información de pago: gestionada completamente por Stripe (no almacenamos datos de tarjeta)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Cómo usamos tu información</h2>
              <p>Usamos tu información para:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Proveer y mejorar el servicio de Context Keeper</li>
                <li>Procesar pagos y gestionar tu suscripción</li>
                <li>Enviarte comunicaciones relacionadas con el servicio</li>
                <li>Detectar y prevenir fraudes o abusos</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Servicios de terceros</h2>
              <p>Utilizamos los siguientes servicios de terceros:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Supabase:</strong> almacenamiento de datos y autenticación</li>
                <li><strong>Stripe:</strong> procesamiento de pagos</li>
                <li><strong>Groq:</strong> generación de prompts con IA (los prompts se envían a Groq para su procesamiento)</li>
                <li><strong>Vercel:</strong> alojamiento de la aplicación</li>
                <li><strong>Google OAuth:</strong> autenticación con cuenta de Google</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Seguridad de los datos</h2>
              <p>Implementamos medidas de seguridad estándar de la industria para proteger tu información, incluyendo cifrado en tránsito (HTTPS) y en reposo. Sin embargo, ningún sistema es 100% seguro y no podemos garantizar seguridad absoluta.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Tus derechos</h2>
              <p>Tienes derecho a:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Acceder a los datos personales que tenemos sobre ti</li>
                <li>Solicitar la corrección de datos incorrectos</li>
                <li>Solicitar la eliminación de tu cuenta y datos</li>
                <li>Exportar tus datos en formato JSON desde el dashboard</li>
                <li>Oponerte al procesamiento de tus datos</li>
              </ul>
              <p className="mt-2">Para ejercer estos derechos, contáctanos en <a href="mailto:hola@contextkeeper.app" className="text-indigo-600 hover:underline">hola@contextkeeper.app</a></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Cookies</h2>
              <p>Usamos cookies estrictamente necesarias para el funcionamiento del servicio (autenticación y preferencias de sesión). No usamos cookies de seguimiento ni publicidad de terceros.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Retención de datos</h2>
              <p>Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, borraremos tus datos en un plazo de 30 días, salvo obligación legal de conservación.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Cambios en esta política</h2>
              <p>Podemos actualizar esta política ocasionalmente. Te notificaremos por email sobre cambios significativos. La fecha de última actualización aparece siempre al inicio del documento.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contacto</h2>
              <p>Para cualquier consulta sobre privacidad: <a href="mailto:hola@contextkeeper.app" className="text-indigo-600 hover:underline">hola@contextkeeper.app</a></p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4 text-sm">
            <a href="/terms" className="text-indigo-600 hover:underline">Términos de Servicio</a>
            <a href="/dashboard" className="text-gray-500 hover:text-gray-700">Volver al dashboard</a>
          </div>
        </div>
      </main>
    </div>
  )
}
