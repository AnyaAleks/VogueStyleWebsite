document.addEventListener('DOMContentLoaded', function () {
    // Add smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    for (let anchor of anchors) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // HOVER effect for service cards :)
    const serviceCards = document.querySelectorAll('.service-card');
    for (let card of serviceCards) {
        card.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#f8f2ff';
        });
        card.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '#fff';
            // This is to keep featured cards highlighted
            if (this.classList.contains('featured')) {
                this.style.backgroundColor = '#f8f2ff';
            }
        });
    }

    // Fetch services from the API and display them
    fetchServices();

    // Add event listener for the "Sort by Price" button
    const sortByPriceButton = document.getElementById('sort-by-price');
    if (sortByPriceButton) {
        sortByPriceButton.addEventListener('click', function () {
            fetchServicesSortedByPrice();
        });
    }


    // Обработчик загрузки фото
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) {
        photoUpload.addEventListener('change', function(e) {
            handlePhotoUpload(e);
        });
    }

    // Обработчик удаления фото
    const deletePhoto = document.getElementById('delete-photo');
    if (deletePhoto) {
        deletePhoto.addEventListener('click', function() {
            handlePhotoDelete();
        });
    }
});

//document.getElementById('loginForm').addEventListener('submit', function(event) {
//    event.preventDefault();
//
//    // Здесь должна быть проверка логина и пароля
//    // Для примера используем простую проверку
//    const username = document.getElementById('username').value;
//    const password = document.getElementById('password').value;
//    const errorMessage = document.getElementById('errorMessage');
//
//    // Пример проверки (замените на реальную проверку)
//    if (username === 'master' && password === '12345') {
//        // Если данные верные, отправляем форму
//        this.submit();
//    } else {
//        // Если данные неверные, показываем сообщение об ошибке
//        errorMessage.style.display = 'block';
//    }
//});

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.match('image.*')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
    }

    // Проверка размера файла (например, не более 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Размер файла не должен превышать 2MB');
        return;
    }

    // Создаем превью изображения
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewContainer = document.getElementById('photo-preview');

        // Если это div-плейсхолдер, заменяем его на img
        if (previewContainer.tagName === 'DIV') {
            const img = document.createElement('img');
            img.id = 'photo-preview';
            img.className = 'lk-photo';
            img.src = e.target.result;
            img.alt = 'Фото мастера';

            previewContainer.parentNode.replaceChild(img, previewContainer);
        } else {
            // Если это уже img, просто обновляем src
            previewContainer.src = e.target.result;
        }
    };

    reader.readAsDataURL(file);
}

function handlePhotoDelete() {
    const previewContainer = document.getElementById('photo-preview');

    // Если это img, заменяем его на плейсхолдер
    if (previewContainer.tagName === 'IMG') {
        const placeholder = document.createElement('div');
        placeholder.id = 'photo-preview';
        placeholder.className = 'lk-photo-placeholder';
        placeholder.innerHTML = '<span>Фото не загружено</span>';

        previewContainer.parentNode.replaceChild(placeholder, previewContainer);
    }

    // Сбрасываем значение input file
    const photoUpload = document.getElementById('photo-upload');
    if (photoUpload) {
        photoUpload.value = '';
    }
}

