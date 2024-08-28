additional_calculation_values = {
    "heating_value": 0,
    "heating_cost": 0,
    "water_heating_value": 0,
    "water_heating_cost": 0,
    "total_value": 0,
    "total_cost": 0
}


async def get_workshops_calculation(workshops_groups):
    for group in workshops_groups:
        group.update(additional_calculation_values)
        for workshop in group['workshops']:
            workshop.update(additional_calculation_values)
            workshop_payment = workshop.pop("payments")
            for payment in workshop_payment:
                heating_cost = payment['heating_cost']
                water_heating_cost = payment['water_heating_cost']
                if workshop['is_currency_coefficient_applied']:
                    payment_coefficient = payment['value_1']
                    if payment['is_additional_coefficient_applied']:
                        payment_coefficient = payment['additional_coefficient_value']
                    heating_cost = round(round(payment['heating_cost'], 2) * payment_coefficient, 2)
                    water_heating_cost = round(round(payment['water_heating_cost'], 2) * payment_coefficient, 2)
                workshop['heating_cost'] += heating_cost
                workshop['water_heating_cost'] += water_heating_cost
                workshop['heating_value'] += payment['heating_value']
                workshop['water_heating_value'] += payment['water_heating_value']
                workshop['total_value'] += payment['heating_value'] + payment['water_heating_value']
                workshop['total_cost'] += heating_cost + water_heating_cost
        group['heating_value'] = sum([row['heating_value'] for row in group['workshops']])
        group['heating_cost'] = sum([round(row['heating_cost'], 2) for row in group['workshops']])
        group['water_heating_value'] = sum([row['water_heating_value'] for row in group['workshops']])
        group['water_heating_cost'] = sum([round(row['water_heating_cost'], 2) for row in group['workshops']])
        group['total_value'] = group['heating_value'] + group['water_heating_value']
        group['total_cost'] = round(group['heating_cost'] + group['water_heating_cost'], 2)
    return workshops_groups


async def get_workshop_objects_calculation(workshop_objects):
    for obj in workshop_objects['objects']:
        obj.update(additional_calculation_values)
        payments = obj.pop('payments')
        del obj['workshop_id']
        for payment in payments:
            heating_cost = payment['heating_cost']
            water_heating_cost = payment['water_heating_cost']
            if workshop_objects['is_currency_coefficient_applied']:
                payment_coefficient = payment['currency_coefficient']
                if payment['is_additional_coefficient_applied']:
                    payment_coefficient = payment['additional_coefficient_value']
                heating_cost = round(payment['heating_cost'] * payment_coefficient, 2)
                water_heating_cost = round(payment['water_heating_cost'] * payment_coefficient, 2)
            obj['heating_cost'] += heating_cost
            obj['water_heating_cost'] += water_heating_cost
            obj['heating_value'] += payment['heating_value']
            obj['water_heating_value'] += payment['water_heating_value']
            obj['total_value'] += payment['heating_value'] + payment['water_heating_value']
            obj['total_cost'] += heating_cost + water_heating_cost
    workshop_objects['heating_value'] = sum([row['heating_value'] for row in workshop_objects['objects']])
    workshop_objects['heating_cost'] = sum([row['heating_cost'] for row in workshop_objects['objects']])
    workshop_objects['water_heating_value'] = sum([row['water_heating_value'] for row in workshop_objects['objects']])
    workshop_objects['water_heating_cost'] = sum([row['water_heating_cost'] for row in workshop_objects['objects']])
    workshop_objects['total_value'] = workshop_objects['heating_value'] + workshop_objects['water_heating_value']
    workshop_objects['total_cost'] = workshop_objects['heating_cost'] + workshop_objects['water_heating_cost']
    return workshop_objects


async def get_renter_payments_calculation(renter_payments):
    payments_info = renter_payments[0]['payments']
    output_data = []
    for payment in payments_info:
        current_row_index = next((
            i for i, item in enumerate(output_data) if
            item['month'] == payment['operation_month'] and
            item['year'] == payment['operation_year']
        ), None)
        another_coefficient = payment['is_additional_coefficient_applied']
        coefficient = payment['additional_coefficient_value'] if another_coefficient else payment['coefficient_value']
        current_row = {
            "month": payment['operation_month'],
            "year": payment['operation_year'],
            "total": {
                "heating_value": 0,
                "water_heating_value": 0,
                "cost": 0,
                "coefficient": 0,
                "vat": 0,
                "total": 0
            },
            "includes": []
        }
        if current_row_index is not None:
            current_row = output_data[current_row_index]
        if payment['heating_cost']:
            value_with_coefficient = payment['heating_cost'] * coefficient
            vat = value_with_coefficient / 100 * payment['vat']
            payment_coefficient = value_with_coefficient - payment['heating_cost']
            total_cost = value_with_coefficient + vat
            current_row['total']['heating_value'] += payment['heating_value']
            current_row['total']['cost'] += payment['heating_cost']
            current_row['total']['coefficient'] += round(payment_coefficient, 2)
            current_row['total']['vat'] += round(vat, 2)
            current_row['total']['total'] += round(total_cost, 2)
            current_row['includes'].append({
                "title": payment['title'],
                "type": "Отопление",
                "value": payment['heating_value'],
                "cost": payment['heating_cost'],
                "coefficient": round(payment_coefficient, 2),
                "vat": round(vat, 2),
                "total": round(total_cost, 2)
            })
        if payment['water_heating_cost']:
            value_with_coefficient = payment['water_heating_cost'] * coefficient
            vat = value_with_coefficient / 100 * payment['vat']
            payment_coefficient = value_with_coefficient - payment['water_heating_cost']
            total_cost = value_with_coefficient + vat
            current_row['total']['water_heating_value'] += payment['water_heating_value']
            current_row['total']['cost'] += payment['water_heating_cost']
            current_row['total']['coefficient'] += round(payment_coefficient, 2)
            current_row['total']['vat'] += round(vat, 2)
            current_row['total']['total'] += round(total_cost, 2)
            current_row['includes'].append({
                "title": payment['title'],
                "type": "Подогрев",
                "value": payment['water_heating_value'],
                "cost": payment['water_heating_cost'],
                "coefficient": round(payment_coefficient, 2),
                "vat": round(vat, 2),
                "total": round(total_cost, 2)
            })
        if current_row_index is None:
            output_data.append(current_row)
    return output_data


