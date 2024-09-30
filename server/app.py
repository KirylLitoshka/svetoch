from aiohttp import web
from electricity.app import electricity_app
from warmth.app import warmth_app
from boiler.app import boiler_app
from middlewares import handle_json_error


def create_app():
    application = web.Application()
    application.add_subapp("/api/v1/warmth", warmth_app())
    application.middlewares.append(handle_json_error)
    return application


if __name__ == "__main__":
    web.run_app(create_app(), host="localhost", port=8000)
