<script setup lang="ts">
// Términos y condiciones - Happy Pets
</script>

<template>
  <div class="bg-white min-h-screen py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

      <h1 class="font-heading text-4xl font-bold text-dark mb-2">Términos y Condiciones</h1>
      <p class="text-muted mb-10">Última actualización: {{ new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>

      <div class="space-y-8 text-dark/80 leading-relaxed">

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">1. Aceptación de los términos</h2>
          <p>Al acceder y utilizar el sitio web de <strong>Happy Pets</strong> y realizar compras a través de nuestra plataforma, usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le pedimos que no utilice nuestros servicios.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">2. Productos y disponibilidad</h2>
          <p>Happy Pets se reserva el derecho de modificar, descontinuar o limitar la disponibilidad de cualquier producto en cualquier momento sin previo aviso. Las imágenes de los productos son ilustrativas y pueden variar ligeramente del producto real.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">3. Precios y pagos</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Todos los precios están expresados en pesos colombianos (COP) e incluyen IVA cuando aplique.</li>
            <li>Nos reservamos el derecho de modificar precios en cualquier momento.</li>
            <li>Los pagos se procesan de forma segura a través de <strong>Bold Payments</strong>, que acepta tarjetas de crédito, débito, PSE y Botón Bancolombia.</li>
            <li>Una vez confirmado el pago, recibirá un correo de confirmación con el número de su orden.</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">4. Envíos y entregas</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>Realizamos envíos a todo el territorio colombiano.</li>
            <li>Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad del transportista.</li>
            <li>El costo de envío se calcula según la zona de destino y se informa antes de confirmar la compra.</li>
            <li>Happy Pets no se hace responsable por demoras causadas por la empresa transportadora o por situaciones de fuerza mayor.</li>
          </ul>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">5. Devoluciones y cambios</h2>
          <p>Aceptamos devoluciones dentro de los <strong>5 días hábiles</strong> siguientes a la recepción del producto, siempre que:</p>
          <ul class="list-disc pl-6 mt-3 space-y-1">
            <li>El producto esté en su empaque original sin abrir.</li>
            <li>No haya sido usado ni manipulado.</li>
            <li>Se presente la factura o comprobante de compra.</li>
          </ul>
          <p class="mt-3">Para iniciar un proceso de devolución, contáctenos en <a href="mailto:info@happypets.co" class="text-primary hover:underline">info@happypets.co</a>.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">6. Cuentas de usuario</h2>
          <p>Al crear una cuenta en Happy Pets, usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Notifíquenos inmediatamente si detecta un uso no autorizado de su cuenta.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">7. Propiedad intelectual</h2>
          <p>Todo el contenido del sitio web de Happy Pets, incluyendo textos, imágenes, logotipos y diseños, es propiedad de Happy Pets o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual colombianas e internacionales. Queda prohibida su reproducción sin autorización expresa.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">8. Limitación de responsabilidad</h2>
          <p>Happy Pets no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios. Nuestra responsabilidad máxima estará limitada al valor del pedido en cuestión.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">9. Ley aplicable</h2>
          <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será sometida a los tribunales competentes de Bogotá, Colombia.</p>
        </section>

        <section>
          <h2 class="font-heading text-xl font-bold text-dark mb-3">10. Contacto</h2>
          <p>Para cualquier consulta relacionada con estos términos y condiciones:</p>
          <ul class="list-none mt-3 space-y-1">
            <li>📧 <a href="mailto:info@happypets.co" class="text-primary hover:underline">info@happypets.co</a></li>
            <li>📍 Bogotá, Colombia</li>
          </ul>
        </section>

      </div>
    </div>
  </div>
</template>
