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
                console.log("Service object:", service); // Добавлено
                if (service) {
                    servicesHTML += `
                         <div class="location" onclick="${`showFirstPage('${service.name}', '${service.price}', '${service.id}')`}">
                            <div class="location-name">${service.name}</div>
                            <div class="location-address">Цена: ${service.price} ₽</div>
                        </div>
                    `;
                } else {
                    console.warn("Обнаружен неверный объект service:", service);
                }
            });
            console.log();
            serviceListContainer.innerHTML = servicesHTML;
        } else {
            serviceListContainer.innerHTML = '<div class="location-name">Ошибка загрузки услуг.</div>';
        }
    } catch (error) {
        console.error('Ошибка получения списка услуг:', error);
        serviceListContainer.innerHTML = '<div class="location-name">Ошибка при загрузке списка услуг.</div>';
    }
}

function showFirstPage(serviceName, servicePrice, serviceId) {
    console.log("showFirstPage вызвана с аргументами:", serviceName, servicePrice, serviceId);
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

  // Функция для получения местоположений с API
  function fetchLocations() {
    fetch('http://82.202.142.17:8000/locations')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(locations => {
        // После получения данных о местоположениях, отображаем их
        displayLocations(locations);
      })
      .catch(error => {
        console.error('Ошибка при получении данных о местоположениях:', error);
        content.innerHTML = `<p>Ошибка при загрузке данных о местоположениях. Пожалуйста, попробуйте позже.</p>`;
      });
  }

  // Функция для отображения местоположений
  function displayLocations(locations) {
    let locationListHTML = '';

    locations.forEach(location => {
      locationListHTML += `
        <div class="location" onclick="handleLocationSelect(this, '${serviceName}', ${servicePrice}, '${location.name}', '${serviceId}', '${location.id}')">
          <div class="location-name">${location.name}</div>
          <div class="location-address">${location.address}</div>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="dialog-container">
        <h3 class="dialog-title">Выберите адрес для услуги: <span>${serviceName}</span></h3>
        <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
        <div class="location-list">
          ${locationListHTML}
        </div>
        <div class="popup-buttons">
          <button onclick="showFirstPage('${serviceName}', ${servicePrice})">Назад</button>
        </div>
      </div>
    `;
  }

  // Вызываем функцию для получения местоположений
  fetchLocations();
}

function handleLocationSelect(element, serviceName, servicePrice, locationName, serviceId, locationId) {
    // Удаляем класс selected у всех элементов
    document.querySelectorAll('.location').forEach(loc => {
        loc.classList.remove('selected');
    });

    // Добавляем класс selected к выбранному элементу
    element.classList.add('selected');

    // Сразу переходим на третью страницу с выбранным адресом
    showThirdPage(serviceName, servicePrice, locationName, serviceId, locationId);
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

function showThirdPage(serviceName, servicePrice, locationName, serviceId, locationId) {
  console.log("Функция showThirdPage вызвана", serviceName, servicePrice, locationName, serviceId);

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

  // Получаем ID локации из API по locationName
  function fetchLocationIdByName(locationName) {
    return fetch('http://82.202.142.17:8000/locations')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(locations => {
        const location = locations.find(loc => loc.name === locationName);
        if (location) {
          return location.id;
        } else {
          throw new Error(`Location with name "${locationName}" not found.`);
        }
      });
  }

  // Получаем данные о мастерах и фильтруем их
  function fetchMasters(locationId, serviceId) {
    fetch('http://82.202.142.17:8000/master')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(masters => {
        console.log("All Masters:", masters);

        // Фильтруем мастеров по locationId и serviceId
        const filteredMasters = masters.filter(master => {
          console.log(`Фильтрация мастера ${master.name} ${master.surname}:`);
          console.log(`  locationId: ${locationId}, master.location_id: ${master.location_id}`);
          console.log(`  serviceId: ${serviceId}, Services:`, master.services);

          // Проверяем соответствие locationId
          const isCorrectLocation = master.location_id === locationId;

          // Проверяем, предоставляет ли мастер данную услугу
          const providesService = master.services.some(service => service.id === parseInt(serviceId)); // Приводим serviceId к числу

          console.log(`  isCorrectLocation: ${isCorrectLocation}, providesService: ${providesService}`);

          return isCorrectLocation && providesService;
        });

        console.log("Filtered Masters:", filteredMasters);

        spinner.style.display = 'none';

        if (filteredMasters.length > 0) {
          renderMasters(filteredMasters, serviceName, servicePrice, locationName, container, serviceId, locationId);
        } else {
          container.innerHTML = `
            <div class="no-masters">
              <i class="icon-warning"></i>
              <p>Нет доступных мастеров в ${locationName} для услуги ${serviceName}.</p>
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
            <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}', '${locationId}')">
              Попробовать снова
            </button>
          </div>
        `;
      });
  }

  // Вызываем функцию для получения locationId и затем получаем мастеров
  fetchLocationIdByName(locationName)
    .then(locationId => {
      console.log("Location ID:", locationId);
      fetchMasters(locationId, serviceId);
    })
    .catch(error => {
      spinner.style.display = 'none';
      console.error('Ошибка получения ID локации:', error);
      container.innerHTML = `
        <div class="error">
          <i class="icon-error"></i>
          <p>Ошибка получения ID локации. Пожалуйста, попробуйте позже.</p>
        </div>
      `;
    });
}

function renderMasters(masters, serviceName, servicePrice, locationName, container, serviceId, locationId) {
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
                serviceId,
                locationId
            );

            container.appendChild(masterElement);
        } else {
            console.log(`No service ${serviceId} found for master ${master.id}`); // Добавляем отладочный вывод
        }
    });
}

