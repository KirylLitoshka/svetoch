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
                    heating_cost = round(payment['heating_cost'] * payment_coefficient, 2)
                    water_heating_cost = round(payment['water_heating_cost'] * payment_coefficient, 2)
                workshop['heating_cost'] += heating_cost
                workshop['water_heating_cost'] += water_heating_cost
                workshop['heating_value'] += payment['heating_value']
                workshop['water_heating_value'] += payment['water_heating_value']
                workshop['total_value'] += payment['heating_value'] + payment['water_heating_value']
                workshop['total_cost'] += heating_cost + water_heating_cost
        group['heating_value'] = sum([row['heating_value'] for row in group['workshops']])
        group['heating_cost'] = sum([row['heating_cost'] for row in group['workshops']])
        group['water_heating_value'] = sum([row['water_heating_value'] for row in group['workshops']])
        group['water_heating_cost'] = sum([row['water_heating_cost'] for row in group['workshops']])
        group['total_value'] = group['heating_value'] + group['water_heating_value']
        group['total_cost'] = group['heating_cost'] + group['water_heating_cost']
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


async def get_renters_report_calculations(data: dict, currency_coefficient: dict) -> dict:
    coefficient_value = currency_coefficient['value_1']
    for row in data:
        if row['heating_cost']:
            value_with_coefficient = row['heating_cost'] * coefficient_value
            row['heating_vat'] = round(value_with_coefficient / 100 * 20, 2)
            row['heating_currency_coefficient'] = round(value_with_coefficient - row['heating_cost'], 2)
        else:
            row['heating_currency_coefficient'] = 0
            row['heating_vat'] = 0
        if row['water_heating_cost']:
            value_with_coefficient = row['water_heating_cost'] * coefficient_value
            row['water_heating_vat'] = round(value_with_coefficient / 100 * 20, 2)
            row['water_heating_currency_coefficient'] = round(value_with_coefficient - row['water_heating_cost'], 2)
        else:
            row['water_heating_currency_coefficient'] = 0
            row['water_heating_vat'] = 0
    return data


async def get_detailed_renters_report_calculation(data, currency_coefficient):
    coefficient_value = currency_coefficient['value_1']
    for renter in data:
        for obj in renter['includes']:
            for payment in obj['payments']:
                if payment['heating_cost']:
                    value_with_coefficient = payment['heating_cost'] * coefficient_value
                    payment['heating_vat'] = round(value_with_coefficient / 100 * 20, 2)
                    payment['heating_currency_coefficient'] = round(value_with_coefficient - payment['heating_cost'], 2)
                else:
                    payment['heating_currency_coefficient'] = 0
                    payment['heating_vat'] = 0
                if payment['water_heating_cost']:
                    value_with_coefficient = payment['water_heating_cost'] * coefficient_value
                    payment['water_heating_vat'] = round(value_with_coefficient / 100 * 20, 2)
                    payment['water_heating_currency_coefficient'] = round(
                        value_with_coefficient - payment['water_heating_cost'], 2)
                else:
                    payment['water_heating_currency_coefficient'] = 0
                    payment['water_heating_vat'] = 0
    return data
