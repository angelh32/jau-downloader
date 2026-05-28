import os
from peewee import SqliteDatabase

database = SqliteDatabase(None)


def init_db(db_path: str):
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    database.init(db_path)
    database.connect()
    from .models import User, Session
    database.create_tables([User, Session])


def close_db():
    if not database.is_closed():
        database.close()
