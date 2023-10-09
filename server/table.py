import aiofiles
import dbf


async def get_table_data(file, app_name):
    filepath = f"{app_name}/dbf/ao44.dbf"
    async with aiofiles.open(filepath, mode="wb") as fp:
        await fp.write(file.read())
        file.close()
    return await read_table_data(filepath)


async def read_table_data(filepath):
    with dbf.Table(filepath).open() as file:
        table_data = [dict(zip(file.field_names, row)) for row in file]
    if not table_data:
        raise
    return table_data
