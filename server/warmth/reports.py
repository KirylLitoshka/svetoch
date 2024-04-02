from aiohttp import web
import aiofiles
from utils import MONTHS


async def build_consolidated_report(report_data, month, year, currency_coefficient):
    """
    Построитель сводной ведомости
    """
    month = MONTHS[month - 1]
    file_path = "warmth/reports/templates/consolidated_report.txt"
    output_file_path = "warmth/reports/out/consolidated_report.txt"
    title_line = "│{:3d}│{:26s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    sub_line = "│{:3s}│ - {:23s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    empty_line = "│{:3s}│{:26s}│{:12s}│{:14s}│{:12s}│{:14s}│{:12s}│{:14s}│"
    end_line = "│{:3s}│{:26s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    total = {
        "heating_value": sum([item['heating_value'] for item in report_data]),
        "heating_cost": sum([item['heating_cost'] for item in report_data]),
        "water_heating_value": sum([item['water_heating_value'] for item in report_data]),
        "water_heating_cost": sum([item['water_heating_cost'] for item in report_data]),
        "total_value": sum([item['total_value'] for item in report_data]),
        "total_cost": sum([item['total_cost'] for item in report_data])
    }
    main_content = ""
    for index, item in enumerate(report_data):
        entries = item.pop('workshops')
        main_content += title_line.format(index + 1, *item.values()) + "\n"
        for entry in entries:
            for key in ['id', 'workshop_group_id', 'is_currency_coefficient_applied']:
                entry.pop(key)
            main_content += sub_line.format("", *entry.values()) + "\n"
        main_content += empty_line.format(*[""] * 8)
        if index != len(report_data) - 1:
            main_content += "\n"
    end_content = end_line.format("", "Итого", *total.values())

    async with aiofiles.open(file_path, mode="r", encoding="utf8") as fp:
        template_data = await fp.read()
    data = template_data.format(month, year, currency_coefficient['value_1'], main_content, end_content)
    async with aiofiles.open(output_file_path, mode="w", encoding="utf8") as output_fp:
        await output_fp.write(data)
    return web.FileResponse(
        path=output_file_path,
        status=200,
        headers={"Content-Disposition": "attachment;filename=report.txt"}
    )


async def build_workshop_report(data, month, year):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/templates/workshop_report.txt"
    output_file_path = f"warmth/reports/out/workshop_report.txt"
    line = '│{:27s}│{:11.4f}│{:11.2f}│{:11.4f}│{:11.2f}│{:11.4f}│{:11.2f}│'
    main_content = ""
    for index, row in enumerate(data['objects']):
        main_content += line.format(*row.values())
        main_content += "" if index == len(data['objects']) - 1 else "\n"
    end_line = line.format("Итого", *list(data.values())[3:])
    async with aiofiles.open(file_path, mode="r", encoding="utf8") as fp:
        template_data = await fp.read()
    data = template_data.format(data['title'], month, year, main_content, end_line)
    async with aiofiles.open(output_file_path, mode="w", encoding="utf8") as output_fp:
        await output_fp.write(data)
    return web.FileResponse(
        output_file_path,
        status=200,
        headers={"Content-Disposition": "attachment;filename=report.txt"}
    )


