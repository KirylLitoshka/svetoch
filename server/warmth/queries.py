from warmth.models import *
from exceptions import RecordNotFound

from sqlalchemy import select, func, and_

__all__ = [
    "get_total_values_by_workshop",
    "get_current_currency_coefficient"
]


async def get_total_values_by_workshop(conn, app_info):
    cursor = await conn.execute(
        select(
            workshops.c.title,
            workshops.c.is_currency_coefficient_applied,
            workshops_groups.c.title.label("group_title"),
            func.sum(payments.c.heating_value).label("heating_value"),
            func.sum(payments.c.heating_cost).label("heating_cost"),
            func.sum(payments.c.water_heating_value).label(
                "water_heating_value"),
            func.sum(payments.c.water_heating_cost).label("water_heating_cost")
        ).select_from(
            workshops.join(workshops_groups).join(
                objects, onclause=objects.c.workshop_id == workshops.c.id
            ).join(
                payments, onclause=payments.c.object_id == objects.c.id
            )
        ).where(and_(
            payments.c.month == app_info['month'],
            payments.c.year == app_info['year'],
            payments.c.payment_type == 1,
            payments.c.ncen != 0
        )).group_by(workshops.c.id, workshops_groups.c.title).order_by(workshops.c.id)
    )
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("Записи на текущий месяц не найдены")
    return result


async def get_current_currency_coefficient(conn, app_info):
    cursor = await conn.execute(
        select(currency_coefficients).where(and_(
            currency_coefficients.c.month == app_info['month'],
            currency_coefficients.c.year == app_info['year']
        ))
    )
    result = dict(cursor.fetchone())
    if not result:
        raise RecordNotFound("Валютный коэффициент на текущий месяц не найден")
    return result
