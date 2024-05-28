from aiohttp import web

from utils import on_shutdown, on_startup, init_app_context_data
from warmth.routes import routes


def warmth_app():
    application = web.Application()
    application["app_name"] = "warmth"
    application.on_startup.append(on_startup)
    application.on_startup.append(init_app_context_data)
    application.on_shutdown.append(on_shutdown)
    application.add_routes(routes)
    return application
