from warmth.models import *
from exceptions import RecordNotFound

from sqlalchemy import select, func, and_, text, desc

__all__ = [
    "get_workshop_groups_payments",
    "get_current_currency_coefficient",
    "get_reconciliation_codes",
    "get_reconciliation_codes_with_total",
    "get_workshop_by_id",
    "get_detail_by_workshop",
    "get_renters_payments"
]


async def get_current_currency_coefficient(conn, month, year):
    cursor = await conn.execute(select(currency_coefficients).where(and_(
        currency_coefficients.c.month == month, currency_coefficients.c.year == year
    )))
    current_coefficient = dict(cursor.fetchone())
    if not current_coefficient:
        raise RecordNotFound("Валютный коэффициент на текущий месяц не найден")
    return current_coefficient


async def get_renters_payments(conn, month, year, is_detailed=False, is_bank_payment=False):
    stmt = select(
        renters.c.id, renters.c.name.label("renter_title"),
        func.sum(payments.c.heating_value).label("heating_value"),
        func.sum(payments.c.heating_cost).label("heating_cost"),
        func.sum(payments.c.water_heating_value).label("water_heating_value"),
        func.sum(payments.c.water_heating_cost).label("water_heating_cost")
    ).select_from(renters.join(renters_objects).join(objects).join(payments)).group_by(renters.c.id).where(and_(
        payments.c.operation_month == month,
        payments.c.operation_year == year,
        payments.c.payment_type == 1,
        payments.c.ncen != 0
    )).order_by(renters.c.id)
    if is_detailed:
        objects_payment = select(
            objects, func.json_agg(payments.table_valued()).label("payments")
        ).select_from(objects.join(payments)).group_by(objects.c.id).where(and_(
            payments.c.operation_month == month,
            payments.c.operation_year == year,
            payments.c.payment_type == 1,
            payments.c.ncen != 0
        )).order_by(objects.c.id).alias("objects_payment")
        stmt = select(
            renters,
            banks.c.title.label("bank_title"),
            banks.c.code.label("bank_code"),
            func.json_agg(text("objects_payment.*")).label("includes")
        ).select_from(
            renters.join(renters_objects).join(banks, isouter=True).join(objects_payment)
        )
        if is_bank_payment:
            stmt = stmt.where(renters.c.is_bank_payer)
        stmt = stmt.group_by(renters.c.id, banks).order_by(renters.c.id)
    cursor = await conn.execute(stmt)
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        return RecordNotFound("Не найдено")
    return result


async def get_workshop_groups_payments(conn, month, year):
    payments_with_coefficient = select(payments, currency_coefficients.c.value_1).select_from(
        payments.join(currency_coefficients, onclause=and_(
            currency_coefficients.c.month == payments.c.payment_month,
            currency_coefficients.c.year == payments.c.payment_year
        ))
    ).where(
        payments.c.operation_month == month,
        payments.c.operation_year == year,
        payments.c.payment_type == 1,
        payments.c.ncen != 0
    ).alias("payments")

    workshops_payments = select(
        workshops,
        func.json_agg(text("payments.*")).label("payments")
    ).select_from(
        workshops.join(objects).join(payments_with_coefficient)
    ).group_by(workshops.c.id).order_by(desc(workshops.c.id)).alias("workshops_payments")

    workshops_groups_payments = select(
        workshops_groups.c.title,
        func.json_agg(text("workshops_payments.*")).label("workshops")
    ).select_from(
        workshops_groups.join(workshops_payments)
    ).group_by(workshops_groups.c.id).order_by(workshops_groups.c.id)

    cursor = await conn.execute(workshops_groups_payments)
    workshop_groups_data = [dict(row) for row in cursor.fetchall()]
    if not workshop_groups_data:
        raise RecordNotFound("Записи на текущий месяц не найдены")
    return workshop_groups_data


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
            payments.c.operation_month == month,
            payments.c.operation_year == year,
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
        payments.c.operation_month == month,
        payments.c.operation_year == year,
        payments.c.payment_type == 1,
        payments.c.ncen != 0
    )).group_by(objects.c.title))
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("Платежи по цеху не найдены")
    return result


async def get_detail_by_workshop(conn, workshop_id, month, year):
    workshop = await get_workshop_by_id(conn, workshop_id)
    payment_data = await get_payments_info_by_workshop(conn, workshop_id, month, year)
    workshop["payments"] = payment_data
    return workshop
