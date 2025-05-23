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
});

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
                     <button onclick="showPopUpForRequest()" class="btn">Записаться</button>
                     //onclick=showPopUpForRequest() onclick="showPopUpForRequest();"
//                    <button onclick="bookService('${service.name}')" class="btn">Записаться</button>
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

function updateCarousel() {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

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
function showDialog(serviceName, servicePrice) {
    const dialog = document.getElementById('pop-up');
    showFirstPage(serviceName, servicePrice);
    dialog.showModal();
}

function showFirstPage(serviceName, servicePrice) {
    const content = document.getElementById('dialog-content');
    content.innerHTML = `
        <div class="popup-content">
            <h3>Запись на услугу</h3>
            <p>Услуга: <span>${serviceName}</span></p>
            <p>Цена: <span>${servicePrice}</span> ₽</p>
            <div class="popup-buttons">
                <button onclick="showSecondPage('${serviceName}', '${servicePrice}')">Записаться</button>
                <button onclick="document.getElementById('pop-up').close()">Закрыть</button>
            </div>
        </div>
    `;
}

function showSecondPage(serviceName, servicePrice) {
    const content = document.getElementById('dialog-content');
    content.innerHTML = `
        <div class="dialog-container">
            <h3 class="dialog-title">Выберите адрес для услуги: <span id="selected-service-name">${serviceName}</span></h3>
            <p class="service-price-info">Стоимость: <span id="selected-service-price">${servicePrice}</span> ₽</p>
            <div class="location-list">
                <div class="location" onclick="selectLocation(this, 'Центр города')">
                    <div class="location-name">Салон VogueStyle в Центре города</div>
                    <div class="location-address">ул. Большая Морская 67, Санкт-Петербург</div>
                </div>

                <div class="location" onclick="selectLocation(this, 'Московская')">
                    <div class="location-name">Салон VogueStyle на Московской</div>
                    <div class="location-address">Гастелло ул. 15, Санкт-Петербург</div>
                </div>

                <div class="location" onclick="selectLocation(this, 'Ленсовета')">
                    <div class="location-name">Салон VogueStyle на Московской</div>
                    <div class="location-address">Ленсовета ул. 14, Санкт-Петербург</div>
                </div>
            </div>
            <div class="popup-buttons">
                <button onclick="showThirdPage('${serviceName}', '${servicePrice}')">Далее</button>
                <button onclick="showFirstPage('${serviceName}', '${servicePrice}')">Назад</button>
            </div>
        </div>
    `;
}


function selectLocation(element, locationName) {
    document.querySelectorAll('.location').forEach(loc => {
        loc.classList.remove('selected');
    });
    element.classList.add('selected');
}

// Третья страница диалога (подтверждение записи)
function showThirdPage(serviceName, servicePrice) {
    const content = document.getElementById('dialog-content');
        content.innerHTML = `
            <div class="popup-content">
                <h3>Подтверждение записи</h3>
                <p>Услуга: ${serviceName}</p>
                <p>Цена: ${servicePrice} ₽</p>

                <div class="form-group">
                    <label>Выберите дату:</label>
                    <input type="date" class="popup-input">
                </div>
                <div class="form-group">
                    <label>Выберите время:</label>
                    <input type="time" class="popup-input">
                </div>

                <div class="popup-buttons">
                    <button onclick="confirmAppointment('${serviceName}', '${servicePrice}')">Подтвердить</button>
                    <button onclick="showSecondPage('${serviceName}', '${servicePrice}')">Назад</button>
                </div>
            </div>
        `;
}
function confirmAppointment(serviceName, servicePrice) {
    alert("Запись подтверждена!");
    document.getElementById('pop-up').close();
}