function handleMasterSelect(element, masterId, serviceName, servicePrice, locationName, serviceId, locationId) {
    // Удаляем класс selected у всех элементов
    document.querySelectorAll('.master-js').forEach(m => {
        m.classList.remove('selected');
    });

    // Добавляем класс selected к выбранному элементу
    element.classList.add('selected');

    // Переходим на страницу подтверждения
    showFifthPage(serviceName, servicePrice, locationName, masterId, serviceId, locationId);
}


async function showFifthPage(serviceName, servicePrice, locationName, masterId, serviceId, locationId) {
    const content = document.getElementById('dialog-content');

    try {
        const response = await fetch(`http://82.202.142.17:8000/master`);
        const data = await response.json();

        console.log("Данные, полученные от сервера (список мастеров):", data);

        const masters = data;

        // Ищем нужного мастера по ID
        const master = masters.find(m => m.id === masterId);

        if (master) {
            const masterName = master.name;
            const masterSurname = master.surname;
            const masterFullName = `${masterSurname} ${masterName}`;
            const availableSlots = master.available_slots;

            console.log("Найденный мастер:", master);
            console.log("availableSlots:", availableSlots);

            let availableDatesHTML = '';
            const today = new Date();
            const currentDayOfWeek = today.getDay()-1; // 0 - Sunday, 1 - Monday, ... 6 - Saturday
            const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

            console.log(`Текущая дата: ${today}, День недели (0-6): ${currentDayOfWeek}`);

            // Определяем дату понедельника текущей недели
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1)); // Вычисляем понедельник

            console.log(`Понедельник текущей недели: ${startOfWeek}`);

            // Генерация дат для текущей недели с фильтрацией
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startOfWeek);
                currentDate.setDate(startOfWeek.getDate() + i); // Добавляем дни, начиная с понедельника

                const dayOfWeek = currentDate.getDay(); // 0 - Sunday, 1 - Monday, 2 - Tuesday, ... 6 - Saturday
                const dayOfWeekString = String(dayOfWeek); // Преобразуем в строку для ключа availableSlots
                const formattedDate = formatDate(currentDate);
                const formattedDateWithWords = `${getDayName(dayOfWeek)}, ${currentDate.getDate()} ${getMonthName(currentDate.getMonth())}`;

                console.log(`
                    i: ${i},
                    currentDate: ${currentDate},
                    dayOfWeek: ${dayOfWeek},
                    dayOfWeekString: ${dayOfWeekString},
                    formattedDate: ${formattedDate},
                    formattedDateWithWords: ${formattedDateWithWords}
                `);

                // Проверяем, есть ли доступные слоты для этого дня недели и не прошла ли дата
                if (availableSlots && availableSlots[dayOfWeekString] && currentDate >= today) {
                    console.log(`Для дня недели ${dayOfWeekString} есть доступные слоты`);
                    availableDatesHTML += `
                        <option value="${formattedDate}">${formattedDateWithWords}</option>
                    `;
                } else {
                    console.log(`Для дня недели ${dayOfWeekString} НЕТ доступных слотов или дата прошла`);
                }
            }

            console.log("Сгенерированный HTML для дат:", availableDatesHTML);

            content.innerHTML = `
                <div class="dialog-container">
                    <h3 class="dialog-title">Выберите время и дату для услуги: <span>${serviceName}</span></h3>
                    <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
                    <p class="location-info">Адрес: <span>${locationName}</span></p>
                    <p class="location-info">Мастер: <span>${masterFullName}</span></p>

                    <div class="form-group">
                        <label>Выберите дату:</label>
                        <select class="popup-input" id="appointment-date" onchange="updateAvailableTimes('${masterId}')">
                            <option value="">Выберите дату</option>
                            ${availableDatesHTML}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Выберите время:</label>
                        <select class="popup-input" id="appointment-time" disabled>
                            <option value="">Выберите время</option>
                        </select>
                    </div>

                    <div class="popup-buttons">
                        <button onclick="saveDateTimeAndShowSixthPage('${serviceName}', ${servicePrice}, '${locationName}', ${masterId}, ${serviceId}, '${locationId}')">Далее</button>
                        <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}', '${locationId}')">Назад</button>
                    </div>
                </div>
            `;

            // Добавляем функцию для выбора времени
            window.updateAvailableTimes = function(masterId) {
                const selectedDate = document.getElementById('appointment-date').value;
                const selectedDayOfWeek = new Date(selectedDate).getDay(); // 0 - Sunday, 1 - Monday, ... 6 - Saturday
                const selectedDayOfWeekString = String(selectedDayOfWeek);

                const appointmentTimeSelect = document.getElementById('appointment-time');
                appointmentTimeSelect.disabled = false;
                appointmentTimeSelect.innerHTML = '<option value="">Выберите время</option>';

                if (availableSlots && availableSlots[selectedDayOfWeekString]) {
                    availableSlots[selectedDayOfWeekString].forEach(time => {
                        appointmentTimeSelect.innerHTML += `<option value="${selectedDate}T${time}">${time}</option>`;
                    });
                } else {
                    appointmentTimeSelect.innerHTML = '<option value="">Нет доступных слотов на этот день</option>';
                    appointmentTimeSelect.disabled = true;
                }
            }

             // Вызываем updateAvailableTimes для выбора времени по умолчанию (если есть выбранная дата)
            setTimeout(() => {
                const appointmentDateSelect = document.getElementById('appointment-date');
                if (appointmentDateSelect && appointmentDateSelect.value) { // Проверяем, есть ли выбранная дата
                   appointmentDateSelect.dispatchEvent(new Event('change'));
                }
            }, 0);


        } else {
            // Мастер с указанным ID не найден
            console.error(`Мастер с ID ${masterId} не найден`);
            content.innerHTML = `
                <div class="dialog-container">
                    <h3 class="dialog-title">Мастер не найден</h3>
                    <p>Пожалуйста, попробуйте позже</p>
                    <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}', '${locationId}')">Назад</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка получения информации о мастере:', error);
        content.innerHTML = `
            <div class="dialog-container">
                <h3 class="dialog-title">Ошибка загрузки данных</h3>
                <p>Пожалуйста, попробуйте позже</p>
                <button onclick="showThirdPage('${serviceName}', ${servicePrice}, '${locationName}', '${serviceId}', '${locationId}')">Назад</button>
            </div>
        `;
    }

    // Функция для форматирования даты в "YYYY-MM-DD"
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Функция для получения названия дня недели с названием месяца словом
    function formatDateWithWords(date) {
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const dayName = getDayName(date.getDay());
        return `${dayName}, ${day} ${month}`;
    }

    // Функция для получения названия дня недели по номеру
    function getDayName(dayOfWeek) {
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        return days[dayOfWeek];
    }

    function getMonthName(month) {
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        return months[month];
    }
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function saveDateTimeAndShowSixthPage(serviceName, servicePrice, locationName, masterId, serviceId, locationId) {
    const dateInput = document.getElementById('appointment-date');
    const timeInput = document.getElementById('appointment-time');

    if (!dateInput.value || !timeInput.value) {
        alert('Пожалуйста, выберите дату и время');
        return;
    }

    showSixthPage(serviceName, servicePrice, locationName, masterId, dateInput.value, timeInput.value, serviceId, locationId);
}

async function showSixthPage(serviceName, servicePrice, locationName, masterId, selectedDate, selectedTime, serviceId, locationId) {
    const content = document.getElementById('dialog-content');

    try {
        const response = await fetch(`http://82.202.142.17:8000/master/id/${masterId}`);
        const data = await response.json();

        if (data && data.ok && data.master) {
            const masterName = data.master.name;
            const masterSurname = data.master.surname;
            const masterFullName = `${masterSurname} ${masterName}`;

            // Отформатируйте дату и время *здесь*
            const formattedDateTime = formatDate(selectedDate, selectedTime);

            content.innerHTML = `
                <div class="dialog-container">
                    <h3 class="dialog-title">Укажите ваши данные для услуги: <span>${serviceName}</span></h3>
                    <p class="service-price-info">Стоимость: <span>${servicePrice}</span> ₽</p>
                    <p class="location-info">Локация: <span>${locationName}</span></p>
                    <p class="location-info">Мастер: <span>${masterFullName}</span></p>
                    <p class="location-info">Дата и время: <span>${formattedDateTime}</span></p>

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
                     <div class="input-field">
                        <label for="tg_link">Ссылка на телеграм</label>
                        <input type="tel" id="tg_link" required>
                    </div>
                    <div class="popup-buttons">
                        <button class="confirm-btn" onclick="confirmAppointment(${masterId}, '${serviceName}', ${servicePrice}, '${locationName}', '${selectedDate}', '${selectedTime}', '${serviceId}', '${locationId}')">Подтвердить</button>
                        <button onclick="showFifthPage(&quot;${serviceName}&quot;, ${servicePrice}, &quot;${locationName}&quot;, ${masterId}, ${serviceId}, '${locationId}')">Назад</button>
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
                    <div class="input-field">
                        <label for="tg_link">Ссылка на телеграм</label>
                        <input type="tel" id="tg_link" required>
                    </div>
                    <div class="popup-buttons">
                        <button class="confirm-btn" onclick="confirmAppointment(${masterId}, '${serviceName}', ${servicePrice}, '${locationName}', '${selectedDate}', '${selectedTime}', '${serviceId}', '${locationId}')">Подтвердить</button>
                        <button onclick="showFifthPage(&quot;${serviceName}&quot;, ${servicePrice}, &quot;${locationName}&quot;, ${masterId}, ${serviceId}, '${locationId}')">Назад</button>
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
                    <div class="input-field">
                        <label for="tg_link">Ссылка на телеграм</label>
                        <input type="tel" id="tg_link" required>
                    </div>
                    <div class="popup-buttons">
                        <button class="confirm-btn" onclick="confirmAppointment(${masterId}, '${serviceName}', ${servicePrice}, '${locationName}', '${selectedDate}', '${selectedTime}', '${serviceId}', '${locationId}')">Подтвердить</button>
                        <button onclick="showFifthPage(&quot;${serviceName}&quot;, ${servicePrice}, &quot;${locationName}&quot;, ${masterId}, ${serviceId}, '${locationId}')">Назад</button>
                    </div>
                </div>
            `;
        }
    }


