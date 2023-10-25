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