async def build_renter_short_report(report_data, month, year):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/templates/renter_short_report.txt"
    output_file_path = f"warmth/reports/out/renter_short_report.txt"
    line = '│{:3s}│{:18s}│{:3s}│{:13.4f}│{:13.2f}│{:13.2f}│{:13.2f}│{:13.2f}│'
    end_line = '│{:22s}│{:3s}│{:13.4f}│{:13.2f}│{:13.2f}│{:13.2f}│{:13.2f}│'
    content, end_content = "", ""

    for index, row in enumerate(report_data):
        content += line.format(
            str(row['id']), row['title'][:18], "",
            round(row['heating']['value'] + row['water_heating']['value'], 4),
            round(row['heating']['cost'] + row['water_heating']['cost'], 2),
            round(row['heating']['coefficient'] + row['water_heating']['coefficient'], 2),
            round(row['heating']['vat'] + row['water_heating']['vat'], 2),
            round(row['heating']['total'] + row['water_heating']['total'], 2)
        ) + "\n"
        if row['heating']['total'] or row['heating']['cost']:
            content += line.format(
                "", "", "Отп",
                round(row['heating']['value'], 4), round(row['heating']['cost'], 2),
                round(row['heating']['coefficient'], 2), round(row['heating']['vat'], 2),
                round(row['heating']['total'], 2)
            ) + "\n"
        if row['water_heating']['total'] or row['water_heating']['cost']:
            content += line.format(
                "", "", "ГВС",
                round(row['water_heating']['value'], 4), round(row['water_heating']['cost'], 2),
                round(row['water_heating']['coefficient'], 2), round(row['water_heating']['vat'], 2),
                round(row['water_heating']['total'], 2)
            ) + "\n"
    content += '│{:3s}│{:18s}│{:3s}│{:13s}│{:13s}│{:13s}│{:13s}│{:13s}│'.format("", "", "", "", "", "", "", "")

    end_content += end_line.format(
        "Всего начислено", "",
        round(sum([row['heating']['value'] + row['water_heating']['value'] for row in report_data]), 4),
        round(sum([row['heating']['cost'] + row['water_heating']['cost'] for row in report_data]), 2),
        round(sum([row['heating']['coefficient'] + row['water_heating']['coefficient'] for row in report_data]), 2),
        round(sum([row['heating']['vat'] + row['water_heating']['vat'] for row in report_data]), 2),
        round(sum([row['heating']['total'] + row['water_heating']['total'] for row in report_data]), 2)
    ) + "\n"
    end_content += end_line.format(
        "в том числе отопление.", "Гкл",
        round(sum([row['heating']['value'] for row in report_data]), 4),
        round(sum([row['heating']['cost'] for row in report_data]), 2),
        round(sum([row['heating']['coefficient'] for row in report_data]), 2),
        round(sum([row['heating']['vat'] for row in report_data]), 2),
        round(sum([row['heating']['total'] for row in report_data]), 2)
    ) + "\n"
    end_content += end_line.format(
        "в том числе подог.воды", "Гкл",
        round(sum([row['water_heating']['value'] for row in report_data]), 4),
        round(sum([row['water_heating']['cost'] for row in report_data]), 2),
        round(sum([row['water_heating']['coefficient'] for row in report_data]), 2),
        round(sum([row['water_heating']['vat'] for row in report_data]), 2),
        round(sum([row['water_heating']['total'] for row in report_data]), 2)
    )
    async with aiofiles.open(file_path, mode="r", encoding="utf8") as fp:
        template_data = await fp.read()
    data = template_data.format(month, year, content, end_content)
    async with aiofiles.open(output_file_path, mode="w", encoding="utf8") as output_fp:
        await output_fp.write(data)
    return web.FileResponse(
        output_file_path,
        status=200,
        headers={"Content-Disposition": "attachment;filename=report.txt"}
    )


async def build_renter_full_report(renter_payments, month, year):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/templates/renter_full_report.txt"
    output_file_path = f"warmth/reports/out/renter_full_report.txt"
    line = "│{:6s}│{:20s}│{:3s}│{:8s}│{:8s}│{:5s}│{:9s}│{:9s}│{:11s}│{:9s}│{:10s}│{:11s}│"
    sub_line = "│     -│{:20s}│{:3s}│{:8s}│{:8.5f}│{:5.2f}│{:9s}│{:9s}│{:11.2f}│{:9s}│{:10.2f}│{:11.2f}│"
    content = ""

    for renter in renter_payments:
        content += line.format(str(renter['id']), renter['name'], *[""] * 10) + "\n"
        for payment in renter['payments']:
            payment_period = f"{payment['payment_month']}.{payment['payment_year']}"
            if payment['is_additional_coefficient_applied']:
                coefficient = payment['additional_coefficient_value']
            else:
                coefficient = payment['coefficient_value']
            if payment['heating_cost']:
                value_with_coefficient = payment['heating_cost'] * coefficient
                vat = value_with_coefficient / 100 * payment['vat'] if payment['vat'] else 0
                payment_coefficient = value_with_coefficient - payment['heating_cost']
                total_cost = value_with_coefficient + vat
                content += sub_line.format(
                    payment['title'][:20],
                    "Отп",
                    payment_period,
                    coefficient,
                    payment['vat'],
                    str(round(payment['heating_value'], 4)),
                    str(round(payment['applied_rate_value'], 5)),
                    payment['heating_cost'],
                    str(round(payment_coefficient, 2)),
                    vat, total_cost
                ) + "\n"
            if payment['water_heating_cost']:
                value_with_coefficient = payment['water_heating_cost'] * coefficient
                vat = value_with_coefficient / 100 * payment['vat'] if payment['vat'] else 0
                payment_coefficient = value_with_coefficient - payment['water_heating_cost']
                total_cost = value_with_coefficient + vat
                content += sub_line.format(
                    payment['title'][:20],
                    "ГВС",
                    payment_period,
                    coefficient,
                    payment['vat'],
                    str(round(payment['water_heating_value'], 4)),
                    str(round(payment['applied_rate_value'], 6)),
                    payment['water_heating_cost'],
                    str(round(payment_coefficient, 2)),
                    vat, total_cost
                ) + "\n"
    content += line.format(*[""]*12)
    async with aiofiles.open(file_path, mode="r", encoding="utf8") as fp:
        template_data = await fp.read()
    data = template_data.format(month, year, content)
    async with aiofiles.open(output_file_path, mode="w", encoding="utf8") as output_fp:
        await output_fp.write(data)
    return web.FileResponse(
        output_file_path,
        status=200,
        headers={"Content-Disposition": "attachment;filename=report.txt"}
    )

#
#
# async def build_renters_payment_requirements(renters, year, month, currency_coefficient):
#     return web.json_response({"success": True, "items": {
#         "renters": renters,
#         "year": year,
#         "month": month,
#         "currency_coefficient": currency_coefficient
#     }})
