import os
import json
import logging
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your-secret-key-here")

# Enable CORS
CORS(app)

# Load product data
def load_products():
    try:
        with open('data/products.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error("Products data file not found")
        return {"products": [], "categories": []}

@app.route('/')
def index():
    """Home page with featured products"""
    data = load_products()
    featured_products = data.get('products', [])[:6]  # Show first 6 as featured
    return render_template('index.html', featured_products=featured_products)

@app.route('/products')
def products():
    """Products page with all items and filtering"""
    data = load_products()
    category = request.args.get('category', 'all')
    
    all_products = data.get('products', [])
    categories = data.get('categories', [])
    
    if category != 'all':
        filtered_products = [p for p in all_products if p.get('category', '').lower() == category.lower()]
    else:
        filtered_products = all_products
    
    return render_template('products.html', 
                         products=filtered_products, 
                         categories=categories,
                         current_category=category)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    """Individual product detail page"""
    data = load_products()
    products = data.get('products', [])
    
    product = next((p for p in products if p.get('id') == product_id), None)
    if not product:
        return render_template('404.html'), 404
    
    # Get related products from same category
    related_products = [p for p in products 
                       if p.get('category') == product.get('category') 
                       and p.get('id') != product_id][:4]
    
    return render_template('product_detail.html', 
                         product=product, 
                         related_products=related_products)

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
    """API endpoint for products"""
    data = load_products()
    return jsonify(data)

@app.route('/api/products/<int:product_id>')
def api_product_detail(product_id):
    """API endpoint for single product"""
    data = load_products()
    products = data.get('products', [])
    product = next((p for p in products if p.get('id') == product_id), None)
    
    if product:
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)