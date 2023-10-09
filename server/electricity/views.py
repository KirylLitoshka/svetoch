import asyncio
from datetime import datetime
from sqlalchemy.sql import and_, func, select, desc, delete
from sqlalchemy.dialects import postgresql as psql
from sqlalchemy.sql.expression import literal_column

from views import DetailView, ListView, pretty_json, web
from electricity.models import *

__all__ = [
    "SubsystemDetailView",
    "AreasListView", "AreaDetailView",
    "CiphersListView", "CipherDetailView",
    "RatesListView", "RateDetailView",
    "MetersListView", "MeterDetailView",
    "WorkshopsListView", "WorkshopDetailView",
    "ObjectsListView", "ObjectDetailView",
    "ObjectMeterDetailView", "ObjectMetersListView",
    "LimitsListView", "LimitDetailView",
    "SubObjectsListView", "SubObjectDetailView",
    "BanksListView", "BankDetailView",
    "RentersListView", "RenterDetailView",
    "ObjectLimitsListView", "ObjectLimitDetailView",
    "AddressesListView", "AddressDetailView",
    "RatesHistoryListView", "RateHistoryDetailView",
    "CalculationDataListView", "CalculationDataDetailView",
    "WorkshopSubObjectsListView", "ObjectsSubRentersListView",
    "test_handler"
]


async def test_handler(request):
    payment_objects = await request.json()
    async with request.app['db'].begin() as conn:
        current_subsystem = await conn.execute(
            select(subsystem, func.row_to_json(calculation_data.table_valued()).label("calculation_data")).select_from(
                subsystem.join(calculation_data, onclause=(and_(
                    calculation_data.c.month == subsystem.c.month,
                    calculation_data.c.year == subsystem.c.year
                )))
            )
        )
        current_subsystem = current_subsystem.fetchone()._asdict()
        result = []
        for obj in payment_objects:
            if not obj.get("last_reading"):
                continue
            last_objects_meters = select(
                object_meters,
                func.row_to_json(meters.table_valued()).label("type")
            ).select_from(object_meters.join(meters)).where(object_meters.c.id.in_(
                select(func.max(object_meters.c.id)).select_from(object_meters).group_by(object_meters.c.object_id)
            )).alias("meter")
            cursor = await conn.execute(
                select(
                    func.row_to_json(literal_column(last_objects_meters.name)).label("meter"),
                    func.row_to_json(objects_calculation_data.table_valued()).label("calculation_data")
                ).select_from(object_limits.join(
                    last_objects_meters, onclause=last_objects_meters.c.object_id == object_limits.c.object_id
                ).join(
                    objects_calculation_data, onclause=objects_calculation_data.c.object_id == object_limits.c.object_id
                )).where(object_limits.c.object_id == obj['id'])
            )

            result.extend([row._asdict() for row in cursor.fetchall()])

    return web.json_response({"success": True, "system": current_subsystem, "items": result},
                             dumps=pretty_json)


class SubsystemDetailView(DetailView):
    model = subsystem

    async def get(self):
        # await asyncio.sleep(3)
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
        return web.json_response({"success": True, "item": current_data}, dumps=pretty_json)


class AreasListView(ListView):
    model = areas


class AreaDetailView(DetailView):
    model = areas


class CiphersListView(ListView):
    model = ciphers


class CipherDetailView(DetailView):
    model = ciphers


class RatesListView(ListView):
    model = rates

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            max_dates = select(rates_history.c.rate_id, func.max(rates_history.c.entry_date).label("entry_date")) \
                .group_by(rates_history.c.rate_id).alias("max_dates")
            dates_with_value = select(
                rates_history.c.rate_id, max_dates.c.entry_date, rates_history.c.value).select_from(
                max_dates.join(rates_history, and_(
                    rates_history.c.rate_id == max_dates.c.rate_id,
                    rates_history.c.entry_date == max_dates.c.entry_date
                ))
            ).alias("dates_with_value")
            cursor = await conn.execute(
                select(rates, dates_with_value.c.entry_date, dates_with_value.c.value).select_from(
                    rates.join(dates_with_value, rates.c.id ==
                               dates_with_value.c.rate_id, isouter=True)
                ).order_by(rates.c.id)
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)


class RateDetailView(DetailView):
    model = rates


class MetersListView(ListView):
    model = meters


class MeterDetailView(DetailView):
    model = meters


class WorkshopsListView(ListView):
    model = workshops

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            subquery = select(subobjects, func.count(object_limits.c.subobject_id).label("objects_amount")).select_from(
                subobjects.join(object_limits)
            ).group_by(subobjects.c.id)
            query = select(
                self.model,
                func.count(workshops_subobjects.c.id).label("subobjects_amount"),
                func.sum(subquery.c.objects_amount).label("objects_amount")
            ).select_from(
                self.model.join(workshops_subobjects).join(subquery, isouter=True)
            ).group_by(self.model.c.id).order_by(self.model.c.id)
            cursor = await conn.execute(query)
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)


class WorkshopDetailView(DetailView):
    model = workshops


