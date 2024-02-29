from warmth.models import *
from exceptions import RecordNotFound

from sqlalchemy import select, func, and_, text

__all__ = [
    "get_total_values_by_workshop",
    "get_current_currency_coefficient",
    "get_reconciliation_codes",
    "get_reconciliation_codes_with_total",
    "get_workshop_by_id",
    "get_detail_by_workshop",
    "get_renters_payments"
]


async def get_renters_payments(conn, month, year, is_detailed=False):
    stmt = select(
        renters.c.id, renters.c.name.label("renter_title"),
        func.sum(payments.c.heating_value).label("heating_value"),
        func.sum(payments.c.heating_cost).label("heating_cost"),
        func.sum(payments.c.water_heating_value).label("water_heating_value"),
        func.sum(payments.c.water_heating_cost).label("water_heating_cost")
    ).select_from(renters.join(renters_objects).join(objects).join(payments)).group_by(renters.c.id).where(and_(
        payments.c.month == month,
        payments.c.year == year,
        payments.c.payment_type == 1,
        payments.c.ncen != 0
    )).order_by(renters.c.id)
    if is_detailed:
        objects_payment = select(
            objects, func.json_agg(payments.table_valued()).label("payments")
        ).select_from(objects.join(payments)).group_by(objects.c.id).where(and_(
            payments.c.month == month,
            payments.c.year == year,
            payments.c.payment_type == 1,
            payments.c.ncen != 0
        )).order_by(objects.c.id).alias("objects_payment")
        stmt = select(
            renters,
            func.json_agg(text("objects_payment.*")).label("includes")
        ).select_from(renters.join(renters_objects).join(objects_payment)).group_by(renters.c.id).order_by(renters.c.id)
    cursor = await conn.execute(stmt)
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        return RecordNotFound("Не найдено")
    return result


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
    result = cursor.fetchone()
    if not result:
        raise RecordNotFound("Валютный коэффициент на текущий месяц не найден")
    return dict(result)


async def get_reconciliation_codes(conn):
    cursor = await conn.execute(select(reconciliation_codes).order_by(reconciliation_codes.c.id))
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("Коды сверки не найдены")
    return result


async def get_reconciliation_codes_with_total(conn, month, year):
    cursor = await conn.execute(
        select(
            reconciliation_codes,
            func.sum(payments.c.heating_value).label("heating_value"),
            func.sum(payments.c.heating_cost).label("heating_cost"),
            func.sum(payments.c.water_heating_value).label("water_heating_value"),
            func.sum(payments.c.water_heating_cost).label("water_heating_cost")
        ).select_from(reconciliation_codes.join(objects).join(payments)).where(and_(
            payments.c.month == month,
            payments.c.year == year,
            payments.c.payment_type == 1,
            payments.c.ncen != 0
        )).group_by(reconciliation_codes.c.id).order_by(reconciliation_codes.c.id)
    )
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("На данный месяц начислений нет")
    return result


async def get_workshop_by_id(conn, workshop_id):
    cursor = await conn.execute(
        select(workshops).where(workshops.c.id == workshop_id)
    )
    result = dict(cursor.fetchone())
    if not result:
        raise RecordNotFound("Цех не найден")
    return result


async def get_payments_info_by_workshop(conn, workshop_id, month, year):
    cursor = await conn.execute(select(
        objects.c.title,
        func.sum(payments.c.heating_value).label('heating_value'),
        func.sum(payments.c.heating_cost).label('heating_cost'),
        func.sum(payments.c.water_heating_value).label('water_heating_value'),
        func.sum(payments.c.water_heating_cost).label('water_heating_cost'),
    ).select_from(objects.join(payments)).where(and_(
        objects.c.workshop_id == workshop_id,
        payments.c.month == month,
        payments.c.year == year,
        payments.c.payment_type == 1,
        payments.c.ncen != 0
    )).group_by(objects.c.title))
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("Платежи по цеху не найдены")
    return result


async def get_detail_by_workshop(conn, workshop_id, app_info):
    workshop = await get_workshop_by_id(conn, workshop_id)
    payment_data = await get_payments_info_by_workshop(conn, workshop_id, app_info["month"], app_info["year"])
    workshop["payments"] = payment_data
    return workshop
