from contextlib import nullcontext

import flask, os, mysql.connector as mysql
from flask import request, jsonify, render_template, redirect, url_for

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
DATABASE_URL = os.getenv("DATABASE_URL")
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
    """This is the  connection to the PostgreSQL database hosted on Neon and managed on my local DBeaver"""
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
        return redirect('/master/')


    try:
        # Create a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute a SQL query to fetch all services and their prices
        cursor.execute(
            """
            SELECT s.id, s.name as service, p.price 
            FROM services s 
            JOIN prices p ON s.id = p.service_id
        """
        )
        # Fetch all rows from the query result
        services = cursor.fetchall()

        # Close the cursor and database connection
        cursor.close()
        conn.close()

        current_year = datetime.now().year

        # Render the index.html template and pass the services data to it
        return render_template("index.html", services=services)
    except Exception as e:
        # If an error occurs, render the error.html template and pass the error message
        return render_template("error.html", error=str(e))


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


# API route to fetch all prices
@app.route(shortcut + "/prices/all", methods=["GET"])
def all_prices():
    """API endpoint to get all prices"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM prices")
        prices = cursor.fetchall()

        cursor.close()
        conn.close()

        # Return the prices data as a JSON response
        return jsonify(prices)
    except Exception as e:
        # If an error occurs, return a JSON response with the error message and a 500 status code
        return jsonify({"error": str(e)}), 500


# API route to fetch the price of a specific service by service ID (may not use this on the frontend)
@app.route(shortcut + "/serv_prices", methods=["GET"])
def price_id():
    """API endpoint to get a price by service ID"""
    if "id" in request.args:
        id = int(request.args["id"])
    else:
        return jsonify({"error": "No id field provided. Please specify an id."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM prices WHERE service_id = %s", (id,))
        price = cursor.fetchone()
        cursor.close()
        conn.close()

        if price:
            return jsonify(price)
        else:
            return jsonify({"error": "Price not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# API route to fetch the most expensive service
@app.route(shortcut + "/expensiveservice", methods=["GET"])
def high_serv():
    """API endpoint to get the most expensive service"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute a SQL query to fetch the most expensive service where we expectonly one result, thu LIMIT = 1
        cursor.execute(
            """
            SELECT s.id, s.name as service, p.price 
            FROM services s 
            JOIN prices p ON s.id = p.service_id 
            ORDER BY p.price DESC 
            LIMIT 1
        """
        )
        service = cursor.fetchone()
        cursor.close()
        conn.close()

        if service:  # is found
            return jsonify(service)
        else:
            return jsonify({"error": "No services found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# API route to fetch the least expensive service
@app.route(shortcut + "/cheapestservice", methods=["GET"])
def low_serv():
    """API endpoint to get the least expensive service"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute a SQL query to fetch the least expensive service
        cursor.execute(
            """
            SELECT s.id, s.name as service, p.price 
            FROM services s 
            JOIN prices p ON s.id = p.service_id 
            ORDER BY p.price ASC 
            LIMIT 1
        """
        )
        # Fetch one row from the query result
        service = cursor.fetchone()

        cursor.close()
        conn.close()

        # If a service is found, return it as a JSON response
        if service:
            return jsonify(service)
        else:
            return jsonify({"error": "No services found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# API route to sort services alphabetically
@app.route(shortcut + "/services/sort", methods=["GET"])
def sort_serv():
    """API endpoint to sort services alphabetically"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute a SQL query to fetch services sorted by name in ascending order
        cursor.execute(
            """
            SELECT s.id, s.name as service, p.price 
            FROM services s 
            JOIN prices p ON s.id = p.service_id 
            ORDER BY s.name ASC
        """
        )
        # Fetch all rows from the query result
        services = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(services)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# API route to sort services by price
@app.route(shortcut + "/prices/sort", methods=["GET"])
def sort_price():
    """API endpoint to sort services by price"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute a SQL query to fetch services sorted by price in ascending order
        cursor.execute(
            """
            SELECT s.id, s.name as service, p.price 
            FROM services s 
            JOIN prices p ON s.id = p.service_id 
            ORDER BY p.price ASC
        """
        )
        # Fetch all rows from the query result
        services = cursor.fetchall()

        cursor.close()
        conn.close()

        # Return the sorted services data as a JSON response
        return jsonify(services)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Web route to view all services in the browser
@app.route("/services", methods=["GET"])
@app.route("/master/services", methods=["GET"])
@app.route("/client/services",  methods=["GET"])
def view_services():
    """Web route to view all services"""
    try:
        # Тестовые данные (удалите, когда подключите БД)
        test_services = [
            {"id": 1, "name": "Тестовый маникюр", "price": 1500},
            {"id": 2, "name": "Пробная стрижка", "price": 2000},
            {"id": 3, "name": "Демо-окрашивание", "price": 2500}
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
        return render_template("services.html", services=test_services)
    except Exception as e:
        return render_template("error.html", error=str(e))


@app.route("/personal_account_master", methods=["GET"])
@app.route("/master/personal_account_master", methods=["GET"])
def personal_account_master():
    """Web route to view master's personal account"""
    try:
        # Данные мастера
        master_data = {
            'photo': '/static/images/master_photo.jpg',
            'full_name': 'Иванова Анна Петровна',
            'address': 'ул. Примерная, д. 123, кв. 45',
            'phone': '+7 (123) 456-78-90',
            'specialization': 'Парикмахер-стилист',
            'experience': '5 лет',
            'notes': 'Предпочитаю работать с вечерними причёсками',
            'description': 'Опытный мастер с международными сертификатами.'
        }

        if _siteVersion == _master:
            return render_template("personal_account_master.html", master=master_data)
        else:
            return ""#render_template("personal_account_master.html", master=master_data)


    except Exception as e:
        return render_template("error.html", error=str(e)), 500


# running it locally
# if __name__ == "__main__":
#    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

app = app
