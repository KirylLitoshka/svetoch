from aiohttp import web
import aiofiles
from utils import MONTHS


async def build_consolidated_report(report_data, month, year):
    month = MONTHS[month - 1]
    file_path = f"warmth/reports/report.txt"
    title_line = "│{:3d}│{:26s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    sub_line = "│{:3s}│ - {:23s}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│"
    empty_line = "│{:3s}│{:26s}│{:12s}│{:14s}│{:12s}│{:14s}│{:12s}│{:14s}│"
    total = {
        "heating_value": sum([item['heating_value'] for item in report_data]),
        "heating_cost": sum([item['heating_cost'] for item in report_data]),
        "water_heating_value": sum([item['water_heating_value'] for item in report_data]),
        "water_heating_cost": sum([item['water_heating_cost'] for item in report_data]),
        "value": sum([item['value'] for item in report_data]),
        "cost": sum([item['cost'] for item in report_data])
    }
    async with aiofiles.open(file_path, mode="w+", encoding="utf8") as fp:
        await fp.write(
            f"\t\t\t\tHормированное потребление тепловой энергии в Гкалориях\n\t\t\t\t\t\tза {month} {year} года\n"
        )
        await fp.write("""
┌───┬──────────────────────────┬───────────────────────────┬───────────────────────────┬───────────────────────────┐
│N~ │                          │     О т о п л е н и е     │   Горячее водоснабжение   │     В   С   Е   Г   О     │
│п.п│         Hаименование     ├────────────┬──────────────┼────────────┬──────────────┼────────────┬──────────────┤
│   │                          │  Гкалорий  │    Рублей    │  Гкалорий  │    Рублей    │  Гкалорий  │    Рублей    │
├───┼──────────────────────────┼────────────┼──────────────┼────────────┼──────────────┼────────────┼──────────────┤
"""
                       )
        for index, item in enumerate(report_data):
            entries = item.pop('includes')
            await fp.write(title_line.format(index + 1, *item.values()) + "\n")
            for entry in entries:
                await fp.write(sub_line.format("", *entry.values()) + "\n")
            await fp.write(empty_line.format(*[""] * 8) + "\n")
        await fp.write(
"""├───┼──────────────────────────┼────────────┼──────────────┼────────────┼──────────────┼────────────┼──────────────┤
│   │                          │            │              │            │              │            │              │
│   │Итого                     │{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│{:12.4f}│{:14.2f}│
│   │                          │            │              │            │              │            │              │
└───┴──────────────────────────┴────────────┴──────────────┴────────────┴──────────────┴────────────┴──────────────┘
""".format(*total.values()))
        await fp.write("\n\n\tИнженер ОГЭ\t\t\t\t__________\t\t\t\tК.А.Гавриленко")
    return web.FileResponse(
        file_path,
        headers={
            "Content-Disposition": "attachment;filename=report.txt",
            "Content-Type": "application/octet-stream"
        }
    )
