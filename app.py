import os
import logging
from flask import Flask, render_template, jsonify, request, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase  

# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

db = SQLAlchemy(model_class=Base)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'image': self.image,
            'category': self.category,
            'description': self.description
        }

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your-secret-key-here")

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://apple@localhost/clothing_store'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Enable CORS
CORS(app)

# Load product data
# def load_products():
#     try:
#         with open('data/products.json', 'r') as f:
#             return json.load(f)
#     except FileNotFoundError:
#         logging.error("Products data file not found")
#         return {"products": [], "categories": []}

@app.route('/')
def index():
    featured_products = Product.query.limit(6).all()
    return render_template('index.html', featured_products=featured_products)

@app.route('/products')
def products():
    category = request.args.get('category', 'all')
    
    # Get unique categories from DB
    categories = db.session.query(Product.category).distinct().all()
    categories = [c[0] for c in categories]

    if category != 'all':
        product_list = Product.query.filter_by(category=category).all()
    else:
        product_list = Product.query.all()

    return render_template(
        'products.html',
        products=product_list,
        categories=categories,
        current_category=category
    )

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product = db.get_or_404(Product, product_id)  # Raises 404 if not found

    # Related products (same category, exclude self)
    related_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product_id
    ).limit(4).all()

    return render_template(
        'product_detail.html',
        product=product,
        related_products=related_products
    )

@app.route('/about')
def about():
    """About page with brand story"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """Contact page"""
    return render_template('contact.html')

@app.route('/api/products')
def api_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/<int:product_id>')
def api_product_detail(product_id):
    product = db.get_or_404(Product, product_id)
    return jsonify(product.to_dict())

@app.cli.command("init-db")
def init_db():
    db.create_all()
    # Add sample data
    if Product.query.count() == 0:
        sample_products = [
            Product(
                name="Wireless Earbuds",
                price=59.99,
                image="/static/images/earbuds.jpg",
                category="Electronics",
                description="Noise-cancelling wireless earbuds."
            ),
            Product(
                name="Cotton T-Shirt",
                price=19.99,
                image="/static/images/tshirt.jpg",
                category="Clothing",
                description="Comfortable 100% cotton t-shirt."
            ),
            Product(
                name="Coffee Mug",
                price=12.99,
                image="/static/images/mug.jpg",
                category="Home",
                description="Ceramic mug for your morning coffee."
            ),
        ]
        db.session.add_all(sample_products)
        db.session.commit()
        print("Initialized database with sample data.")
    else:
        print("Database already has data.")

from flask import session, flash, redirect, request, url_for

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    try:
        product_id = int(request.form['product_id'])
        quantity = int(request.form['quantity'])

        # Fetch the product from the database
        product = db.get_or_404(Product, product_id)

        # Get cart from session
        cart = session.get('cart', [])

        # Check if product is already in cart
        found = False
        for item in cart:
            if item['id'] == product_id:
                item['quantity'] += quantity
                found = True
                break

        if not found:
            cart.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'image': product.image,
                'quantity': quantity
            })

        # Save back to session
        session['cart'] = cart

        flash(f"✅ Added {quantity} x {product.name} to your cart!", "success")

    except Exception as e:
        app.logger.error(f"Error adding to cart: {e}")
        flash("⚠️ Error adding item to cart.", "danger")

    return redirect(url_for('product_detail', product_id=product_id))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Add sample product if none exist
        if Product.query.count() == 0:
            p = Product(
                name="Test Earbuds",
                price=99.99,
                image="/static/images/earbuds.jpg",
                category="Electronics",
                description="Just a test product"
            )
            db.session.add(p)
            db.session.commit()
            print("✅ Added test product.")

    app.run(host='0.0.0.0', port=5000, debug=True)