class ObjectsListView(ListView):
    model = objects

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            object_meters_keys = [
                object_meters.c[key] for key in object_meters.c.keys() if key != "meter_id"
            ]
            last_objects_meters_ids = select(func.max(object_meters.c.id).label("id")).group_by(
                object_meters.c.object_id).order_by("id")
            last_objects_meters = select(
                *object_meters_keys, func.row_to_json(meters.table_valued()).label("type")
            ).where(object_meters.c.id.in_(last_objects_meters_ids)).select_from(
                object_meters.join(meters, isouter=True)
            ).alias("meter")
            object_keys = [
                objects.c[key] for key in objects.columns.keys() if key not in ["area_id", "cipher_id"]
            ]
            smtm = select(
                *object_keys,
                func.row_to_json(ciphers.table_valued()).label("cipher"),
                func.row_to_json(areas.table_valued()).label("area"),
                func.row_to_json(
                    literal_column(last_objects_meters.name)
                ).label("meter"),
                func.row_to_json(addresses.table_valued()).label("address"),
            ).select_from(
                objects.join(ciphers).join(areas, isouter=True).join(
                    last_objects_meters, isouter=True
                ).join(addresses, isouter=True)
            )

            if self.request.query.get("area"):
                smtm = smtm.where(
                    objects.c.area_id == int(self.request.query['area'])
                ).where(objects.c.is_closed.is_(False))
            if self.request.query.get('subobject'):
                smtm = smtm.join(object_limits).where(
                    object_limits.c.subobject_id == int(self.request.query['subobject'])
                )
            if self.request.query.get('renter'):
                smtm = smtm.join(object_limits).where(
                    object_limits.c.renter_id == int(self.request.query['renter']),
                )
            if self.request.query.get('limit'):
                smtm = smtm.join(object_limits).where(object_limits.c.limit_id == int(self.request.query['limit']))
            cursor = await conn.execute(smtm)
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)

    async def post(self):
        post_data = await self.request.json()
        async with self.request.app['db'].begin() as conn:
            cursor = await conn.execute(
                objects.insert().returning(literal_column('*')).values(**post_data)
            )
            result = dict(cursor.fetchone())
            return web.json_response({"success": True, "item": result}, dumps=pretty_json)


class ObjectDetailView(DetailView):
    model = objects


class ObjectMetersListView(ListView):
    model = object_meters

    async def get(self):
        object_id = int(self.request.match_info['object_id'])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(self.model).where(
                    self.model.c.object_id == object_id
                )
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)

    async def post(self):
        object_id = int(self.request.match_info['object_id'])
        request_data = await self.request.json()
        if request_data['installation_date'] is not None:
            request_data['installation_date'] = datetime.strptime(
                request_data['installation_date'], "%Y-%m-%d"
            ).date()
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.insert().values(
                    object_id=object_id,
                    **request_data
                )
            )
            return web.json_response({"success": True})


class ObjectMeterDetailView(DetailView):
    model = object_meters

    async def get(self):
        object_id = int(self.request.match_info['object_id'])
        is_current = self.request.rel_url.path.split("/")[-1] == "current"
        async with self.request.app['db'].connect() as conn:
            if not is_current:
                object_meter_id = int(self.request.match_info['id'])
                query = select(object_meters).where(and_(
                    object_meters.c.object_id == object_id,
                    object_meters.c.id == object_meter_id
                ))
            else:
                query = select(object_meters).where(
                    object_meters.c.object_id == object_id
                ).order_by(desc(object_meters.c.id)).limit(1)
            cursor = await conn.execute(query)
            object_meter_item = cursor.fetchone()
            if not object_meter_item:
                return web.json_response({"success": False, "reason": "Не найдено"}, dumps=pretty_json)
            result = dict(object_meter_item)
            return web.json_response({"success": True, "item": result}, dumps=pretty_json)

    async def patch(self):
        object_meter_id = int(self.request.match_info['id'])
        request_data = await self.request.json()
        if request_data['installation_date'] is not None:
            request_data['installation_date'] = datetime.strptime(
                request_data['installation_date'], "%Y-%m-%d"
            ).date()
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                object_meters.update().where(
                    object_meters.c.id == object_meter_id
                ).values(**request_data)
            )
            return web.json_response({"success": True})


class LimitsListView(ListView):
    model = limits

    async def get(self):
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(select(
                self.model, func.count(
                    object_limits.c.id).label("objects_amount")
            ).select_from(
                self.model.join(object_limits)
            ).group_by(self.model.c.id).order_by(self.model.c.id))
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)


class LimitDetailView(DetailView):
    model = limits


class SubObjectsListView(LimitsListView):
    model = subobjects

    async def get(self):
        workshop_id = self.request.query.get("workshop")
        async with self.request.app['db'].connect() as conn:
            smtm = select(
                self.model, func.count(object_limits.c.id).label("objects_amount")
            ).select_from(
                self.model.join(object_limits, isouter=True)
            ).group_by(self.model.c.id).order_by(self.model.c.id)
            if workshop_id:
                smtm = smtm.join(workshops_subobjects).where(workshops_subobjects.c.workshop_id == int(workshop_id))
            cursor = await conn.execute(smtm)
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)


