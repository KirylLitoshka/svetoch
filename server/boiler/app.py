from aiohttp import web

from utils import on_shutdown, on_startup


def boiler_app():
    application = web.Application()
    application["app_name"] = "boiler"
    application.on_startup.append(on_startup)
    application.on_shutdown.append(on_shutdown)
    return application