function formatDate(selectedDate, selectedTime) {
  const date = new Date(selectedDate);
  const day = date.getDate(); //  Больше не нужно padStart, т.к. нет требования к двум цифрам
  const monthNames = ["январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
  ];
  const month = monthNames[date.getMonth()]; // Получаем название месяца

  const timeParts = selectedTime.split('T')[1].split(':');
  const hours = String(timeParts[0]).padStart(2, '0'); // Ведущий ноль для часов
  const minutes = String(timeParts[1]).padStart(2, '0'); // Ведущий ноль для минут

  const formattedDate = `${day} ${month} ${hours}:${minutes}`;
  return formattedDate;
}

function confirmAppointment(masterId, serviceName, servicePrice, locationName, selectedDate, selectedTime, serviceId, locationId) {
    const lastName = document.getElementById('lastName').value;
    const firstName = document.getElementById('firstName').value;
    const middleName = document.getElementById('middleName').value;
    const tg_link = document.getElementById('tg_link').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    // Проверка наличия элемента tg_link
    const tgLinkElement = document.getElementById('tg_link');
    if (!tgLinkElement) {
        console.error('Элемент tg_link не найден!');
        alert('Ошибка: Поле для ссылки на Telegram не найдено.');
        return;
    }

    console.log("Значения полей формы:");
    console.log("lastName:", lastName);
    console.log("firstName:", firstName);
    console.log("middleName:", middleName);
    console.log("tg_link:", tg_link); // Вот здесь проверьте!
    console.log("phoneNumber:", phoneNumber);


    if (!lastName || !firstName || !phoneNumber || !tg_link) {
        alert('Пожалуйста, заполните все обязательные поля.');
        return;
    }

    if (!selectedDate || !selectedTime) {
        alert('Пожалуйста, выберите дату и время.');
        return;
    }

    const datetime = `${selectedTime}:00`;
    bookMaster(masterId, serviceName, servicePrice, locationName, datetime, lastName, firstName, middleName, phoneNumber, serviceId, locationId, tg_link);
}

