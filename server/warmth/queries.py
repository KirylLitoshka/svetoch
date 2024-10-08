from warmth.models import *
from exceptions import RecordNotFound

from sqlalchemy import select, func, and_, text, desc
from sqlalchemy.dialects.postgresql import aggregate_order_by

__all__ = [
    "get_workshop_groups_payments",
    "get_current_currency_coefficient",
    "get_workshop_payments",
    "get_reconciliation_codes_payments",
    "get_renters_payments",
    "get_communal_objects_payments"
]


async def get_current_currency_coefficient(conn, month, year):
    cursor = await conn.execute(select(currency_coefficients).where(and_(
        currency_coefficients.c.month == month, currency_coefficients.c.year == year
    )))
    current_coefficient = dict(cursor.fetchone())
    if not current_coefficient:
        raise RecordNotFound("Валютный коэффициент на текущий месяц не найден")
    return current_coefficient


async def get_reconciliation_codes(conn):
    cursor = await conn.execute(select(reconciliation_codes).order_by(reconciliation_codes.c.id))
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("Коды сверки не найдены")
    return result


async def get_workshop_groups_payments(conn, month, year):
    payments_with_coefficient = select(payments, currency_coefficients.c.value_1).select_from(
        payments.join(currency_coefficients, onclause=and_(
            currency_coefficients.c.month == payments.c.payment_month,
            currency_coefficients.c.year == payments.c.payment_year
        ))
    ).where(and_(
        payments.c.operation_month == month,
        payments.c.operation_year == year,
        payments.c.payment_type == 1,
        payments.c.ncen != 0
    )).alias("payments")

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
        raise RecordNotFound("Записи на текущий месяц не найдены или не задан валютный коэффициент")
    return workshop_groups_data


async def get_workshop_payments(conn, workshop_id, month, year):
    current_payments = select(payments, currency_coefficients.c.value_1.label("currency_coefficient")).select_from(
        payments.join(currency_coefficients, onclause=and_(
            currency_coefficients.c.month == payments.c.payment_month,
            currency_coefficients.c.year == payments.c.payment_year
        ))
    ).where(and_(
        payments.c.operation_month == month,
        payments.c.operation_year == year,
        payments.c.payment_type == 1,
        payments.c.ncen != 0
    )).alias("current_payments")

    objects_payments = select(
        objects.c.title, objects.c.workshop_id, func.json_agg(text("current_payments.*")).label("payments")
    ).select_from(
        objects.join(current_payments)
    ).group_by(objects.c.title, objects.c.workshop_id).alias("objects_payments")

    cursor = await conn.execute(
        select(
            workshops.c.title,
            workshops.c.is_currency_coefficient_applied,
            func.json_agg(text("objects_payments.*")).label("objects")
        ).select_from(workshops.join(objects_payments)).where(workshops.c.id == workshop_id).group_by(
            workshops.c.title, workshops.c.is_currency_coefficient_applied
        )
    )
    try:
        workshops_payments = dict(cursor.fetchone())
    except TypeError:
        raise RecordNotFound("Начиления за текущий период не найден")
    return workshops_payments


async def get_renters_payments(conn, renter_ids=None, month=None, year=None, is_bank_payment=False):
    payments_with_coefficient = select(
        objects.c.code,
        objects.c.title,
        payments,
        currency_coefficients.c.value_1.label('coefficient_value'),
        objects.c.vat
    ).select_from(
        payments.join(currency_coefficients, onclause=and_(
            currency_coefficients.c.month == payments.c.payment_month,
            currency_coefficients.c.year == payments.c.payment_year
        )).join(objects)
    ).where(and_(payments.c.payment_type == 1, payments.c.ncen != 0))

    if month and year:
        payments_with_coefficient = payments_with_coefficient.where(and_(
            payments.c.operation_month == month, payments.c.operation_year == year,
        ))

    payments_with_coefficient = payments_with_coefficient.alias("payments")
    query = select(
        renters, banks.c.title.label("bank_title"), banks.c.code.label("bank_code"),
        func.json_agg(text("payments.*")).label("payments")
    ).select_from(
        renters.join(renters_objects).join(objects).join(payments_with_coefficient).join(banks, isouter=True)
    ).group_by(renters, banks.c.title, banks.c.code)
    if renter_ids:
        if isinstance(renter_ids, int):
            renter_ids = [renter_ids]
        query = query.where(renters.c.id.in_(renter_ids))
    if is_bank_payment:
        query = query.where(renters.c.is_bank_payer)
    cursor = await conn.execute(query)
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("Начисления за текущий месяц не найдены")
    return result


async def get_reconciliation_codes_payments(conn, month, year):
    cursor = await conn.execute(
        select(reconciliation_codes, func.json_agg(
            aggregate_order_by(
                func.json_build_object(
                    "id", objects.c.id,
                    "code", objects.c.code,
                    "title", objects.c.title,
                    "applied_rate_value", payments.c.applied_rate_value,
                    "heating_value", payments.c.heating_value,
                    "heating_cost", payments.c.heating_cost,
                    "water_heating_value", payments.c.water_heating_value,
                    "water_heating_cost", payments.c.water_heating_cost
                ), objects.c.code
            )
        ).label("payments")).select_from(reconciliation_codes.join(objects).join(payments)).group_by(
            reconciliation_codes.c.id, reconciliation_codes.c.title
        ).where(and_(
            payments.c.operation_month == month,
            payments.c.operation_year == year,
            payments.c.payment_type == 1,
            payments.c.ncen != 0
        ))
    )
    result = [dict(row) for row in cursor]
    if not result:
        raise RecordNotFound("Начислений не найдено")
    return result


async def get_communal_objects_payments(conn, year, month):
    query = select(
        objects.c.code,
        objects.c.is_heating_available,
        objects.c.is_water_heating_available,
        payments
    ).select_from(
        payments.join(objects).join(workshops, onclause=objects.c.workshop_id == workshops.c.id)
    ).where(and_(
        payments.c.operation_year == year,
        payments.c.payment_month == month,
        payments.c.ncen != 0,
        workshops.c.workshop_group_id == 1
    ))
    cursor = await conn.execute(query)
    result = [dict(row) for row in cursor.fetchall()]
    if not result:
        raise RecordNotFound("Платежи не найдены")
    return result
