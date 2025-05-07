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
                    <button onclick="bookService('${service.name}')" class="btn">Записаться</button>
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

document.getElementById('delete-photo').addEventListener('click', function() {
    if (confirm('Удалить фото?')) {
        fetch('/delete-photo/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': '{{ csrf_token }}',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({master_id: {{ master.id }}})
        })
        .then(response => location.reload())
    }
});

document.getElementById('photo-upload').addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        document.querySelector('.lk-form').submit();
    }
});