function bookMaster(masterId, serviceName, servicePrice, locationName, datetime, lastName, firstName, middleName, phoneNumber, serviceId, locationId, tg_link) {
    const requestsUrl = 'http://82.202.142.17:8000/requests';
    const getUserByPhoneUrl = `http://82.202.142.17:8000/user/phone/${phoneNumber}`;
    const createUserUrl = 'http://82.202.142.17:8000/user/';

    // Вспомогательная функция для отправки POST-запроса и получения данных
    async function postData(url, data) {
        console.log(`Отправка POST запроса на ${url} с данными:`, JSON.stringify(data));
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            console.log(`Ответ от ${url}:`, response);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Ошибка ответа API:', errorData);
                if (errorData.detail && Array.isArray(errorData.detail)) {
                    errorData.detail.forEach(err => {
                        console.error('Ошибка валидации:', err);
                        alert(`Ошибка валидации: ${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`);
                    });
                } else {
                    alert(`Ошибка при создании: ${errorData.message || 'Неизвестная ошибка'}`);
                }
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }
            const responseData = await response.json();
            console.log(`Успешный ответ от ${url}:`, responseData);
            return responseData;
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            alert(`Ошибка при отправке данных: ${error.message}`);
            throw error;
        }
    }
    async function bookAppointment(userId) {
        const datetime2 = datetime.slice(0, -3);
        const data = {
            master_id: masterId,
            service_id: serviceId,
            user_id: userId,
            schedule_at: datetime2
        };

        console.log("Данные для создания заявки:", JSON.stringify(data));

        try {
            const requestData = await postData(requestsUrl, data);
            alert(`Вы записаны на ${serviceName} в ${locationName} за ${servicePrice} ₽ на ${datetime}`);
            document.getElementById('pop-up').close();
            return requestData.user_id;
        } catch (error) {
            console.error('Ошибка при создании заявки:', error);
            return null;
        }
    }

    async function createUserAndBookAppointment() {
        const newUser = {
            name: firstName,
            surname: lastName,
            patronymic: middleName,
            birthday: "2000-06-01", // Замените на динамическую
            phone: phoneNumber
        };
        console.log("Данные для создания пользователя:", JSON.stringify(newUser));

        try {
            const createdUserData = await postData(createUserUrl, newUser);
            const userId = createdUserData.user_id;
            console.log("Пользователь создан:", userId);
            await bookAppointment(userId);
        } catch (error) {
            console.error('Ошибка при создании пользователя и записи:', error);
            alert(`Ошибка при создании пользователя и записи: ${error.message}`);
        }
    }

    function formatDateTime(datetime) {
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

    // 1. Получаем пользователя по номеру телефона
    fetch(getUserByPhoneUrl)
        .then(response => {
            console.log("Запрос на получение пользователя по телефону:", getUserByPhoneUrl);
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                return null;
            } else {
                throw new Error(`Ошибка при получении пользователя: ${response.status} ${response.statusText}`);
            }
        })
        .then(async userData => {
            if (userData && userData.user) {
                const userId = userData.user.id;
                console.log("Пользователь найден:", userData);
                await bookAppointment(userId);
            } else {
                console.log("Пользователь не найден. Создаем нового...");
                await createUserAndBookAppointment();
            }
        })
        .catch(error => {
            console.error('Общая ошибка:', error);
            alert(`Общая ошибка: ${error.message}`);
        });
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
