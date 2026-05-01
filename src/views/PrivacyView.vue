<script setup lang="ts">
// Política de privacidad - Happy Pets
</script>

<template>
  <div class="bg-white min-h-screen py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

      <h1 class="font-heading text-4xl font-bold text-dark mb-2">Política de Privacidad</h1>
      <p class="text-muted mb-10">Última actualización: {{ new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>

      <div class="prose prose-gray max-w-none space-y-8 text-dark/80 leading-relaxed">

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">1. Información que recopilamos</h2>
          <p>En <strong>Happy Pets</strong> recopilamos la información que usted nos proporciona directamente al crear una cuenta, realizar una compra o contactarnos, incluyendo:</p>
          <ul class="list-disc pl-6 mt-3 space-y-1">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección de envío</li>
            <li>Información de pago (procesada de forma segura por Bold Payments)</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">2. Cómo usamos su información</h2>
          <p>Utilizamos la información recopilada para:</p>
          <ul class="list-disc pl-6 mt-3 space-y-1">
            <li>Procesar y gestionar sus pedidos</li>
            <li>Enviarle confirmaciones y actualizaciones sobre sus compras</li>
            <li>Mejorar nuestros productos y servicios</li>
            <li>Comunicarnos con usted en respuesta a sus consultas</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">3. Compartición de información</h2>
          <p>No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en los siguientes casos:</p>
          <ul class="list-disc pl-6 mt-3 space-y-1">
            <li><strong>Procesadores de pago:</strong> Bold Payments, para gestionar transacciones de forma segura.</li>
            <li><strong>Servicios de envío:</strong> empresas de logística para entregar sus pedidos.</li>
            <li><strong>Cumplimiento legal:</strong> cuando sea requerido por ley o autoridad competente.</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">4. Seguridad de los datos</h2>
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, pérdida o divulgación. Los pagos son procesados mediante protocolos de cifrado SSL/TLS a través de Bold Payments.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">5. Cookies</h2>
          <p>Nuestro sitio web puede utilizar cookies para mejorar su experiencia de navegación. Puede configurar su navegador para rechazar todas las cookies, aunque esto puede afectar la funcionalidad del sitio.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">6. Sus derechos</h2>
          <p>De acuerdo con la Ley 1581 de 2012 (Ley de Protección de Datos Personales de Colombia), usted tiene derecho a:</p>
          <ul class="list-disc pl-6 mt-3 space-y-1">
            <li>Conocer, actualizar y rectificar sus datos personales</li>
            <li>Solicitar prueba de la autorización otorgada</li>
            <li>Ser informado sobre el uso de sus datos</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio</li>
            <li>Revocar la autorización y solicitar la supresión de sus datos</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">7. Retención de datos</h2>
          <p>Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, salvo que la ley exija un período de retención más largo.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">8. Cambios en esta política</h2>
          <p>Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. Le recomendamos revisar esta página periódicamente.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">9. Contacto</h2>
          <p>Si tiene preguntas sobre esta política de privacidad o sobre el tratamiento de sus datos personales, puede contactarnos en:</p>
          <ul class="list-none mt-3 space-y-1">
            <li>📧 <a href="mailto:info@happypets.co" class="text-primary hover:underline">info@happypets.co</a></li>
            <li>📍 Bogotá, Colombia</li>
          </ul>
        </section>

      </div>
    </div>
  </div>
</template>