async def get_reconciliation_codes_payments_calculation(codes):
    for code in codes:
        code['heating_value'] = sum([row['heating_value'] for row in code['payments']])
        code['heating_cost'] = sum([row['heating_cost'] for row in code['payments']])
        code['water_heating_value'] = sum([row['water_heating_value'] for row in code['payments']])
        code['water_heating_cost'] = sum([row['water_heating_cost'] for row in code['payments']])
    return codes


async def get_renter_payments_calculation_short(renter_payments):
    output_data = []
    payment_type_info = {
        "value": 0,
        "cost": 0,
        "coefficient": 0,
        "vat": 0,
        "total": 0
    }
    for renter in renter_payments:
        current_renter = {
            'id': renter['id'],
            'title': renter['name'],
            'heating': payment_type_info.copy(),
            'water_heating': payment_type_info.copy()
        }
        for payment in renter['payments']:
            if payment['is_additional_coefficient_applied']:
                coefficient = payment['additional_coefficient_value']
            else:
                coefficient = payment['coefficient_value']
            if payment['heating_cost']:
                value_with_coefficient = round(round(payment['heating_cost'], 2) * coefficient, 2)
                vat = round(value_with_coefficient / 100 * payment['vat'], 2)
                payment_coefficient = round(value_with_coefficient - round(payment['heating_cost'], 2), 2)
                total_cost = value_with_coefficient + vat
                current_renter['heating']['value'] += payment['heating_value']
                current_renter['heating']['cost'] += round(payment['heating_cost'], 2)
                current_renter['heating']['coefficient'] += payment_coefficient
                current_renter['heating']['vat'] += vat
                current_renter['heating']['total'] += total_cost
            if payment['water_heating_value']:
                value_with_coefficient = round(round(payment['water_heating_cost'], 2) * coefficient, 2)
                vat = round(value_with_coefficient / 100 * payment['vat'], 2)
                payment_coefficient = round(value_with_coefficient - round(payment['water_heating_cost'], 2), 2)
                total_cost = value_with_coefficient + vat
                current_renter['water_heating']['value'] += payment['water_heating_value']
                current_renter['water_heating']['cost'] += round(payment['water_heating_cost'], 2)
                current_renter['water_heating']['coefficient'] += payment_coefficient
                current_renter['water_heating']['vat'] += vat
                current_renter['water_heating']['total'] += total_cost
        output_data.append(current_renter)
    return output_data


async def get_renter_vat_calculations(renter_payments):
    for renter in renter_payments:
        for payment in renter['payments']:
            coefficient = payment['coefficient_value']
            if payment['is_additional_coefficient_applied']:
                coefficient = payment['additional_coefficient_value']
            total = round(payment['heating_cost'], 2) + round(payment['water_heating_cost'], 2)
            value_with_coefficient = round(total * coefficient, 2)
            payment['vat_value'] = round(value_with_coefficient / 100 * payment['vat'] if payment['vat'] else 0, 2)
            payment['currency_cost'] = round(value_with_coefficient - total, 2)
            payment['total_cost'] = round(value_with_coefficient + payment['vat_value'], 2)
    return renter_payments


async def get_renter_detailed_calculation(renters_payments):
    for renter in renters_payments:
        for payment in renter['payments']:
            heating_details = build_detailed_payment_calculation(payment, "heating")
            water_heating_details = build_detailed_payment_calculation(payment, "water_heating")
            payment.update(heating_details)
            payment.update(water_heating_details)
    return renters_payments


def build_detailed_payment_calculation(payment, key):
    coefficient = payment['coefficient_value']
    if payment['is_additional_coefficient_applied']:
        coefficient = payment['additional_coefficient_value']
    cost_with_coefficient = round(round(payment[f'{key}_cost'], 2) * coefficient, 2)
    coefficient_value = round(cost_with_coefficient - round(payment[f'{key}_cost'], 2), 2)
    vat_cost = round(cost_with_coefficient / 100 * payment['vat'] if payment['vat'] else 0, 2)
    total_cost = round(cost_with_coefficient + vat_cost, 2)
    return {
        f"{key}_cost_with_coefficient": cost_with_coefficient,
        f"{key}_coefficient_value": coefficient_value,
        f"{key}_vat_cost": vat_cost,
        f"{key}_total_cost": total_cost
    }


async def calculate_communal_objects_values(communal_objects_ids, objects_payments: list):
    output_result = {}
    for obj_id in communal_objects_ids:
        output_result[str(obj_id)] = {"heating": 0, "water_heating": 0}
        if obj_id % 100 == 0:
            object_payments = list(filter(
                lambda payment: payment['code'] in [obj_id, obj_id + 99], objects_payments)
            )
        else:
            object_payments = list(filter(
                lambda payment: payment['code'] == obj_id, objects_payments)
            )
        print(object_payments)
        for object_payment in object_payments:
            if object_payment['is_heating_available']:
                output_result[str(obj_id)]['heating'] += object_payment['heating_value']
            if object_payment['is_water_heating_available']:
                output_result[str(obj_id)]['water_heating'] += object_payment['water_heating_value']
    return output_result
