import os
from flask import Flask,render_template, request, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import logging
from sqlalchemy.orm import DeclarativeBase

logging.basicConfig(level=logging.DEBUG)
class Base(DeclarativeBase):
    pass


# create the app
app = Flask(__name__)