// Function to fetch all services from the API
async function fetchServices() {
    console.error("Start fetch")
    try {
        const response = await fetch('/api/v1/resources/services/all');
        const services = await response.json();

        const servicesContainer = document.getElementById('services');
        if (servicesContainer) {
            servicesContainer.innerHTML = ''; // Clear previous content

            // Loop through the services and create HTML elements
            services.forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <h3>${service.name}</h3>
                    <p class="price">Price: $${service.price}</p>
                    <button onclick="showDialog('${service.name}', ${service.price}, ${service.id})" class="btn">Записаться</button>
                `;
                servicesContainer.appendChild(serviceCard);
            });
        }
    } catch (error) {
        console.error('Error fetching services:', error);
    }
}

// Function to fetch services sorted by price
async function fetchServicesSortedByPrice() {
    try {
        const response = await fetch('/api/v1/resources/prices/sort');
        const services = await response.json();

        const servicesContainer = document.getElementById('services');
        if (servicesContainer) {
            servicesContainer.innerHTML = ''; // Clear previous content

            // Loop through the sorted services and create HTML elements
            services.forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <h3>${service.service}</h3>
                    <p class="price">Price: $${service.price}</p>
                    <button onclick="bookService('${service.service}')" class="btn">Записаться</button>
                `;
                servicesContainer.appendChild(serviceCard);
            });
        }
    } catch (error) {
        console.error('Error sorting services:', error);
    }
}
function toggleDetails(masterId) {
    const details = document.getElementById(`details-${masterId}`);
    const button = document.querySelector(`#details-${masterId}`).nextElementSibling;

    details.classList.toggle('expanded');
    button.classList.toggle('active');

    if (details.classList.contains('expanded')) {
        button.querySelector('.btn-text').textContent = 'СВЕРНУТЬ';
    } else {
        button.querySelector('.btn-text').textContent = 'ЧИТАТЬ ПОДРОБНЕЕ';
    }
}

const carousel = document.querySelector('.carousel');
const items = document.querySelectorAll('.carousel-item');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const indicators = document.querySelectorAll('.indicator');

let currentIndex = 0;
const scaleDownFactor = 0.85; // Коэффициент уменьшения неактивных элементов

function updateCarousel() {
    items.forEach((item, index) => {
        const distance = Math.abs(index - currentIndex);
        let scale = 1;
        let zIndex = items.length;

        if (distance > 0) {
            scale = Math.pow(scaleDownFactor, distance);
            zIndex = items.length - distance;
        }

        item.style.transform = `scale(${scale})`;
        item.style.zIndex = zIndex;
        item.style.opacity = distance > 1 ? 0.7 : 1;
    });

    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

// Инициализация
updateCarousel();

// Обработчики событий
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
    updateCarousel();
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
    updateCarousel();
});

indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
    });
});

document.querySelectorAll('.carousel-image').forEach(img => {
    let scale = 1;
    const element = img;

    element.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Определяем направление масштабирования
        scale += e.deltaY * -0.01;

        // Ограничиваем масштаб
        scale = Math.min(Math.max(0.5, scale), 3);

        // Применяем трансформацию
        element.style.transform = `scale(${scale})`;
    });
});

