import asyncio
from datetime import datetime

from sqlalchemy import select, literal_column, func, desc, text, and_
from sqlalchemy.dialects import postgresql as psql
from aiohttp import web

from views import ListView, DetailView, BaseView
from utils import pretty_json, DATE_FORMAT
from table import get_table_data
from warmth.models import *


async def test_handler_post(request: web.Request):
    post_data = await request.post()
    file = post_data['file'].file
    table_data = await get_table_data(file, request.app["app_name"])
    return web.json_response({"success": True, "items": table_data}, dumps=pretty_json)


async def test_handler(request):
    data = request.app['subsystem']
    return web.json_response({"success": True, "item": data}, dumps=pretty_json)


class SubsystemDetailView(DetailView):
    model = subsystem

    async def get(self):
        await asyncio.sleep(1)
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(self.model)
            )
            result = dict(cursor.fetchone())
            return web.json_response({"success": True, "item": result}, dumps=pretty_json)

    async def patch(self):
        current_data = await self.request.json()
        if current_data['month'] == 12:
            current_data['month'] = 1
            current_data['year'] += 1
        else:
            current_data['month'] += 1
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.update().where(self.model.c.id == current_data['id']).values(**current_data)
            )
        self.request.app['subsystem'] = current_data
        return web.json_response({"success": True, "item": current_data}, dumps=pretty_json)


class BanksListView(ListView):
    model = banks


class BankDetailView(DetailView):
    model = banks


class RatesListView(ListView):
    model = rates

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            limited_history = select(rates_history.c.id).where(
                rates_history.c.rate_id == literal_column("rates.id")
            ).order_by(desc(rates_history.c.id)).limit(1)
            smtm = select(rates, func.row_to_json(rates_history.table_valued()).label("history")).select_from(
                rates.join(rates_history, rates_history.c.id == limited_history, isouter=True)
            )
            cursor = await conn.execute(smtm)
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)


class RatesDetailView(DetailView):
    model = rates


class RatesHistoryListView(ListView):
    model = rates_history

    async def get(self):
        rate_id = int(self.request.match_info['rate_id'])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(self.model).where(self.model.c.rate_id == rate_id).order_by(desc(self.model.c.id))
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result})


class RateHistoryDetailView(DetailView):
    model = rates_history


class WorkshopsListView(ListView):
    model = workshops


class WorkshopDetailView(DetailView):
    model = workshops


class CurrencyCoefficientsListView(ListView):
    model = currency_coefficients

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(select(self.model).order_by(desc(self.model.c.year), desc(self.model.c.month)))
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)


class CurrencyCoefficientDetailView(DetailView):
    model = currency_coefficients


class ReconciliationCodesListView(ListView):
    model = reconciliation_codes


class ReconciliationCodeDetailView(DetailView):
    model = reconciliation_codes


class ObjectsListView(ListView):
    model = objects

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(select(
                self.model,
                func.row_to_json(rates.table_valued()).label("rate"),
                func.row_to_json(workshops.table_valued()).label("workshop"),
                func.row_to_json(reconciliation_codes.table_valued()).label("reconciliation_code")
            ).select_from(
                self.model.join(rates).join(workshops).join(reconciliation_codes, isouter=True))
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result})

    async def post(self):
        post_data = await self.request.json()
        async with self.request.app['db'].begin() as conn:
            cursor = await conn.execute(self.model.insert().returning(self.model.c.id).values(
                title=post_data['title'],
                code=post_data['code'],
                rate_id=post_data['rate']['id'] if post_data['rate'] is not None else None,
                workshop_id=post_data['workshop']['id'] if post_data['workshop'] is not None else None,
                reconciliation_code_id=post_data['reconciliation_code']['id'] if post_data[
                                                                                     'reconciliation_code'] is not None else None,
                is_closed=post_data['is_closed'],
                is_heating_available=post_data['is_heating_available'],
                is_water_heating_available=post_data['is_water_heating_available'],
                is_meter_unavailable=post_data['is_meter_unavailable'],
                vat=post_data['vat']
            ))
            post_data['id'] = dict(cursor.fetchone()).get('id')
            return web.json_response({"success": True, "item": post_data})


class ObjectDetailView(DetailView):
    model = objects

    async def patch(self):
        post_data = await self.request.json()
        object_id = int(self.request.match_info['id'])
        async with self.request.app['db'].begin() as conn:
            await conn.execute(self.model.update().where(self.model.c.id == object_id).values(
                title=post_data['title'],
                code=post_data['code'],
                rate_id=post_data['rate']['id'] if post_data['rate'] is not None else None,
                workshop_id=post_data['workshop']['id'] if post_data['workshop'] is not None else None,
                reconciliation_code_id=post_data['reconciliation_code']['id'] if post_data[
                                                                                     'reconciliation_code'] is not None else None,
                is_closed=post_data['is_closed'],
                is_heating_available=post_data['is_heating_available'],
                is_water_heating_available=post_data['is_water_heating_available'],
                is_meter_unavailable=post_data['is_meter_unavailable'],
                vat=post_data['vat']
            ))
            return web.json_response({"success": True}, dumps=pretty_json)


