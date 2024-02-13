from aiohttp import web
import aiofiles
from utils import MONTHS


async def build_consolidated_report(report_data, month, year, currency_coefficient):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/consolidated_report.txt"
    title_line = "│{:3d}│{:26s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    sub_line = "│{:3s}│ - {:23s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    empty_line = "│{:3s}│{:26s}│{:12s}│{:14s}│{:12s}│{:14s}│{:12s}│{:14s}│"
    end_line = "│{:3s}│{:26s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    total = {
        "heating_value": sum([item['heating_value'] for item in report_data]),
        "heating_cost": sum([item['heating_cost'] for item in report_data]),
        "water_heating_value": sum([item['water_heating_value'] for item in report_data]),
        "water_heating_cost": sum([item['water_heating_cost'] for item in report_data]),
        "value": sum([item['value'] for item in report_data]),
        "cost": sum([item['cost'] for item in report_data])
    }
    main_content = ""
    for index, item in enumerate(report_data):
        entries = item.pop('includes')
        main_content += title_line.format(index + 1, *item.values()) + "\n"
        for entry in entries:
            main_content += sub_line.format("", *entry.values()) + "\n"
        main_content += empty_line.format(*[""] * 8)
        if index != len(report_data) - 1:
            main_content += "\n"
    end_content = end_line.format("", "Итого", *total.values())

    async with aiofiles.open(file_path, mode="r", encoding="utf8") as fp:
        template_data = await fp.read()
    data = template_data.format(month, year, currency_coefficient['value_1'], main_content, end_content)
    return web.json_response(
        data={"success": True, "item": data},
        content_type="application/octet-stream",
        headers={"Content-Disposition": "attachment;filename=report.txt"}
    )


async def build_workshop_report(data, month, year):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/workshop_report.txt"
    line = '│{:27s}│{:11.4f}│{:11.2f}│{:11.4f}│{:11.2f}│{:11.4f}│{:11.2f}│'
    main_content = ""
    for index, row in enumerate(data['payments']):
        main_content += line.format(*row.values())
        main_content += "" if index == len(data['payments']) - 1 else "\n"
    end_line = line.format("Итого", *data['total'].values())
    async with aiofiles.open(file_path, mode="r", encoding="utf8") as fp:
        template_data = await fp.read()
    data = template_data.format(data['title'], month, year, main_content, end_line)
    return web.json_response(
        data={"success": True, "item": data},
        content_type="application/octet-stream",
        headers={"Content-Disposition": "attachment;filename=workshop_report.txt"}
    )


async def build_renter_short_report(report_data, month, year):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/renter_short_report.txt"
    line = '│{:3s}│{:18s}│{:3s}│{:13.4f}│{:13.2f}│{:13.2f}│{:13.2f}│{:13.2f}│'
    end_line = '│{:22s}│{:3s}│{:13.4f}│{:13.2f}│{:13.2f}│{:13.2f}│{:13.2f}│'
    content = ""

    for index, row in enumerate(report_data):
        total_value = row['heating_value'] + row['water_heating_value']
        total_cost = row['heating_cost'] + row['water_heating_cost']
        total_currency_coefficient = row['heating_currency_coefficient'] + row['water_heating_currency_coefficient']
        total_vat = row['heating_vat'] + row['water_heating_vat']
        total = total_cost + total_currency_coefficient + total_vat
        row_heating_summary = row['heating_cost'] + row['heating_vat'] + row['heating_currency_coefficient']
        row_water_heating_summary = (
                row['water_heating_cost'] + row['water_heating_vat'] + row['water_heating_currency_coefficient']
        )
        content += line.format(
            str(row['id']), row['renter_title'][:18], "", total_value,
            total_cost, total_currency_coefficient, total_vat, total
        ) + "\n"
        content += line.format(
            "", "", "Отп", row['heating_value'], row['heating_cost'],
            row['heating_currency_coefficient'], row['heating_vat'], row_heating_summary
        ) + "\n"
        content += line.format(
            "", "", "ГВС", row['water_heating_value'], row['water_heating_cost'],
            row['water_heating_currency_coefficient'], row['water_heating_vat'], row_water_heating_summary
        )
        if index != len(report_data) - 1:
            content += "\n"

    summary = {
        "heating": {
            "cost": sum([row['heating_cost'] for row in report_data]),
            "vat": sum([row['heating_vat'] for row in report_data]),
            "currency": sum([row['heating_currency_coefficient'] for row in report_data])
        },
        "water": {
            "cost": sum([row['water_heating_cost'] for row in report_data]),
            "vat": sum([row['water_heating_vat'] for row in report_data]),
            "currency": sum([row['water_heating_currency_coefficient'] for row in report_data])
        }
    }

    summary_content = end_line.format(
        "Всего начислено", "",
        sum([sum([row['heating_value'], row['water_heating_value']]) for row in report_data]),
        summary['heating']['cost'] + summary['water']['cost'],
        summary['heating']['currency'] + summary['water']['currency'],
        summary['heating']['vat'] + summary['water']['vat'],
        sum([*summary['heating'].values(), *summary['water'].values()])
    ) + "\n"
    summary_content += end_line.format(
        "в том числе отопление.", "Гкл",
        sum([row['heating_value'] for row in report_data]),
        summary['heating']['cost'], summary['heating']['currency'],
        summary['heating']['vat'], sum(summary["heating"].values())
    ) + "\n"
    summary_content += end_line.format(
        "в том числе подог.воды", "Гкл",
        sum([row['water_heating_value'] for row in report_data]),
        summary['water']['cost'], summary['water']['currency'],
        summary['water']['vat'], sum(summary["water"].values())
    )

    async with aiofiles.open(file_path, mode="r", encoding="utf8") as fp:
        template_data = await fp.read()
    data = template_data.format(month, year, content, summary_content)

    return web.json_response(
        data={"success": True, "item": data},
        content_type="application/octet-stream",
        headers={"Content-Disposition": "attachment;filename=renters_report.txt"}
    )


async def build_renter_full_report(report_data, month, year):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/consolidated_report.txt"
    line = "│{:3s}│{:20s}│{3s}│{:7s}│{:8s}│{:5s}│{:9s}│{:9s}│{:11s}│{:9s}│{:10s}│{:11s}│"
    sub_line = "│  -│{:20s}│{3s}│{:7s}│{:8.5f}│{:5.2f}│{:9.4f}│{:9.5f}│{:11.2f}│{:9.2f}│{:10.2f}│{:11.2f}│"