// Обновите вызов в fetchServices
async function fetchServices() {
    console.error("Start fetch")
    try {
        const response = await fetch('/api/v1/resources/services/all');
        const services = await response.json();

        const servicesContainer = document.getElementById('services');
        if (servicesContainer) {
            servicesContainer.innerHTML = ''; // Clear previous content

            // Loop through the services and create HTML elements
            services.forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <h3>${service.name}</h3>
                    <p class="price">Price: $${service.price}</p>
                    <button onclick="showPopUpForRequest('${service.name}', ${service.price})" class="btn">Записаться</button>
                `;
                servicesContainer.appendChild(serviceCard);
            });
        }
    } catch (error) {
        console.error('Error fetching services:', error);
    }
}



// Автопрокрутка (по желанию)
// setInterval(() => {
//     currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
//     updateCarousel();
// }, 3000);

// Function to book a service
function bookService(serviceName) {
    alert(`Вы выбрали: ${serviceName}\nЦена: ${price} ₽\nФункция записи будет реализована позже`);
    // Отправка на сервер:
    /*
    fetch('/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            service: serviceName,
            date: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Бронирование подтверждено!');
    })
    .catch(error => {
        console.error('Ошибка бронирования:', error);
        alert('Произошла ошибка при бронировании');
    });
    */
}

//document.getElementById('delete-photo').addEventListener('click', function() {
//    if (confirm('Удалить фото?')) {
//        fetch('/delete-photo/', {
//            method: 'POST',
//            headers: {
//                'X-CSRFToken': '{{ csrf_token }}',
//                'Content-Type': 'application/json',
//            },
//            body: JSON.stringify({master_id: {{ master.id }}})
//        })
//        .then(response => location.reload())
//    }
//});
//
//document.getElementById('photo-upload').addEventListener('change', function(e) {
//    if (e.target.files.length > 0) {
//        document.querySelector('.lk-form').submit();
//    }
//});

//dialog window--------------------------------------
//function showPopUpForRequest(serviceName, servicePrice) {
//    const popUpElement = document.getElementById("pop-up");
//
//    if (!popUpElement) {
//        console.error("Dialog element not found");
//        return;
//    }
//
//    // Устанавливаем информацию об услуге
//    const nameElement = document.getElementById("popup-service-name");
//    const priceElement = document.getElementById("popup-service-price");
//
//    if (nameElement) nameElement.textContent = serviceName;
//    if (priceElement) priceElement.textContent = servicePrice;
//
//    // Показываем диалоговое окно (лучше использовать showModal())
//    popUpElement.showModal();
//}


// Показ диалога с первой страницей
function showDialog(serviceName, servicePrice, serviceId) {
    const dialog = document.getElementById('pop-up');
    if (serviceName && servicePrice) {
        showFirstPage(serviceName, servicePrice, serviceId);
    } else {
        showServiceList();
    }
    dialog.showModal();
}

async function showServiceList() {
    const content = document.getElementById('dialog-content');
    content.innerHTML = `
        <div class="dialog-container">
            <h3 class="dialog-title">Выберите услугу:</h3>
            <div class="location-list" id="service-list-container">
                Загрузка...
            </div>
            <div class="popup-buttons">
                <button onclick="document.getElementById('pop-up').close()">Закрыть</button>
            </div>
        </div>
    `;

    const serviceListContainer = document.getElementById('service-list-container');

    try {
        const response = await fetch('http://82.202.142.17:8000/services');
        const data = await response.json();

        if (data && data.ok && data.services && Array.isArray(data.services)) {
            const services = data.services;

            let servicesHTML = '';
            services.forEach(service => {
                servicesHTML += `
                    <div class="location" onclick="showFirstPage('${service.name}', '${service.price}', ${service.id})">
                        <div class="location-name">${service.name}</div>
                        <div class="location-address">Цена: ${service.price} ₽</div>
                    </div>
                `;
            });
            serviceListContainer.innerHTML = servicesHTML;
        } else {
            serviceListContainer.innerHTML = '<div class="location-name">Ошибка загрузки услуг.</div>';
        }
    } catch (error) {
        console.error('Ошибка получения списка услуг:', error);
        serviceListContainer.innerHTML = '<div class="location-name">Ошибка при загрузке списка услуг.</div>';
    }
}

// Остальные функции без изменений...


function showFirstPage(serviceName, servicePrice, serviceId) {
    const content = document.getElementById('dialog-content');
    content.innerHTML = `
        <div class="dialog-container">
            <h3 class="dialog-title">Запись на услугу</span></h3>
            <p class="service-price-info">Услуга: <span>${serviceName}</span></p>
            <p class="location-info">Стоимость: <span>${servicePrice}</span> ₽</p>

            <div class="popup-buttons">
                <button onclick="showSecondPage('${serviceName}', '${servicePrice}', '${serviceId}')">Записаться</button>
                <button onclick="document.getElementById('pop-up').close()">Закрыть</button>
            </div>
        </div>
    `;
}

function showSecondPage(serviceName, servicePrice, serviceId) {
    const content = document.getElementById('dialog-content');
    content.innerHTML = `
        <div class="dialog-container">
            <h3 class="dialog-title">Выберите адрес для услуги: <span>${serviceName}</span></h3>
            <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
            <div class="location-list">
                <div class="location" onclick="handleLocationSelect(this, '${serviceName}', ${servicePrice}, 'Центр города', '${serviceId}')">
                    <div class="location-name">Салон VogueStyle в Центре города</div>
                    <div class="location-address">ул. Большая Морская 67, Санкт-Петербург</div>
                </div>

                <div class="location" onclick="handleLocationSelect(this, '${serviceName}', ${servicePrice}, 'Московская', '${serviceId}')">
                    <div class="location-name">Салон VogueStyle на Московской</div>
                    <div class="location-address">Гастелло ул. 15, Санкт-Петербург</div>
                </div>

                <div class="location" onclick="handleLocationSelect(this, '${serviceName}', ${servicePrice}, 'Ленсовета', '${serviceId}')">
                    <div class="location-name">Салон VogueStyle на Ленсовета</div>
                    <div class="location-address">Ленсовета ул. 14, Санкт-Петербург</div>
                </div>
            </div>
            <div class="popup-buttons">
                <button onclick="showFirstPage('${serviceName}', ${servicePrice})">Назад</button>
            </div>
        </div>
    `;
}

function handleLocationSelect(element, serviceName, servicePrice, locationName, serviceId) {
    // Удаляем класс selected у всех элементов
    document.querySelectorAll('.location').forEach(loc => {
        loc.classList.remove('selected');
    });

    // Добавляем класс selected к выбранному элементу
    element.classList.add('selected');

    // Сразу переходим на третью страницу с выбранным адресом
    showThirdPage(serviceName, servicePrice, locationName, serviceId);
}

function showFourthPage(serviceName, servicePrice, locationName) {
    const content = document.getElementById('dialog-content');
    content.innerHTML = `
        <div class="popup-content">
            <h3 class="dialog-title">Выберите услугу: <span id="selected-service-name"></span></h3>
            <div class="service-list-js" id="services-container">
                <!-- Услуги будут добавлены динамически -->
            </div>
            <div class="popup-buttons">
                <button onclick="showSecondPage('${serviceName}', ${servicePrice})">Назад</button>
            </div>
        </div>
    `;

    // Загрузка и отображение услуг
    loadServicesData();
}

function loadServicesData() {
    // Используем предзагруженные данные или делаем запрос
    if (window.servicesData && Array.isArray(window.servicesData)) {
        renderServices(window.servicesData);
    } else {
        console.error('Ошибка: Некорректные данные услуг', window.servicesData);
        document.getElementById('services-container').innerHTML =
            '<div class="error">Не удалось загрузить данные услуг</div>';
    }
}

function renderServices(services) {
    const container = document.getElementById('services-container');
    container.innerHTML = '';

    services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-js';
        serviceElement.dataset.id = service.id;

        serviceElement.innerHTML = `
            <div class="service-info-js">
                <div class="service-name-js">${service.name}</div>
                <div class="service-price-js">${service.price} rub.</div>
            </div>
        `;

        serviceElement.onclick = () => handleServiceSelect(serviceElement, service.id, service.name, service.price);
        container.appendChild(serviceElement);
    });
}

function handleServiceSelect(element, serviceId, serviceName, servicePrice) {
    // Снимаем выделение со всех услуг
    document.querySelectorAll('.service-js').forEach(s => {
        s.classList.remove('selected');
    });

    // Добавляем выделение выбранной услуге
    element.classList.add('selected');

    // Переходим на следующую страницу с выбранной услугой
    showFourthPagePage(serviceName, servicePrice, serviceId);
}

function showThirdPage(serviceName, servicePrice, locationName, serviceId) {
    console.log("Функция showThirdPage вызвана");

    const content = document.getElementById('dialog-content');
    content.innerHTML = `
        <div class="dialog-container">
            <h3 class="dialog-title">Выберите мастера</span></h3>
            <p class="location-info">Услуга: <span>${serviceName}</span></p>
            <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
            <p class="location-info">Локация: <span>${locationName}</span></p>
            <div class="loading-spinner"></div>
            <div class="master-list-js" id="masters-container"></div>
            <div class="popup-buttons">
                <button onclick="showSecondPage('${serviceName}', ${servicePrice}, ${serviceId})">Назад</button>
            </div>
        </div>
    `;

    const spinner = content.querySelector('.loading-spinner');
    const container = content.querySelector('#masters-container');

    spinner.style.display = 'block';
    container.innerHTML = '';

    const url = 'http://82.202.142.17:8000/master';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
       .then(data => {
            console.log("API response:", data);
            spinner.style.display = 'none';

            if (Array.isArray(data) && data.length > 0) { // Проверка, что data - массив
                renderMasters(data, serviceName, servicePrice, locationName, container, serviceId);
            } else {
                container.innerHTML = `
                    <div class="no-masters">
                        <i class="icon-warning"></i>
                        <p>Нет доступных мастеров.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            spinner.style.display = 'none';
            console.error('Ошибка загрузки мастеров:', error);
            container.innerHTML = `
                <div class="error">
                    <i class="icon-error"></i>
                    <p>Ошибка загрузки данных. Пожалуйста, попробуйте позже.</p>
                    <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}')">
                        Попробовать снова
                    </button>
                </div>
            `;
        });
}