class RentersListView(ListView):
    model = renters

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(
                    self.model, func.row_to_json(banks.table_valued()).label("bank")
                ).select_from(self.model.join(banks))
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)

    async def post(self):
        post_data = await self.request.json()
        bank = post_data.pop("bank", None)
        contract_date = post_data.get("contract_date")
        if contract_date:
            post_data['contract_date'] = datetime.strptime(contract_date, DATE_FORMAT)
        async with self.request.app['db'].begin() as conn:
            cursor = await conn.execute(
                self.model.insert().returning(literal_column("*")).values(**post_data)
            )
            result = dict(cursor.fetchone())
            result['bank'] = bank
            return web.json_response({"success": True, "item": result}, dumps=pretty_json)


class RenterDetailView(DetailView):
    model = renters

    async def patch(self):
        renter_id = int(self.request.match_info['id'])
        post_data = await self.request.json()
        if post_data['contract_date']:
            post_data['contract_date'] = datetime.strptime(post_data.pop('contract_date'), DATE_FORMAT)
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.update().where(self.model.c.id == renter_id).values(
                    **{k: v for k, v in post_data.items() if k in self.model.columns.keys()}
                )
            )
            return web.json_response({"success": True}, dumps=pretty_json)


class RentersObjectsListView(ListView):
    model = renters_objects

    async def get(self):
        renter_id = int(self.request.match_info['renter_id'])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                self.model.select().where(self.model.c.renter_id == renter_id)
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({'success': True, "items": result}, dumps=pretty_json)

    async def post(self):
        post_data = await self.request.json()
        async with self.request.app['db'].begin() as conn:
            cursor = await conn.execute(
                self.model.insert().returning(literal_column("*")).values(**post_data)
            )
            result = dict(cursor.fetchone())
            return web.json_response({"success": True, "item": result}, dumps=pretty_json)

    async def delete(self):
        renter_id = int(self.request.match_info['renter_id'])
        obj_id = int(self.request.match_info['id'])
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.delete().where(and_(
                    self.model.c.renter_id == renter_id,
                    self.model.c.object_id == obj_id
                ))
            )
            return web.json_response({'success': True}, dumps=pretty_json)


class PaymentsUploadView(BaseView):
    model = payments

    async def post(self):
        post_data = await self.request.post()
        table_data = await get_table_data(post_data['file'].file, self.request.app["app_name"])
        required_codes = {row['KO'] for row in table_data}
        app_info = self.request.app['subsystem']
        async with self.request.app['db'].begin() as conn:
            cursor = await conn.execute(objects.select().where(objects.c.code.in_(required_codes)))
            selected_objects = [dict(row) for row in cursor.fetchall()]
            selected_objects_codes = [row['code'] for row in selected_objects]
            differences = list(required_codes.difference(selected_objects_codes))
            if differences:
                return web.json_response({
                    "success": False, "reason": f"Не найдены объекты со следующими кодами: {', '.join(differences)}"
                }, dumps=pretty_json)
            insert_data = []
            for row in table_data:
                required_object_id = next((item['id'] for item in selected_objects if item['code'] == row['KO']), None)
                if not required_object_id:
                    raise
                insert_data.append({
                    'month': app_info['month'],
                    'year': app_info['year'],
                    'object_id': required_object_id,
                    'payment_type': row['VID'],
                    'ncen': row['NCEN'],
                    'applied_rate_value': row['TARIF'],
                    'heating_value': row['OTG'],
                    'heating_cost': row['OTR'],
                    'water_heating_value': row['GVG'],
                    'water_heating_cost': row['GVR']
                })
            await conn.execute(self.model.insert(), insert_data)
        return web.json_response({"success": True, "items": insert_data}, dumps=pretty_json)


class ObjectPaymentListView(ListView):
    model = payments

    async def get(self):
        object_id = int(self.request.match_info['id'])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(self.model).where(self.model.c.object_id == object_id).order_by(
                    desc(self.model.c.month), self.model.c.year
                )
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result})


class ObjectPaymentsDetailView(DetailView):
    model = payments

    async def patch(self):
        obj_id = int(self.request.match_info['obj_id'])
        payment_id = int(self.request.match_info['id'])
        post_data = await self.request.json()
        async with self.request.app['db'].begin() as conn:
            cursor = await conn.execute(
                self.model.update().returning(literal_column("*")).values(**post_data).where(and_(
                    self.model.c.id == payment_id,
                    self.model.c.object_id == obj_id
                ))
            )
            result = dict(cursor.fetchone())
            return web.json_response({"success": True, "item": result}, dumps=pretty_json)

    async def delete(self):
        obj_id = int(self.request.match_info['obj_id'])
        payment_id = int(self.request.match_info['id'])
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.delete().where(and_(
                    self.model.c.id == payment_id,
                    self.model.c.object_id == obj_id
                ))
            )
            return web.json_response({"success": True}, dumps=pretty_json)
