// Componente modal interactivo para galería de fotos de servicios
// Se puede usar en cualquier página Astro

export function initServiceModals() {
    // Datos de ejemplo para cada servicio con más imágenes
    const serviciosData = {
        'corte-cabello': {
            title: 'Corte de Cabello',
            description: 'Cortes modernos y clásicos adaptados a tu estilo personal',
            images: [
                { url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600', alt: 'Fade moderno' },
                { url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600', alt: 'Corte clásico' },
                { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600', alt: 'Estilo texturizado' },
                { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600', alt: 'Pompadour moderno' },
                { url: 'https://images.unsplash.com/photo-1620331311532-0d4b35f8c53d?w=600', alt: 'Undercut' },
                { url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600', alt: 'Corte degradado' },
            ]
        },
        'barba': {
            title: 'Arreglo de Barba',
            description: 'Perfilado y mantenimiento profesional para una barba impecable',
            images: [
                { url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600', alt: 'Barba completa' },
                { url: 'https://images.unsplash.com/photo-1598439263269-b0e76e6af8b5?w=600', alt: 'Perfilado preciso' },
                { url: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=600', alt: 'Estilo moderno' },
                { url: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=600', alt: 'Barba media' },
                { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600', alt: 'Barba ejecutiva' },
                { url: 'https://images.unsplash.com/photo-1571868230849-b434a46a7feb?w=600', alt: 'Barba larga' },
            ]
        },
        'combo': {
            title: 'Corte + Barba',
            description: 'El paquete completo para lucir impecable de pies a cabeza',
            images: [
                { url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600', alt: 'Look completo' },
                { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600', alt: 'Estilo ejecutivo' },
                { url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600', alt: 'Look casual' },
                { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', alt: 'Look profesional' },
                { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600', alt: 'Estilo urbano' },
                { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600', alt: 'Look clásico' },
            ]
        },
        'afeitado': {
            title: 'Afeitado Clásico',
            description: 'Experiencia tradicional con navaja y toalla caliente',
            images: [
                { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600', alt: 'Afeitado tradicional' },
                { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600', alt: 'Navaja clásica' },
                { url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600', alt: 'Resultado final' },
                { url: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=600', alt: 'Proceso de afeitado' },
                { url: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=600', alt: 'Toalla caliente' },
                { url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600', alt: 'Afeitado apurado' },
            ]
        },
    };

    let currentService = '';
    let currentImageIndex = 0;

    // Crear modal principal
    const modal = document.createElement('div');
    modal.id = 'service-modal';
    modal.className = 'modal-overlay hidden';
    modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" aria-label="Cerrar">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="modal-body">
        <h3 id="modal-title" class="text-3xl font-display font-bold mb-2 text-gradient"></h3>
        <p id="modal-description" class="text-gray-400 mb-6"></p>
        <div id="modal-gallery" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);

    // Crear lightbox para vista expandida
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox-overlay hidden';
    lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Cerrar lightbox">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <button class="lightbox-prev" aria-label="Anterior">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    <button class="lightbox-next" aria-label="Siguiente">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
    <div class="lightbox-content">
      <img id="lightbox-image" src="" alt="" />
      <p id="lightbox-caption" class="lightbox-caption"></p>
      <p class="lightbox-counter"><span id="lightbox-current">1</span> / <span id="lightbox-total">6</span></p>
    </div>
  `;
    document.body.appendChild(lightbox);

    // Función para abrir modal principal
    function openModal(serviceId: string) {
        currentService = serviceId;
        const data = serviciosData[serviceId as keyof typeof serviciosData];
        if (!data) return;

        const titleEl = document.getElementById('modal-title');
        const descEl = document.getElementById('modal-description');
        const galleryEl = document.getElementById('modal-gallery');

        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.description;

        if (galleryEl) {
            galleryEl.innerHTML = data.images.slice(0, 3).map((img, index) => `
        <div class="gallery-item" data-index="${index}">
          <img src="${img.url}" alt="${img.alt}" class="w-full h-64 object-cover rounded-lg cursor-pointer" loading="lazy" />
          <p class="text-center text-sm text-gray-400 mt-2">${img.alt}</p>
        </div>
      `).join('');

            // Agregar event listeners a las imágenes
            galleryEl.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.getAttribute('data-index') || '0');
                    openLightbox(index);
                });
            });
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Función para abrir lightbox
    function openLightbox(index: number) {
        currentImageIndex = index;
        updateLightbox();
        lightbox.classList.remove('hidden');
    }

    // Función para actualizar lightbox
    function updateLightbox() {
        const data = serviciosData[currentService as keyof typeof serviciosData];
        if (!data) return;

        const img = document.getElementById('lightbox-image') as HTMLImageElement;
        const caption = document.getElementById('lightbox-caption');
        const current = document.getElementById('lightbox-current');
        const total = document.getElementById('lightbox-total');

        if (img) {
            img.src = data.images[currentImageIndex].url;
            img.alt = data.images[currentImageIndex].alt;
        }
        if (caption) caption.textContent = data.images[currentImageIndex].alt;
        if (current) current.textContent = (currentImageIndex + 1).toString();
        if (total) total.textContent = data.images.length.toString();
    }

    // Función para cerrar modal
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Función para cerrar lightbox
    function closeLightbox() {
        lightbox.classList.add('hidden');
    }

    // Navegar en lightbox
    function nextImage() {
        const data = serviciosData[currentService as keyof typeof serviciosData];
        if (!data) return;
        currentImageIndex = (currentImageIndex + 1) % data.images.length;
        updateLightbox();
    }

    function prevImage() {
        const data = serviciosData[currentService as keyof typeof serviciosData];
        if (!data) return;
        currentImageIndex = (currentImageIndex - 1 + data.images.length) % data.images.length;
        updateLightbox();
    }

    // Event listeners
    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev')?.addEventListener('click', prevImage);
    lightbox.querySelector('.lightbox-next')?.addEventListener('click', nextImage);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!lightbox.classList.contains('hidden')) {
                closeLightbox();
            } else if (!modal.classList.contains('hidden')) {
                closeModal();
            }
        }
        // Navegación con flechas en lightbox
        if (!lightbox.classList.contains('hidden')) {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    });

    // Agregar listeners a las tarjetas de servicios
    document.querySelectorAll('[data-service]').forEach(card => {
        card.addEventListener('click', () => {
            const serviceId = card.getAttribute('data-service');
            if (serviceId) openModal(serviceId);
        });
    });
}