function renderMasters(masters, serviceName, servicePrice, locationName, container, serviceId) {
    container.innerHTML = '';

    console.log(`renderMasters called with serviceId: ${serviceId}`); // Добавляем отладочный вывод

    masters.forEach(master => {
        console.log(`Master ID: ${master.id}, Services:`, master.services); // Добавляем отладочный вывод
        // Проверяем, есть ли услуга с нужным ID в списке услуг мастера
        const service = master.services.find(s => s.id == serviceId);

        if (service) {
            console.log(`Found service ${serviceId} for master ${master.id}`); // Добавляем отладочный вывод
            const masterElement = document.createElement('div');
            masterElement.classList.add('master');
            masterElement.classList.add('master-js');

            const masterName = `${master.surname} ${master.name} ${master.patronymic}`.trim();

            masterElement.innerHTML = `
                <div class="master-name-js">${masterName}</div>
                <div class="master-specialty-js">${master.phone}</div>

            `;

            masterElement.onclick = () => handleMasterSelect(
                masterElement,
                master.id,
                serviceName,
                servicePrice,
                locationName,
                serviceId
            );

            container.appendChild(masterElement);
        } else {
            console.log(`No service ${serviceId} found for master ${master.id}`); // Добавляем отладочный вывод
        }
    });
}

