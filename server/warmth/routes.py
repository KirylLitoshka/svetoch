from aiohttp import web
from warmth.views import *

routes = [
    web.route("GET", "/", SubsystemDetailView),
    web.route("PATCH", "/", SubsystemDetailView),
    web.route("GET", "/banks", BanksListView),
    web.route("POST", "/banks", BanksListView),
    web.route("GET", "/banks/{id}", BankDetailView),
    web.route("PATCH", "/banks/{id}", BankDetailView),
    web.route("DELETE", "/banks/{id}", BankDetailView),
    web.route("GET", "/rates", RatesListView),
    web.route("POST", "/rates", RatesListView),
    web.route("GET", "/rates/{id}", RatesDetailView),
    web.route("PATCH", "/rates/{id}", RatesDetailView),
    web.route("DELETE", "/rates/{id}", RatesDetailView),
    web.route("GET", "/rates/{rate_id}/history", RatesHistoryListView),
    web.route("POST", "/rates/{rate_id}/history", RatesHistoryListView),
    web.route("GET", "/rates/{rate_id}/history/{id}", RateHistoryDetailView),
    web.route("PATCH", "/rates/{rate_id}/history/{id}", RateHistoryDetailView),
    web.route("DELETE", "/rates/{rate_id}/history/{id}", RateHistoryDetailView),
    web.route("GET", "/workshops", WorkshopsListView),
    web.route("POST", "/workshops", WorkshopsListView),
    web.route("GET", "/workshops/{id}", WorkshopDetailView),
    web.route("PATCH", "/workshops/{id}", WorkshopDetailView),
    web.route("DELETE", "/workshops/{id}", WorkshopDetailView),
    web.route("GET", "/currency_coefficients", CurrencyCoefficientsListView),
    web.route("POST", "/currency_coefficients", CurrencyCoefficientsListView),
    web.route("GET", "/currency_coefficients/{id}", CurrencyCoefficientDetailView),
    web.route("PATCH", "/currency_coefficients/{id}", CurrencyCoefficientDetailView),
    web.route("DELETE", "/currency_coefficients/{id}", CurrencyCoefficientDetailView),
    web.route("GET", '/reconciliation_codes', ReconciliationCodesListView),
    web.route("POST", '/reconciliation_codes', ReconciliationCodesListView),
    web.route("GET", "/reconciliation_codes/{id}", ReconciliationCodeDetailView),
    web.route("PATCH", "/reconciliation_codes/{id}", ReconciliationCodeDetailView),
    web.route("DELETE", "/reconciliation_codes/{id}", ReconciliationCodeDetailView),
    web.route("GET", "/reconciliation_codes/{id}/payments", ReconciliationCodePayments),
    web.route("GET", "/objects", ObjectsListView),
    web.route("POST", "/objects", ObjectsListView),
    web.route("GET", "/objects/{id}", ObjectDetailView),
    web.route("PATCH", "/objects/{id}", ObjectDetailView),
    web.route("DELETE", "/objects/{id}", ObjectDetailView),
    web.route("GET", "/objects/{id}/payments", ObjectPaymentListView),
    web.route("POST", "/objects/{id}/payments", ObjectPaymentListView),
    web.route("PATCH", "/objects/{obj_id}/payments/{id}", ObjectPaymentsDetailView),
    web.route("DELETE", "/objects/{obj_id}/payments/{id}", ObjectPaymentsDetailView),
    web.route("GET", "/renters", RentersListView),
    web.route("POST", "/renters", RentersListView),
    web.route("GET", "/renters/{id}", RenterDetailView),
    web.route("PATCH", "/renters/{id}", RenterDetailView),
    web.route("DELETE", "/renters/{id}", RenterDetailView),
    web.route("GET", "/renters/{renter_id}/objects", RentersObjectsListView),
    web.route("POST", "/renters/{renter_id}/objects", RentersObjectsListView),
    web.route("DELETE", "/renters/{renter_id}/objects/{id}", RentersObjectsListView),
    web.route("GET", "/renters/{id}/payments", RenterPaymentListView),
    web.route("GET", "/workshops_groups", WorkshopsGroupsListView),
    web.route("POST", "/workshops_groups", WorkshopsGroupsListView),
    web.route("GET", "/workshops_groups/{id}", WorkshopsGroupDetailView),
    web.route("PATCH", "/workshops_groups/{id}", WorkshopsGroupDetailView),
    web.route("DELETE", "/workshops_groups/{id}", WorkshopsGroupDetailView),
    web.route("GET", "/reports/files/{name}", FileReportsView),
    web.route("POST", "/payments/:files", PaymentsUploadView),
]
