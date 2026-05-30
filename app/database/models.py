from peewee import Model, AutoField, CharField, DateTimeField, ForeignKeyField, TextField

from app.database import database


class BaseModel(Model):
    class Meta:
        database = database


class User(BaseModel):
    id = AutoField()
    username = CharField(max_length=64, unique=True, null=False)
    password_hash = CharField(max_length=256, null=False)
    created_at = DateTimeField()


class Session(BaseModel):
    id = AutoField()
    user = ForeignKeyField(User, backref="sessions")
    token = CharField(max_length=128, unique=True, index=True, null=False)
    created_at = DateTimeField()
    expires_at = DateTimeField()


class Cookie(BaseModel):
    id = AutoField()
    user = ForeignKeyField(User, backref="cookies")
    page = CharField(max_length=256, null=False)
    cookie_coded = TextField(null=False)
    created_at = DateTimeField()
    modified_at = DateTimeField()
