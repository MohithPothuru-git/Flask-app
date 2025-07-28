import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
class Base(DeclarativeBase):
    pass
db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
# setup a secret key, required by sessions