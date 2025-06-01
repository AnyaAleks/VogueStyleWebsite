from contextlib import nullcontext
from venv import logger

import flask, os, mysql.connector as mysql
from flask import request, jsonify, render_template, redirect, url_for, abort, make_response
import requests

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from dotenv import (
    load_dotenv,
)  # Import the load_dotenv function from the python-dotenv library to load environment variables from my .env file
from datetime import (
    datetime,
)  # this was for the bottom of the home page to alwasy be configured to display the current year

load_dotenv()

app = flask.Flask(__name__)

app.config["DEBUG"] = True
shortcut = "/api/v1/resources"

# UPDATED Database config for swapping from mySQL to PostgreSQL
DATABASE_URL = os.getenv("http://82.202.142.17:8000")
# connection_pool = None

###########################################################

#Можно загрузить сайт со стороны master или client
_master = "master"
_client = "client"
_siteVersion = _master
current_version = 'master'

@app.context_processor
def inject_site_version():
    return dict(site_version=_siteVersion)

# Конфигурация версий
VERSION_CONFIG = {
    'master': {
        'url_prefix': '/master',
        'show_lk': True
    },
    'client': {
        'url_prefix': '/client',
        'show_lk': False
    }
}

# Функция для смены версии
def set_version(version):
    global _siteVersion
    if version in VERSION_CONFIG:
        _siteVersion = version

# Контекстный процессор
@app.context_processor
def inject_version():
    return {
        'show_personal_account': VERSION_CONFIG[_siteVersion]['show_lk'],
        'url_prefix': VERSION_CONFIG[_siteVersion]['url_prefix']
    }
########################################################

# apparently these dont work so well with vercel, so taking them out for now
"""def get_connection_pool():
    global connection_pool
    if connection_pool is None:
        connection_pool = psycopg2.pool.SimpleConnectionPool(1, 20, DATABASE_URL)
    return connection_pool'
"""


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn


# was advised to remove this too for simpler and more direct connections
''''
def return_db_connection(conn):
    """Return connection to the pool"""
    pool = get_connection_pool()
    pool.putconn(conn)
'''


# our route for the home page (accessible via HTTP GET requests)
@app.route("/", methods=["GET"])
@app.route("/master/", methods=["GET"])
@app.route("/client/", methods=["GET"])
def home():
    if request.path.startswith('/master'):
        set_version('master')
    elif request.path.startswith('/client'):
        set_version('client')
    else:
        # Перенаправляем на версию по умолчанию
        return redirect('/client/')
    try:
        api_url_masters = "http://82.202.142.17:8000/master"
        all_masters = requests.get(api_url_masters).json()
        #print("all_masters", all_masters)

        api_url_services = "http://82.202.142.17:8000/services"
        all_services = requests.get(api_url_services).json()
        services_list = all_services['services']
        #print("services_list:  ", services_list)


        test_services = [
            {"id": 1, "name": "Тестовый маникюр", "price": 1500},
            {"id": 2, "name": "Пробная стрижка", "price": 2000},
            {"id": 3, "name": "Демо-окрашивание", "price": 2500}
        ]

        test_masters = [
            {
                "id": 1,
                "photo": "vogue_1.jpg",
                "name": "Иван Иванов",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 2,
                "photo": "vogue_2.jpg",

                "name": "Мария Петрова",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 3,
                "photo": "vogue_3.jpg",
                "name": "Алексей Смирнов",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 4,
                "photo": "vogue_1.jpg",
                "name": "Иван Иванов",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 5,
                "photo": "vogue_2.jpg",

                "name": "Мария Петрова",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 6,
                "photo": "vogue_3.jpg",
                "name": "Алексей Смирнов",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 7,
                "photo": "vogue_1.jpg",
                "name": "Иван Иванов",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 8,
                "photo": "vogue_2.jpg",

                "name": "Мария Петрова",
                'specialization': 'Парикмахер-стилист'
            },
            {
                "id": 9,
                "photo": "vogue_3.jpg",
                "name": "Алексей Смирнов",
                'specialization': 'Парикмахер-стилист'
            }
        ]


        # try:
    #     # Create a database connection
    #     conn = get_db_connection()
    #     cursor = conn.cursor()
    #
    #     # Execute a SQL query to fetch all services and their prices
    #     cursor.execute(
    #         """
    #         SELECT s.id, s.name as service, p.price
    #         FROM services s
    #         JOIN prices p ON s.id = p.service_id
    #     """
    #     )
    #     # Fetch all rows from the query result
    #     services = cursor.fetchall()
    #
    #     # Close the cursor and database connection
    #     cursor.close()
    #     conn.close()
    #
    #     current_year = datetime.now().year
    #
    #     # Render the index.html template and pass the services data to it

        return render_template("index.html", services=services_list, masters=all_masters)

    except Exception as e:
        # If an error occurs, render the error.html template and pass the error message
        return render_template("error.html", error=str(e))

