import Navbar from '@/components/Navbar'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos de Servicio</h1>
          <p className="text-sm text-gray-400 mb-8">Última actualización: marzo 2026</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Aceptación de los términos</h2>
              <p>Al acceder y usar Context Keeper, aceptas estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás usar el servicio.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Descripción del servicio</h2>
              <p>Context Keeper es una plataforma de gestión de prompts de inteligencia artificial que permite a los usuarios crear, organizar, personalizar y reutilizar prompts con variables dinámicas. Ofrecemos planes Free, Pro y Team con diferentes niveles de funcionalidades.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Cuentas de usuario</h2>
              <p>Debes proporcionar información precisa al registrarte. Eres responsable de mantener la seguridad de tu cuenta y de todas las actividades que ocurran bajo ella. Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Planes y facturación</h2>
              <p>El plan Free es gratuito e incluye hasta 3 proyectos. Los planes Pro (9 €/mes) y Team (20 €/mes) son de pago mensual procesado a través de Stripe. Puedes cancelar en cualquier momento desde tu página de cuenta. No ofrecemos reembolsos por periodos ya facturados.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Propiedad de los datos</h2>
              <p>Tus prompts y proyectos son tuyos. Context Keeper no reclamará derechos sobre el contenido que crees. Nos reservamos el derecho de acceder a los datos con fines técnicos de mantenimiento y soporte.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Uso aceptable</h2>
              <p>Está prohibido usar Context Keeper para: generar contenido ilegal, spam, acoso, contenido que viole derechos de terceros, o cualquier actividad que infrinja las leyes aplicables. Nos reservamos el derecho de suspender cuentas que violen estas normas.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Disponibilidad del servicio</h2>
              <p>Nos esforzamos por mantener Context Keeper disponible 24/7, pero no garantizamos disponibilidad ininterrumpida. Pueden producirse interrupciones por mantenimiento, actualizaciones o causas técnicas fuera de nuestro control.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Limitación de responsabilidad</h2>
              <p>Context Keeper se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables de daños indirectos, incidentales o consecuentes derivados del uso del servicio.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Cambios en los términos</h2>
              <p>Podemos actualizar estos términos en cualquier momento. Te notificaremos por email en caso de cambios significativos. El uso continuado del servicio después de los cambios implica aceptación de los nuevos términos.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contacto</h2>
              <p>Para cualquier consulta sobre estos términos, puedes contactarnos en: <a href="mailto:hola@contextkeeper.app" className="text-indigo-600 hover:underline">hola@contextkeeper.app</a></p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4 text-sm">
            <a href="/privacy" className="text-indigo-600 hover:underline">Política de Privacidad</a>
            <a href="/dashboard" className="text-gray-500 hover:text-gray-700">Volver al dashboard</a>
          </div>
        </div>
      </main>
    </div>
  )
}
