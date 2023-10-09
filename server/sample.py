import asyncio
import json
import os
import platform
from datetime import datetime

from electricity import models as electo_models
from warmth import models as warmth_models
from settings import BASE_PATH
from sqlalchemy.ext.asyncio import create_async_engine
from utils import construct_db_url, get_app_config

APPS_SAMPLE_DIRS = {
    "electricity": os.path.join(BASE_PATH, "electricity", "sample"),
    "warmth": os.path.join(BASE_PATH, "warmth", "sample")
}


def get_model_data(model, sub_app_name):
    sub_app_path = APPS_SAMPLE_DIRS[sub_app_name]
    with open(f"{sub_app_path}/{model}.json", encoding="utf8") as fp:
        file_data = json.loads(fp.read())
        return file_data


async def insert_data(conn, model, subapp_name, date_field=None):
    model_items = get_model_data(model, subapp_name)
    for model_item in model_items:
        if date_field and model_item[date_field] is not None:
            model_item[date_field] = datetime.strptime(
                model_item[date_field], "%d.%m.%Y"
            ).date()
        await conn.execute(model.insert().returning(model.c.id).values(**model_item))


async def electricity_data(config, sub_app_name):
    db_url = construct_db_url(config[sub_app_name])
    engine = create_async_engine(db_url, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(electo_models.metadata.drop_all)
        await conn.run_sync(electo_models.metadata.create_all)
        await insert_data(conn, electo_models.subsystem, sub_app_name)
        await insert_data(conn, electo_models.areas, sub_app_name)
        await insert_data(conn, electo_models.rates, sub_app_name)
        await insert_data(conn, electo_models.ciphers, sub_app_name)
        await insert_data(conn, electo_models.rates_history, sub_app_name, "entry_date")
        await insert_data(conn, electo_models.meters, sub_app_name)
        await insert_data(conn, electo_models.workshops, sub_app_name)
        await insert_data(conn, electo_models.objects, sub_app_name)
        await insert_data(conn, electo_models.object_meters, sub_app_name, "installation_date")
        await insert_data(conn, electo_models.limits, sub_app_name)
        await insert_data(conn, electo_models.subobjects, sub_app_name)
        await insert_data(conn, electo_models.banks, sub_app_name)
        await insert_data(conn, electo_models.renters, sub_app_name, "contract_date")
        await insert_data(conn, electo_models.object_limits, sub_app_name)
        await insert_data(conn, electo_models.addresses, sub_app_name)
        await insert_data(conn, electo_models.calculation_data, sub_app_name)
        await insert_data(conn, electo_models.workshops_subobjects, sub_app_name)
        await insert_data(conn, electo_models.objects_subrenters, sub_app_name)
        await insert_data(conn, electo_models.objects_calculation_data, sub_app_name)
    await engine.dispose()


async def warmth_data(config, sub_app_name):
    db_url = construct_db_url(config[sub_app_name])
    engine = create_async_engine(db_url, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(warmth_models.metadata.drop_all)
        await conn.run_sync(warmth_models.metadata.create_all)
        await insert_data(conn, warmth_models.subsystem, sub_app_name)
        await insert_data(conn, warmth_models.banks, sub_app_name)
        await insert_data(conn, warmth_models.rates, sub_app_name)
        await insert_data(conn, warmth_models.rates_history, sub_app_name)
        await insert_data(conn, warmth_models.workshops, sub_app_name)
        await insert_data(conn, warmth_models.currency_coefficients, sub_app_name)
        await insert_data(conn, warmth_models.reconciliation_codes, sub_app_name)
        await insert_data(conn, warmth_models.objects, sub_app_name)
        await insert_data(conn, warmth_models.renters, sub_app_name)
        await insert_data(conn, warmth_models.renters_objects, sub_app_name)
    await engine.dispose()


async def main():
    config = get_app_config()
    await electricity_data(config, "electricity")
    await warmth_data(config, "warmth")


if __name__ == "__main__":
    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
