import functools
import json

from settings import TEST_CONFIG
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from yaml import safe_load


def get_app_config():
    with open(TEST_CONFIG) as file:
        config = safe_load(file)
    return config


def construct_db_url(config):
    dsn = "postgresql+asyncpg://{username}:{password}@{host}:{port}/{database}"
    return dsn.format(**config)


async def on_startup(app):
    application_name = app["app_name"]
    config = get_app_config()
    db_url = construct_db_url(config[application_name])
    app['db'] = create_async_engine(db_url, echo=True)
    await init_app_context_data(app)


async def on_shutdown(app):
    await app["db"].dispose()


async def init_app_context_data(app):
    async with app['db'].connect() as conn:
        cursor = await conn.execute(text("SELECT * FROM subsystem"))
        result = dict(cursor.fetchone())
        if not result:
            raise
    app['subsystem'] = result


pretty_json = functools.partial(
    json.dumps, indent=4, ensure_ascii=False, default=str
)

DATE_FORMAT = '%Y-%m-%d'
MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
]