function handleMasterSelect(element, masterId, serviceName, servicePrice, locationName, serviceId) {
    // Удаляем класс selected у всех элементов
    document.querySelectorAll('.master-js').forEach(m => {
        m.classList.remove('selected');
    });

    // Добавляем класс selected к выбранному элементу
    element.classList.add('selected');

    // Переходим на страницу подтверждения
    showFifthPage(serviceName, servicePrice, locationName, masterId, serviceId);
}


async function showFifthPage(serviceName, servicePrice, locationName, masterId, serviceId) {
    const content = document.getElementById('dialog-content');

    // Пример данных: даты и доступное время для каждой даты
    const availableSlots = {
        '2025-05-18': ['09:00', '11:00', '14:00', '16:00'],
        '2025-05-20': ['10:00', '12:00', '15:00', '17:00']
    };

    const availableDates = Object.keys(availableSlots);

    try {
        const response = await fetch(`http://82.202.142.17:8000/master/id/${masterId}`);
        const data = await response.json();

        if (data && data.ok && data.master) {
            const masterName = data.master.name;
            const masterSurname = data.master.surname;
            const masterFullName = `${masterSurname} ${masterName}`;

            content.innerHTML = `
                <div class="dialog-container">
                    <h3 class="dialog-title">Выберите время и дату для услуги: <span>${serviceName}</span></h3>
                    <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
                    <p class="location-info">Адрес: <span>${locationName}</span></p>
                    <p class="location-info">Мастер: <span>${masterFullName}</span></p>

                    <div class="form-group">
                        <label>Выберите дату:</label>
                        <select class="popup-input" id="appointment-date" onchange="updateAvailableTimes()">
                            <option value="">-- Выберите дату --</option>
                            ${availableDates.map(date => `
                                <option value="${date}">${formatDate(date)}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Выберите время:</label>
                        <select class="popup-input" id="appointment-time" disabled>
                            <option value="">-- Сначала выберите дату --</option>
                        </select>
                    </div>

                    <div class="popup-buttons">
                        <button onclick="saveDateTimeAndShowSixthPage('${serviceName}', ${servicePrice}, '${locationName}', ${masterId}, ${serviceId})">Далее</button>
                        <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}')">Назад</button>
                    </div>
                </div>
            `;

            // Добавляем availableSlots в глобальную область видимости для использования в updateAvailableTimes
            window.availableSlots = availableSlots;
        } else {
            content.innerHTML = `
                <div class="dialog-container">
                    <h3 class="dialog-title">Выберите время и дату для услуги: <span>${serviceName}</span></h3>
                    <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
                    <p class="location-info">Адрес: <span>${locationName}</span></p>
                    <p class="location-info">Мастер: <span>${masterFullName}</span></p>

                    <div class="form-group">
                        <label>Выберите дату:</label>
                        <input type="date" class="popup-input" id="appointment-date">
                    </div>
                    <div class="form-group">
                        <label>Выберите время:</label>
                        <input type="time" class="popup-input" id="appointment-time">
                    </div>

                    <div class="popup-buttons">
                        <button onclick="saveDateTimeAndShowSixthPage('${serviceName}', ${servicePrice}, '${locationName}', ${masterId}, ${serviceId})">Далее</button>
                        <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}')">Назад</button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка получения информации о мастере:', error);
        content.innerHTML = `
            <div class="dialog-container">
                <h3 class="dialog-title">Ошибка загрузки данных</h3>
                <p>Пожалуйста, попробуйте позже</p>
                <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}')">Назад</button>
            </div>
        `;
    }
}

