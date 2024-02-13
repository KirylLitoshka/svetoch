async def get_renters_payments_calculations(coefficients, payments):
    result = []
    for payment in payments:
        current_row_index = next((
            i for i, item in enumerate(result) if
            item['month'] == payment['month'] and item['year'] == payment['year']
        ), None)
        payment_coefficients = next((
            item for item in coefficients if
            item['month'] == payment['month'] and item['year'] == payment['year']
        ), None)
        if payment_coefficients is None:
            raise Exception("Коэффициент на текущий месяц не обнаружен")
        current_row = {
            "month": payment['month'],
            "year": payment['year'],
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
        if current_row_index:
            current_row = result[current_row_index]
        if payment['heating_cost']:
            value_with_coefficient = payment['heating_cost'] * payment_coefficients['value_1']
            vat = value_with_coefficient / 100 * payment['vat']
            coefficient = value_with_coefficient - payment['heating_cost']
            total_cost = value_with_coefficient + vat
            current_row['total']['heating_value'] += payment['heating_value']
            current_row['total']['cost'] += payment['heating_cost']
            current_row['total']['coefficient'] += round(coefficient, 2)
            current_row['total']['vat'] += round(vat, 2)
            current_row['total']['total'] += round(total_cost, 2)
            current_row['includes'].append({
                "title": payment['title'],
                "type": "Отопление",
                "value": payment['heating_value'],
                "cost": payment['heating_cost'],
                "coefficient": round(coefficient, 2),
                "vat": round(vat, 2),
                "total": round(total_cost, 2)
            })
        if payment['water_heating_cost']:
            value_with_coefficient = payment['water_heating_cost'] * payment_coefficients['value_1']
            vat = value_with_coefficient / 100 * payment['vat']
            coefficient = value_with_coefficient - payment['water_heating_cost']
            total_cost = value_with_coefficient + vat
            current_row['total']['water_heating_value'] += payment['water_heating_value']
            current_row['total']['cost'] += payment['water_heating_cost']
            current_row['total']['coefficient'] += round(coefficient, 2)
            current_row['total']['vat'] += round(vat, 2)
            current_row['total']['total'] += round(total_cost, 2)
            current_row['includes'].append({
                "title": payment['title'],
                "type": "Подогрев",
                "value": payment['water_heating_value'],
                "cost": payment['water_heating_cost'],
                "coefficient": round(coefficient, 2),
                "vat": round(vat, 2),
                "total": round(total_cost, 2)
            })
        if not current_row_index:
            result.append(current_row)
    return result


async def get_workshops_calculation(data, currency_coefficient):
    output = []
    coefficient_value = currency_coefficient['value_1']
    for row in data:
        coefficient_applied = row.pop('is_currency_coefficient_applied')
        if coefficient_applied:
            row['heating_cost'] *= coefficient_value
            row['water_heating_cost'] *= coefficient_value
        row['value'] = row['heating_value'] + row['water_heating_value']
        row['cost'] = row['heating_cost'] + row['water_heating_cost']
        group_row_index = next((i for i, item in enumerate(output) if item['title'] == row['group_title']), None)
        if group_row_index is None:
            searched_row = {
                "title": row.pop('group_title'),
                "heating_value": 0,
                "heating_cost": 0,
                "water_heating_value": 0,
                "water_heating_cost": 0,
                "value": 0,
                "cost": 0,
                "includes": []
            }
            output.append(searched_row)
        else:
            row.pop('group_title')
            searched_row = output[group_row_index]
        searched_row['heating_value'] += row['heating_value']
        searched_row['heating_cost'] += row['heating_cost']
        searched_row['water_heating_value'] += row['water_heating_value']
        searched_row['water_heating_cost'] += row['water_heating_cost']
        searched_row['value'] += row['value']
        searched_row['cost'] += row['cost']
        searched_row['includes'].append(row)
    return output


async def get_calculation_by_workshop(data, currency_coefficient):
    coefficient_value = currency_coefficient['value_1']
    is_currency_coefficient_applied = data['is_currency_coefficient_applied']
    for row in data['payments']:
        if is_currency_coefficient_applied:
            row['heating_cost'] *= coefficient_value
            row['water_heating_cost'] *= coefficient_value
        row['value'] = row['heating_value'] + row['water_heating_value']
        row['cost'] = row['heating_cost'] + row['water_heating_cost']
    data['total'] = {
        "heating_value": sum([item['heating_value'] for item in data['payments']]),
        "heating_cost": sum([item['heating_cost'] for item in data['payments']]),
        "water_heating_value": sum([item['water_heating_value'] for item in data['payments']]),
        "water_heating_cost": sum([item['water_heating_cost'] for item in data['payments']]),
        "value": sum([item['value'] for item in data['payments']]),
        "cost": sum([item['cost'] for item in data['payments']])
    }
    return data


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