# @app.route("/request", methods=["GET"])
# @app.route("/master/request", methods=["GET"])
# @app.route("/client/request",  methods=["GET"])
# def request():
#     try:
#
#         return render_template("error.html")
#     except Exception as e:
#         return #render_template("error.html", error=str(e))


# API route to fetch all services -- yeah we get the accessibility -_-
@app.route(shortcut + "/services/all", methods=["GET"])
def api_all():
    """API endpoint to get all services"""
    try:
        # Create a database connection
        conn = get_db_connection()
        # Create a cursor to execute SQL queries
        cursor = conn.cursor()

        # Execute a SQL query to fetch all services
        cursor.execute("SELECT * FROM services")
        # Fetch all rows from the query result
        services = cursor.fetchall()

        # Close the cursor and database connection
        cursor.close()
        conn.close()

        # Return the services data as a JSON response
        return jsonify(services)
    except Exception as e:
        # If an error occurs, return a JSON response with the error message and a 500 status code
        return jsonify({"error": str(e)}), 500


# API route to fetch a specific service by ID (may not use this on the frontend)
@app.route(shortcut + "/serv_prices", methods=["GET"])
@app.route(shortcut + "/services", methods=["GET"])
def api_id():
    """API endpoint to get a service by ID"""
    # Check if the 'id' parameter is provided in the request URL
    if "id" in request.args:
        id = int(request.args["id"])
    else:
        # If 'id' is not provided, return an error message and a 400 status code
        return jsonify({"error": "No id field provided. Please specify an id."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services WHERE id = %s", (id,))

        # Fetch one row from the query result
        service = cursor.fetchone()

        # Close the cursor and return thee database connection
        cursor.close()
        conn.close()

        # If a service is found, return it as a JSON response
        if service:
            return jsonify(service)
        else:
            # If no service is found, return an error message and a 404 status code
            return jsonify({"error": "Service not found"}), 404
    except Exception as e:
        # If an error occurs, return a JSON response with the error message and a 500 status code
        return jsonify({"error": str(e)}), 500


# Web route to view all services in the browser
@app.route("/masters", methods=["GET"])
@app.route("/master/masters", methods=["GET"])
@app.route("/client/masters",  methods=["GET"])
def view_masters():
    try:
        # Получаем данные мастеров с сервера
        api_url_masters = "http://82.202.142.17:8000/master"
        masters_list = requests.get(api_url_masters).json()
        print("masters_list", masters_list)

        # api_url_masters = "http://82.202.142.17:8000/master"
        # all_masters = requests.get(api_url_masters).json()
        # masters_list = all_masters['masters']

        masters_add = [
            {
                "id": 1,
                "photo": "vogue_1.jpg",
                "name": "Иванова Анна",
                "job": "Топ-стилист, колорист",
                "specialization": "Окрашивание, уход за волосами",
                "experience": 8,
                "education": "Высшее образование: Московский институт красоты. Курсы повышения квалификации в Лондоне и Милане.",
                "certificates": [
                    "Сертификат L'Oréal Professionnel",
                    "Диплом Wella Professionals",
                    "Мастер-класс Tony&Guy"
                ],
                "services": [
                    "Сложное окрашивание",
                    "Кератиновое восстановление",
                    "Авторские стрижки"
                ]
            },
            {
                "id": 2,
                "photo": "vogue_2.jpg",
                "name": "Петров Сергей",
                "job": "Барбер-стилист",
                "specialization": "Мужские стрижки, бороды",
                "experience": 5,
                "education": "Школа барберов «OldBoy». Мастер-классы в Берлине и Варшаве.",
                "certificates": [
                    "Сертификат BarberPro",
                    "Диплом Schorem Academy",
                    "Курс «Современные техники бритья»"
                ],
                "services": [
                    "Классическая стрижка",
                    "Королевское бритье",
                    "Уход за бородой",
                    "Оформление усов"
                ]
            },
            {
                "id": 3,
                "photo": "vogue_3.jpg",
                "name": "Смирнова Екатерина",
                "job": "Визажист-стилист",
                "specialization": "Вечерний и свадебный макияж",
                "experience": 6,
                "education": "Академия визажа MakeUpAtelier. Стажировка в Париже у Christophe Danchaud.",
                "certificates": [
                    "Сертификат MAC Pro",
                    "Диплом по airbrush макияжу",
                    "Курс «Свадебный макияж»"
                ],
                "services": [
                    "Свадебный макияж",
                    "Вечерний макияж",
                    "Smoky eyes",
                    "Контурная пластика"
                ]
            }
        ]

    # try:
    #     conn = get_db_connection()
    #     cursor = conn.cursor()
    #
    #     # Execute a SQL query to fetch all services and their prices
    #     cursor.execute(
    #         """
    #         SELECT s.id, s.name as service, p.price
    #         FROM services s
    #         JOIN prices p ON s.id = p.service_id
    #     """
    #     )
    #     # Fetch all rows from the query result
    #     services = cursor.fetchall()
    #
    #     cursor.close()
    #     conn.close()
    #
        return render_template("masters.html", masters=masters_list)
    except Exception as e:
        return render_template("error.html", error=str(e))

@app.route("/about", methods=["GET"])
@app.route("/master/about", methods=["GET"])
@app.route("/client/about",  methods=["GET"])
def view_about():
    try:
        return render_template("about.html")
    except Exception as e:
        return render_template("error.html", error=str(e))


# @app.route("/personal_account_master", methods=["GET", "POST"])
# @app.route("/master/personal_account_master", methods=["GET", "POST"])
# def personal_account_master():
#     """Личный кабинет мастера с аутентификацией из БД"""
#     try:
#         master_data = {
#             "id": 1,
#             "last_name": "Иванов",
#             "first_name": "Иван",
#             "middle_name": "Иванович",
#             "birth_date": "1990-01-01",
#             "address": "г. Москва, ул. Примерная, д. 1",
#             "email": "ivanov@example.com",
#             "phone": "+79991234567",
#             "photo": "/media/photos/master1.jpg",
#             "login": "1234",  # Ожидаемый логин
#             "master_password": "1234"  # Ожидаемый пароль (в реальном проекте используйте хеш!)
#         }
#
#         if _siteVersion == _master:
#             if request.method == "POST":
#                 username = request.form.get("username", "").strip()
#                 password = request.form.get("password", "").strip()
#                 print(f"Введено: '{username}' (ожидаем '1234'), '{password}' (ожидаем '1234')")  # Отладочный вывод
#
#                 if username == master_data["login"] and password == master_data["master_password"]:
#                     return render_template("personal_account_master.html", master=master_data)
#                 else:
#                     return render_template("LK_enter.html", error="Неверный логин или пароль")
#
#             return render_template("LK_enter.html")
#         else:
#             abort(403)  # Доступ запрещён
#
#     except Exception as e:
#         return render_template("error.html", error=str(e)), 500


@app.route("/personal_account_master", methods=["GET", "POST"])
@app.route("/master/personal_account_master", methods=["GET", "POST"])
def personal_account_master():
    try:
        if _siteVersion != _master:
            abort(403)

        if request.method == "POST":
            phone = request.form.get("phone", "").strip()
            password = request.form.get("password", "").strip()

            if not phone or not password:
                return render_template("LK_enter.html", error="Заполните все поля")

            try:
                # 1. Проверяем учетные данные
                check_url = "http://82.202.142.17:8000/master/check"
                payload = {
                    "phoneemail": phone,
                    "password": password
                }

                headers = {
                    "accept": "application/json",
                    "Content-Type": "application/json"
                }

                response = requests.post(check_url, json=payload, headers=headers, timeout=5)
                response.raise_for_status()
                auth_result = response.json()

                if not auth_result.get("verified", False):
                    return render_template("LK_enter.html",
                                           error=auth_result.get("message", "Неверные учетные данные"))

                # 2. Если проверка успешна, получаем данные мастера с id=3
                get_master_url = "http://82.202.142.17:8000/master"

                # Отправляем GET-запрос для получения всех мастеров
                response = requests.get(get_master_url, headers=headers, timeout=5)
                response.raise_for_status()
                masters_data = response.json()

                # Находим мастера с id=3
                master_data = next((m for m in masters_data if m.get("id") == 3), None)

                if not master_data:
                    return render_template("LK_enter.html", error="Данные мастера не найдены")

                return render_template("personal_account_master.html", master=master_data)

            except requests.ConnectionError:
                return render_template("LK_enter.html", error="Ошибка соединения с сервером")
            except requests.Timeout:
                return render_template("LK_enter.html", error="Сервер не отвечает")
            except requests.HTTPError as e:
                if e.response.status_code == 404:
                    return render_template("LK_enter.html", error="Сервис временно недоступен")
                return render_template("LK_enter.html", error=f"Ошибка сервера: {str(e)}")
            except Exception as e:
                return render_template("LK_enter.html", error=f"Произошла ошибка: {str(e)}")

        # GET-запрос - показываем форму входа
        return render_template("LK_enter.html")

    except Exception as e:
        return render_template("error.html", error=str(e)), 500

@app.route("/salons/bm", methods=["GET"])
@app.route("/master/salons/bm", methods=["GET"])
@app.route("/client/salons/bm",  methods=["GET"])
def salon_bm():
    try:

        return render_template("salon_bm.html")
    except Exception as e:
        return render_template("error.html", error=str(e))

@app.route("/salons/gasta", methods=["GET"])
@app.route("/master/salons/gasta", methods=["GET"])
@app.route("/client/salons/gasta",  methods=["GET"])
def salon_gasta():
    try:

        return render_template("salon_gasta.html")
    except Exception as e:
        return render_template("error.html", error=str(e))

@app.route("/salons/lensa", methods=["GET"])
@app.route("/master/salons/lensa", methods=["GET"])
@app.route("/client/salons/lensa",  methods=["GET"])
def salon_lensa():
    try:

        return render_template("salon_lensa.html")
    except Exception as e:
        return render_template("error.html", error=str(e))


# # API route to fetch all prices
# @app.route(shortcut + "/prices/all", methods=["GET"])
# def all_prices():
#     """API endpoint to get all prices"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         cursor.execute("SELECT * FROM prices")
#         prices = cursor.fetchall()
#
#         cursor.close()
#         conn.close()
#
#         # Return the prices data as a JSON response
#         return jsonify(prices)
#     except Exception as e:
#         # If an error occurs, return a JSON response with the error message and a 500 status code
#         return jsonify({"error": str(e)}), 500
#
#
# # API route to fetch the price of a specific service by service ID (may not use this on the frontend)
# @app.route(shortcut + "/serv_prices", methods=["GET"])
# def price_id():
#     """API endpoint to get a price by service ID"""
#     if "id" in request.args:
#         id = int(request.args["id"])
#     else:
#         return jsonify({"error": "No id field provided. Please specify an id."}), 400
#
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("SELECT * FROM prices WHERE service_id = %s", (id,))
#         price = cursor.fetchone()
#         cursor.close()
#         conn.close()
#
#         if price:
#             return jsonify(price)
#         else:
#             return jsonify({"error": "Price not found"}), 404
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#
#
# # API route to fetch the most expensive service
# @app.route(shortcut + "/expensiveservice", methods=["GET"])
# def high_serv():
#     """API endpoint to get the most expensive service"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Execute a SQL query to fetch the most expensive service where we expectonly one result, thu LIMIT = 1
#         cursor.execute(
#             """
#             SELECT s.id, s.name as service, p.price
#             FROM services s
#             JOIN prices p ON s.id = p.service_id
#             ORDER BY p.price DESC
#             LIMIT 1
#         """
#         )
#         service = cursor.fetchone()
#         cursor.close()
#         conn.close()
#
#         if service:  # is found
#             return jsonify(service)
#         else:
#             return jsonify({"error": "No services found"}), 404
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#
#
# # API route to fetch the least expensive service
# @app.route(shortcut + "/cheapestservice", methods=["GET"])
# def low_serv():
#     """API endpoint to get the least expensive service"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Execute a SQL query to fetch the least expensive service
#         cursor.execute(
#             """
#             SELECT s.id, s.name as service, p.price
#             FROM services s
#             JOIN prices p ON s.id = p.service_id
#             ORDER BY p.price ASC
#             LIMIT 1
#         """
#         )
#         # Fetch one row from the query result
#         service = cursor.fetchone()
#
#         cursor.close()
#         conn.close()
#
#         # If a service is found, return it as a JSON response
#         if service:
#             return jsonify(service)
#         else:
#             return jsonify({"error": "No services found"}), 404
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#
#
# # API route to sort services alphabetically
# @app.route(shortcut + "/services/sort", methods=["GET"])
# def sort_serv():
#     """API endpoint to sort services alphabetically"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Execute a SQL query to fetch services sorted by name in ascending order
#         cursor.execute(
#             """
#             SELECT s.id, s.name as service, p.price
#             FROM services s
#             JOIN prices p ON s.id = p.service_id
#             ORDER BY s.name ASC
#         """
#         )
#         # Fetch all rows from the query result
#         services = cursor.fetchall()
#
#         cursor.close()
#         conn.close()
#
#         return jsonify(services)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#
#
# # API route to sort services by price
# @app.route(shortcut + "/prices/sort", methods=["GET"])
# def sort_price():
#     """API endpoint to sort services by price"""
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Execute a SQL query to fetch services sorted by price in ascending order
#         cursor.execute(
#             """
#             SELECT s.id, s.name as service, p.price
#             FROM services s
#             JOIN prices p ON s.id = p.service_id
#             ORDER BY p.price ASC
#         """
#         )
#         # Fetch all rows from the query result
#         services = cursor.fetchall()
#
#         cursor.close()
#         conn.close()
#
#         # Return the sorted services data as a JSON response
#         return jsonify(services)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route("/test_api")
def test_api():
    try:
        response = requests.get("http://172.16.0.10:8000/docs")
        print("Response status code:", response.status_code)
        print("Response headers:", response.headers)

        # Пробуем получить JSON, если API возвращает JSON
        try:
            json_data = response.json()
            print("JSON response:", json_data)
            return jsonify({
                "status": "success",
                "status_code": response.status_code,
                "data": json_data
            })
        except ValueError:
            # Если ответ не JSON, возвращаем текст
            print("Text response:", response.text)
            return jsonify({
                "status": "success",
                "status_code": response.status_code,
                "data": response.text
            })

    except requests.exceptions.RequestException as e:
        print("Request failed:", str(e))
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/location')
def location_page():
    service = request.args.get('service', 'Услуга')
    price = request.args.get('price', '0')
    return render_template('location.html', service=service, price=price)

# running it locally
# if __name__ == "__main__":
#    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

@app.route("/request", methods=["GET"])
@app.route("/master/request", methods=["GET"])
@app.route("/client/request",  methods=["GET"])
def master_request():
    try:
        masters_add_request = [
            {
                "id": 1,
                "photo": "vogue_1.jpg",
                "name": "Иванова Анна",
                "job": "Топ-стилист, колорист",
            },
            {
                "id": 2,
                "photo": "vogue_2.jpg",
                "name": "Петров Сергей",
                "job": "Барбер-стилист",
            },
            {
                "id": 3,
                "photo": "vogue_3.jpg",
                "name": "Смирнова Екатерина",
                "job": "Визажист-стилист",
            }
        ]


        test_services_add = [
            {"id": 1, "name": "Тестовый маникюр", "price": 1500},
            {"id": 2, "name": "Пробная стрижка", "price": 2000},
            {"id": 3, "name": "Демо-окрашивание", "price": 2500}
        ]

        return render_template('dialog_input.html')
    except Exception as e:
        return render_template("error.html", error=str(e))


@app.route("/", methods=["GET"])
def get_filtered_masters():
    try:
        service_name = request.args.get('service', '').lower()
        location_name = request.args.get('location', '')

        # Ваши данные мастеров (в реальном приложении это будет запрос к БД)
        masters_data = [
            {
                "id": 1,
                "photo": "vogue_1.jpg",
                "name": "Иванова Анна",
                "job": "Топ-стилист, колорист",
                "specialization": "окрашивание, уход за волосами",
                "available_locations": ["Центр города", "Московская"]
            },
            {
                "id": 2,
                "photo": "vogue_2.jpg",
                "name": "Петров Сергей",
                "job": "Барбер-стилист",
                "specialization": "мужские стрижки, бороды",
                "available_locations": ["Ленсовета", "Московская"]
            }
        ]

        # Фильтрация
        filtered = []
        for master in masters_data:
            # Фильтр по услуге (если указана)
            if service_name and service_name not in master['specialization'].lower():
                continue

            # Фильтр по локации (если указана)
            if location_name and location_name not in master['available_locations']:
                continue

            filtered.append(master)

        return jsonify({
            "success": True,
            "masters": filtered,
            "count": len(filtered)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Произошла ошибка при загрузке мастеров"
        }), 500

app = app
