// script.js — логика каталога

let currentFilteredProducts = [...productsCatalog];

// Элементы DOM
const gridContainer = document.getElementById('catalogGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const brandFilter = document.getElementById('brandFilter');
const resetBtn = document.getElementById('resetFilters');
const itemsCountSpan = document.getElementById('itemsCount');

// Заполняем выпадающий список производителей
function populateBrandFilter() {
	const brands = getUniqueBrands(productsCatalog);
	brandFilter.innerHTML = '<option value="all">Все бренды</option>';
	brands.forEach((brand) => {
		const option = document.createElement('option');
		option.value = brand;
		option.textContent = brand;
		brandFilter.appendChild(option);
	});
}

// Рендер карточек с кастомными полями в зависимости от категории
function renderCatalog(products) {
	if (!products.length) {
		gridContainer.innerHTML = `<div class="loading-placeholder">🔍 Ничего не найдено. Попробуйте изменить фильтры.</div>`;
		itemsCountSpan.textContent = '0';
		return;
	}

	itemsCountSpan.textContent = products.length;

	gridContainer.innerHTML = products
		.map((product) => {
			// Формируем блок характеристик в зависимости от типа
			let specsHtml = '';

			if (product.category === 'cpu') {
				specsHtml = `
                <div class="spec-item"><span class="spec-label">🔹 Ядра / потоки:</span><span class="spec-value">${product.specs.cores} / ${product.specs.threads}</span></div>
                <div class="spec-item"><span class="spec-label">🔹 Чипсет:</span><span class="spec-value">${product.specs.chipset}</span></div>
                <div class="spec-item"><span class="spec-label">🔹 Сокет:</span><span class="spec-value">${product.specs.socket}</span></div>
                ${product.specs.additional ? `<div class="spec-item"><span class="spec-label">🔹 Особенность:</span><span class="spec-value">${product.specs.additional}</span></div>` : ''}
            `;
			} else if (product.category === 'motherboard') {
				specsHtml = `
                <div class="spec-item"><span class="spec-label">🎛️ Чипсет:</span><span class="spec-value">${product.specs.chipset}</span></div>
                <div class="spec-item"><span class="spec-label">🔌 Сокет:</span><span class="spec-value">${product.specs.socket}</span></div>
                <div class="spec-item"><span class="spec-label">⚡ PCI-E версия:</span><span class="spec-value">${product.specs.pcie_version}</span></div>
                <div class="spec-item"><span class="spec-label">🧠 Тип RAM:</span><span class="spec-value">${product.specs.ram_type}</span></div>
                <div class="spec-item"><span class="spec-label">📐 Форм-фактор:</span><span class="spec-value">${product.specs.form_factor}</span></div>
            `;
			} else if (product.category === 'ram') {
				specsHtml = `
                <div class="spec-item"><span class="spec-label">🧮 Тип памяти:</span><span class="spec-value">${product.specs.type}</span></div>
                <div class="spec-item"><span class="spec-label">📀 Объём:</span><span class="spec-value">${product.specs.capacity}</span></div>
                <div class="spec-item"><span class="spec-label">⏱️ Тайминги:</span><span class="spec-value">${product.specs.timings}</span></div>
                <div class="spec-item"><span class="spec-label">⚡ Частота:</span><span class="spec-value">${product.specs.frequency}</span></div>
            `;
			} else if (product.category === 'storage') {
				specsHtml = `
                <div class="spec-item"><span class="spec-label">💾 Ёмкость:</span><span class="spec-value">${product.specs.capacity}</span></div>
                <div class="spec-item"><span class="spec-label">📖 Чтение:</span><span class="spec-value">${product.specs.read_speed}</span></div>
                <div class="spec-item"><span class="spec-label">✍️ Запись:</span><span class="spec-value">${product.specs.write_speed}</span></div>
                <div class="spec-item"><span class="spec-label">🔌 Интерфейс:</span><span class="spec-value">${product.specs.interface}</span></div>
            `;
			} else {
				// Для периферии и аксессуаров — красивый вывод всех ключей
				const otherSpecs = Object.entries(product.specs)
					.map(
						([key, val]) => `
                <div class="spec-item"><span class="spec-label">📌 ${key}:</span><span class="spec-value">${val}</span></div>
            `,
					)
					.join('');
				specsHtml = otherSpecs;
			}

			const categoryLabel = {
				cpu: 'Процессор',
				motherboard: 'Материнская плата',
				ram: 'ОЗУ',
				storage: 'Накопитель',
				peripheral: 'Периферия',
				accessory: 'Аксессуар',
			}[product.category];

			// Обработка изображения: если нет image или пустая строка, показываем заглушку
			const imageUrl =
				product.image && product.image !== ''
					? product.image
					: 'images/placeholder.jpg';

			return `
            <div class="product-card">
                <div class="card-image-wrapper">
                    <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="card-header">
                    <div class="product-name">${product.name}</div>
                    <div class="product-brand">${product.brand}</div>
                </div>
                <div class="specs-list">
                    ${specsHtml}
                </div>
                <div class="price-section">
                    <span class="price">${product.price.toLocaleString()} ₽ <small>руб.</small></span>
                    <span class="badge-cat">${categoryLabel}</span>
                </div>
            </div>
        `;
		})
		.join('');
}

// Фильтрация товаров
function filterProducts() {
	const searchTerm = searchInput.value.trim().toLowerCase();
	const selectedCategory = categoryFilter.value;
	const selectedBrand = brandFilter.value;

	currentFilteredProducts = productsCatalog.filter((product) => {
		// Поиск по имени, бренду, характеристикам
		const searchableText =
			`${product.name} ${product.brand} ${JSON.stringify(product.specs)}`.toLowerCase();
		const matchesSearch =
			searchTerm === '' || searchableText.includes(searchTerm);

		// Категория
		const matchesCategory =
			selectedCategory === 'all' || product.category === selectedCategory;

		// Производитель
		const matchesBrand =
			selectedBrand === 'all' || product.brand === selectedBrand;

		return matchesSearch && matchesCategory && matchesBrand;
	});

	renderCatalog(currentFilteredProducts);
}

// Сброс всех фильтров
function resetAllFilters() {
	searchInput.value = '';
	categoryFilter.value = 'all';
	brandFilter.value = 'all';
	filterProducts();
}

// События
searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
brandFilter.addEventListener('change', filterProducts);
resetBtn.addEventListener('click', resetAllFilters);

// Инициализация
populateBrandFilter();
filterProducts();