class WorkshopSubObjectsListView(ListView):
    model = workshops_subobjects

    async def get(self):
        workshop_id = int(self.request.match_info['id'])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(self.model).where(self.model.c.workshop_id == workshop_id).order_by(self.model.c.id)
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result}, dumps=pretty_json)

    async def post(self):
        workshop_id = int(self.request.match_info['id'])
        subobject_id = int(self.request.match_info['sub_id'])
        async with self.request.app['db'].begin() as conn:
            await conn.execute(self.model.insert().values(workshop_id=workshop_id, subobject_id=subobject_id))
            return web.json_response({"success": True}, dumps=pretty_json)

    async def delete(self):
        workshop_id = int(self.request.match_info['id'])
        subobject_id = int(self.request.match_info['sub_id'])
        async with self.request.app['db'].begin() as conn:
            await conn.execute(delete(self.model).where(and_(
                self.model.c.workshop_id == workshop_id,
                self.model.c.subobject_id == subobject_id
            )))
            return web.json_response({"success": True}, dumps=pretty_json)


class ObjectsSubRentersListView(ListView):
    model = objects_subrenters

    async def get(self):
        object_id = int(self.request.match_info['object_id'])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(self.model.c.is_local, objects).where(self.model.c.object_id == object_id).select_from(
                    self.model.join(objects, self.model.c.subrenter_id == objects.c.id)
                )
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({'success': True, "items": result})

    async def post(self):
        post_data = await self.request.json()
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.insert().values(**post_data)
            )
        return web.json_response({"success": True, "message": "created"}, dumps=pretty_json)

    async def delete(self):
        object_id = int(self.request.match_info['object_id'])
        sub_id = int(self.request.match_info['sub_id'])
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                delete(self.model).where(and_(
                    self.model.c.object_id == object_id,
                    self.model.c.subrenter_id == sub_id
                ))
            )
        return web.json_response({"success": True}, dumps=pretty_json)


class SubObjectDetailView(DetailView):
    model = subobjects


class BanksListView(ListView):
    model = banks


class BankDetailView(DetailView):
    model = banks


class RentersListView(ListView):
    model = renters

    async def post(self):
        post_data = await self.request.json()
        if post_data.get("contract_date", None):
            post_data['contract_date'] = datetime.strptime(
                post_data['contract_date'], "%Y-%m-%d"
            ).date()
        async with self.request.app['db'].begin() as conn:
            await conn.execute(self.model.insert().values(**post_data))
            return web.json_response({"success": True})


class RenterDetailView(DetailView):
    model = renters

    async def patch(self):
        patch_data = await self.request.json()
        renter_id = int(self.request.match_info['id'])
        if patch_data.get("contract_date", None):
            patch_data['contract_date'] = datetime.strptime(
                patch_data['contract_date'], "%Y-%m-%d"
            ).date()
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.update().where(self.model.c.id == renter_id).values(**patch_data)
            )
            return web.json_response({"success": True})


class ObjectLimitsListView(ListView):
    model = object_limits

    async def get(self):
        object_id = int(self.request.match_info['id'])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(object_limits).where(object_limits.c.object_id ==
                                            object_id).order_by(object_limits.c.id)
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({"success": True, "items": result})

    async def post(self):
        post_data = await self.request.json()
        async with self.request.app['db'].begin() as conn:
            for data in post_data:
                insert_query = psql.insert(self.model).values(data)
                await conn.execute(insert_query.on_conflict_do_update(
                    index_elements=[self.model.c.id],
                    set_=insert_query.excluded
                ))
            return web.json_response({"success": True})


class ObjectLimitDetailView(DetailView):
    model = object_limits


class AddressesListView(ListView):
    model = addresses


class AddressDetailView(DetailView):
    model = addresses


class RatesHistoryListView(ListView):
    model = rates_history

    async def get(self):
        rate_id = int(self.request.match_info["id"])
        async with self.request.app['db'].connect() as conn:
            cursor = await conn.execute(
                select(self.model).where(self.model.c.rate_id == rate_id).order_by(
                    self.model.c.id
                )
            )
            result = [dict(row) for row in cursor.fetchall()]
            return web.json_response({'success': True, 'items': result}, dumps=pretty_json)

    async def post(self):
        request_data = await self.request.json()
        if request_data['entry_date'] is not None:
            request_data['entry_date'] = datetime.strptime(
                request_data['entry_date'], "%Y-%m-%d"
            ).date()
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.insert().values(**request_data)
            )
            return web.json_response({"success": True, 'message': "created"})


class RateHistoryDetailView(DetailView):
    model = rates_history

    async def patch(self):
        post_data = await self.request.json()
        if post_data['entry_date'] is not None:
            post_data['entry_date'] = datetime.strptime(
                post_data['entry_date'], "%Y-%m-%d"
            ).date()
        async with self.request.app['db'].begin() as conn:
            await conn.execute(
                self.model.update().values(**post_data).where(
                    self.model.c.id == post_data['id']
                )
            )
            return web.json_response({"success": True})


class CalculationDataListView(ListView):
    model = calculation_data


class CalculationDataDetailView(DetailView):
    model = calculation_data
