import sqlalchemy as sa

__all__ = [
    "metadata", "subsystem", "banks", "rates", "rates_history",
    "workshops", "currency_coefficients", "reconciliation_codes",
    "objects", "renters", "renters_objects", "payments",
    "workshops_groups"
]

metadata = sa.MetaData()

subsystem = sa.Table(
    "subsystem", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False),
    sa.Column("month", sa.Integer, nullable=False),
    sa.Column("year", sa.Integer, nullable=False)
)

banks = sa.Table(
    "banks", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False, unique=True),
    sa.Column("code", sa.String, nullable=False, unique=True)
)

rates = sa.Table(
    "rates", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String),
    sa.Column("is_currency_coefficient_applied", sa.Boolean, default=False)
)

rates_history = sa.Table(
    "rates_history", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("rate_id", sa.Integer, sa.ForeignKey("rates.id", ondelete="CASCADE")),
    sa.Column("year", sa.Integer, nullable=False),
    sa.Column("month", sa.Integer, nullable=False),
    sa.Column("value_1", sa.Float, default=0),
    sa.Column("value_2", sa.Float, default=0)
)

workshops = sa.Table(
    "workshops", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False, unique=True),
    sa.Column("workshop_group_id", sa.Integer, sa.ForeignKey(
        "workshops_groups.id", ondelete="SET NULL"
    ), nullable=True)
)

currency_coefficients = sa.Table(
    "currency_coefficients", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("year", sa.Integer, nullable=False),
    sa.Column("month", sa.Integer, nullable=False),
    sa.Column("value_1", sa.Float, server_default="0"),
    sa.Column("value_2", sa.Float, server_default="0")
)

reconciliation_codes = sa.Table(
    "reconciliation_codes", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False)
)

objects = sa.Table(
    "objects", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False),
    sa.Column("code", sa.Integer, nullable=True),
    sa.Column("rate_id", sa.Integer, sa.ForeignKey("rates.id", ondelete="SET NULL")),
    sa.Column("workshop_id", sa.Integer, sa.ForeignKey("workshops.id", ondelete="SET NULL")),
    sa.Column("reconciliation_code_id", sa.Integer, sa.ForeignKey("reconciliation_codes.id", ondelete="SET NULL")),
    sa.Column("is_closed", sa.Boolean, default=False),
    sa.Column("is_meter_unavailable", sa.Boolean, default=False),
    sa.Column("vat", sa.Float, default=0)
)

renters = sa.Table(
    "renters", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("name", sa.String, nullable=False),
    sa.Column("full_name", sa.String, nullable=False),
    sa.Column("bank_id", sa.Integer, sa.ForeignKey(
        "banks.id", ondelete="SET NULL"), nullable=True),
    sa.Column("checking_account", sa.String, nullable=True),
    sa.Column("registration_number", sa.String, nullable=True),
    sa.Column("respondent_number", sa.String, nullable=True),
    sa.Column("contract_number", sa.String, nullable=True),
    sa.Column("contract_date", sa.Date, nullable=True),
    sa.Column("is_bank_payer", sa.Boolean, nullable=False),
    sa.Column("address", sa.String, nullable=True),
    sa.Column("contacts", sa.String, nullable=True),
    sa.Column("is_public_sector", sa.Boolean, default=False),
    sa.Column("is_heating_available", sa.Boolean, default=False),
    sa.Column("heating_load", sa.Float, nullable=True),
    sa.Column("is_water_heating_available", sa.Boolean, default=False),
    sa.Column("water_heating_load", sa.Float, nullable=True),
    sa.Column("is_closed", sa.Boolean, default=False),
)

renters_objects = sa.Table(
    "renters_objects", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("renter_id", sa.Integer, sa.ForeignKey("renters.id", ondelete="CASCADE")),
    sa.Column("object_id", sa.Integer, sa.ForeignKey("objects.id", ondelete="CASCADE"))
)


payments = sa.Table(
    "payments", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("month", sa.Integer, nullable=False),
    sa.Column("year", sa.Integer, nullable=False),
    sa.Column("object_id", sa.Integer, sa.ForeignKey("objects.id", ondelete="CASCADE")),
    sa.Column("payment_type", sa.Integer, nullable=False),
    sa.Column("ncen", sa.Integer, nullable=False),
    sa.Column("applied_rate_value", sa.Float, nullable=False),
    sa.Column("heating_value", sa.Float, nullable=False),
    sa.Column("heating_cost", sa.Float, nullable=False),
    sa.Column("water_heating_value", sa.Float, nullable=False),
    sa.Column("water_heating_cost", sa.Float, nullable=False)
)

workshops_groups = sa.Table(
    "workshops_groups", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False)
)