function updateAvailableTimes() {
    const dateSelect = document.getElementById('appointment-date');
    const timeSelect = document.getElementById('appointment-time');
    const selectedDate = dateSelect.value;

    timeSelect.innerHTML = '';
    timeSelect.disabled = !selectedDate;

    if (selectedDate && window.availableSlots[selectedDate]) {
        window.availableSlots[selectedDate].forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    } else if (selectedDate) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Нет доступного времени';
        timeSelect.appendChild(option);
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Сначала выберите дату --';
        timeSelect.appendChild(option);
    }
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function saveDateTimeAndShowSixthPage(serviceName, servicePrice, locationName, masterId, serviceId) {
    const dateInput = document.getElementById('appointment-date');
    const timeInput = document.getElementById('appointment-time');

    if (!dateInput.value || !timeInput.value) {
        alert('Пожалуйста, выберите дату и время');
        return;
    }

    showSixthPage(serviceName, servicePrice, locationName, masterId, dateInput.value, timeInput.value, serviceId);
}

async function showSixthPage(serviceName, servicePrice, locationName, masterId, selectedDate, selectedTime, serviceId) {
    const content = document.getElementById('dialog-content');

    try {
        const response = await fetch(`http://82.202.142.17:8000/master/id/${masterId}`);
        const data = await response.json();

        if (data && data.ok && data.master) {
            const masterName = data.master.name;
            const masterSurname = data.master.surname;
            const masterFullName = `${masterSurname} ${masterName}`;

            content.innerHTML = `
                <div class="dialog-container">
                    <h3 class="dialog-title">Укажите ваши данные для услуги: <span>${serviceName}</span></h3>
                    <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
                    <p class="location-info">Локация: <span>${locationName}</span></p>
                    <p class="location-info">Мастер: <span>${masterFullName}</span></p>
                    <p class="location-info">Дата и время: <span>${selectedDate}</span>, <span>${selectedTime}</span></p>

                    <div class="input-list">
                        <div class="input-field">
                            <label for="lastName">Фамилия*</label>
                            <input type="text" id="lastName" placeholder="Иванов" required>
                        </div>
                        <div class="input-field">
                            <label for="firstName">Имя*</label>
                            <input type="text" id="firstName" placeholder="Иван" required>
                        </div>
                        <div class="input-field">
                            <label for="middleName">Отчество</label>
                            <input type="text" id="middleName" placeholder="Иванович (необязательно)">
                        </div>
                        <div class="input-field">
                            <label for="phoneNumber">Номер телефона*</label>
                            <input type="tel" id="phoneNumber" placeholder="+7 (900) 123-45-67" required>
                        </div>
                    </div>

                    <div class="popup-buttons">
                        <button class="confirm-btn" onclick="confirmAppointment(${masterId}, '${serviceName}', ${servicePrice}, '${locationName}', '${selectedDate}', '${selectedTime}', '${serviceId}')">Подтвердить</button>
                        <button onclick="showFifthPage(&quot;${serviceName}&quot;, ${servicePrice}, &quot;${locationName}&quot;, ${masterId}, ${serviceId})">Назад</button>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="dialog-container">
                    <h3 class="dialog-title">Укажите ваши данные для услуги: <span>${serviceName}</span></h3>
                    <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
                    <p class="location-info">Локация: <span>${locationName}</span></p>
                    <p class="location-info">Мастер: <span>Информация о мастере не найдена</span></p>
                    <p class="location-info">Дата и время: <span>${selectedDate}</span>, <span>${selectedTime}</span></p>

                    <div class="input-list">
                        <div class="input-field">
                            <label for="lastName">Фамилия*</label>
                            <input type="text" id="lastName" placeholder="Иванов" required>
                        </div>
                        <div class="input-field">
                            <label for="firstName">Имя*</label>
                            <input type="text" id="firstName" placeholder="Иван" required>
                        </div>
                        <div class="input-field">
                            <label for="middleName">Отчество</label>
                            <input type="text" id="middleName" placeholder="Иванович (необязательно)">
                        </div>
                        <div class="input-field">
                            <label for="phoneNumber">Номер телефона*</label>
                            <input type="tel" id="phoneNumber" placeholder="+7 (900) 123-45-67" required>
                        </div>
                    </div>

                    <div class="popup-buttons">
                        <button class="confirm-btn" onclick="confirmAppointment(${masterId}, '${serviceName}', ${servicePrice}, '${locationName}', '${selectedDate}', '${selectedTime}', '${serviceId}')">Подтвердить</button>
                        <button onclick="showFifthPage(&quot;${serviceName}&quot;, ${servicePrice}, &quot;${locationName}&quot;, ${masterId}, ${serviceId})">Назад</button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка получения информации о мастере:', error);
        content.innerHTML = `
            <div class="dialog-container">
                <h3 class="dialog-title">Укажите ваши данные для услуги: <span>${serviceName}</span></h3>
                <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
                <p class="location-info">Локация: <span>${locationName}</span></p>
                <p class="location-info">Мастер: <span>Ошибка при загрузке информации о мастере</span></p>
                <p class="location-info">Дата и время: <span>${selectedDate}</span>, <span>${selectedTime}</span></p>

                <div class="input-list">
                    <div class="input-field">
                        <label for="lastName">Фамилия*</label>
                        <input type="text" id="lastName" placeholder="Иванов" required>
                    </div>
                    <div class="input-field">
                        <label for="firstName">Имя*</label>
                        <input type="text" id="firstName" placeholder="Иван" required>
                    </div>
                    <div class="input-field">
                        <label for="middleName">Отчество</label>
                        <input type="text" id="middleName" placeholder="Иванович (необязательно)">
                    </div>
                    <div class="input-field">
                        <label for="phoneNumber">Номер телефона*</label>
                        <input type="tel" id="phoneNumber" placeholder="+7 (900) 123-45-67" required>
                    </div>

                    <div class="popup-buttons">
                        <button class="confirm-btn" onclick="confirmAppointment(${masterId}, '${serviceName}', ${servicePrice}, '${locationName}', '${selectedDate}', '${selectedTime}', '${serviceId}')">Подтвердить</button>
                        <button onclick="showFifthPage(&quot;${serviceName}&quot;, ${servicePrice}, &quot;${locationName}&quot;, ${masterId}, ${serviceId})">Назад</button>
                    </div>
                </div>
            `;
        }
    }


function confirmAppointment(masterId, serviceName, servicePrice, locationName, selectedDate, selectedTime, serviceId) {
    const lastName = document.getElementById('lastName').value;
    const firstName = document.getElementById('firstName').value;
    const middleName = document.getElementById('middleName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    if (!lastName || !firstName || !phoneNumber) {
        alert('Пожалуйста, заполните все обязательные поля.');
        return;
    }

    if (!selectedDate || !selectedTime) {
        alert('Пожалуйста, выберите дату и время.');
        return;
    }

    const datetime = `${selectedDate} ${selectedTime}:00`;
    bookMaster(masterId, serviceName, servicePrice, locationName, datetime, lastName, firstName, middleName, phoneNumber, serviceId);
}

// Обновленная функция bookMaster с параметрами для данных клиента
function bookMaster(masterId, serviceName, servicePrice, locationName, datetime, lastName, firstName, middleName, phoneNumber, serviceId) {
    const url = 'http://82.202.142.17:8000/requests';
    const userId = 1; // !!!Заменить на реальный ID пользователя

    let locationId;
    switch (locationName) {
        case 'Центр города':
            locationId = 1;
            break;
        case 'Московская':
            locationId = 2;
            break;
        case 'Ленсовета':
            locationId = 3;
            break;
        default:
            locationId = -1;
            break;
    }

    const data = {
        master_id: masterId,
        service_id: serviceId,
        user_id: userId,
        datetime: datetime,
        last_name: lastName,
        first_name: firstName,
        patronymic: middleName,
        phone_number: phoneNumber,
        location: locationId
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Заявка успешно создана:', xhr.responseText);
            alert(`Вы записаны на ${serviceId} ${serviceName} в ${locationName} за ${servicePrice} ₽ в ${datetime}`);
            document.getElementById('pop-up').close();
        } else {
            console.error('Ошибка при создании заявки:', xhr.status, xhr.statusText);
            alert(`Ошибка при создании заявки: ${xhr.status} ${xhr.statusText}`);
        }
    };

    xhr.onerror = function() {
        console.error('Ошибка сети при создании заявки.');
        alert('Ошибка сети при создании заявки.');
    };

    xhr.send(JSON.stringify(data));
}


//
////Для обработки всех данных из ЛК мастера
//document.querySelector('save-information').addEventListener('click', function(e) {
//    alert("dsh")
//    e.preventDefault();
//
//    const form = document.querySelector('.lk-form');
//    const formData = new FormData(form);
//
//    let output = "Данные мастера:\n\n";
//    const fieldLabels = {
//        'last_name': 'Фамилия',
//        'first_name': 'Имя',
//        'middle_name': 'Отчество',
//        'birth_date': 'Дата рождения',
//        'address': 'Адрес',
//        'email': 'E-mail',
//        'phone': 'Телефон',
//        'photo': 'Фото'
//    };
//
//    for (let [key, value] of formData.entries()) {
//        if (key === 'photo' && value instanceof File) {
//            output += `${fieldLabels[key] || key}: ${value.name || 'файл выбран'}\n`;
//        } else {
//            output += `${fieldLabels[key] || key}: ${value || 'не указано'}\n`;
//        }
//    }
//
//    alert(output);
//    // form.submit(); // Раскомментировать для реальной отправки
//});
