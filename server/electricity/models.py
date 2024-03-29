import sqlalchemy as sa

__all__ = [
    "metadata", "subsystem",
    "areas", "ciphers", "rates", "rates_history",
    "meters", "workshops", "objects", "object_meters", "limits",
    "subobjects", "banks", "renters", "object_limits", "addresses",
    "calculation_data", "workshops_subobjects", "objects_subrenters",
    "objects_calculation_data"
]

metadata = sa.MetaData()

subsystem = sa.Table(
    "subsystem", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False),
    sa.Column("month", sa.Integer, nullable=False),
    sa.Column("year", sa.Integer, nullable=False)
)

areas = sa.Table(
    "areas", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False, unique=True)
)

ciphers = sa.Table(
    "ciphers", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("code", sa.String, nullable=True),
    sa.Column("title", sa.String, nullable=False),
    sa.Column("rate_id", sa.Integer, sa.ForeignKey(
        "rates.id", ondelete="SET NULL"), nullable=True
    )
)

rates = sa.Table(
    "rates", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False)
)

rates_history = sa.Table(
    "rates_history", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("rate_id", sa.Integer, sa.ForeignKey(
        "rates.id", ondelete="CASCADE")),
    sa.Column("entry_date", sa.Date, nullable=False),
    sa.Column("value", sa.Float, nullable=False),
    sa.UniqueConstraint("rate_id", "entry_date", name="idx_rate_id_entry_date")
)

meters = sa.Table(
    "meters", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False),
    sa.Column("capacity", sa.Integer, nullable=False),
)

workshops = sa.Table(
    "workshops", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, unique=True, nullable=False)
)

objects = sa.Table(
    "objects", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, nullable=False),
    sa.Column("cipher_id", sa.Integer, sa.ForeignKey(
        "ciphers.id", ondelete="SET NULL"), nullable=True),
    sa.Column("area_id", sa.Integer, sa.ForeignKey(
        "areas.id", ondelete="SET NULL"), nullable=True),
    sa.Column("subscriber_type", sa.Integer, nullable=False, default=1),
    sa.Column("is_closed", sa.Boolean),
    sa.Column("counting_point", sa.Integer, nullable=True),
    sa.Column("jeu_code", sa.String, nullable=True),
    sa.Column("address_id", sa.Integer, sa.ForeignKey(
        "addresses.id", ondelete="SET NULL"), nullable=True),
    sa.Column("house_number", sa.String, nullable=True),
    sa.Column("ee", sa.Integer, nullable=False, default=0)
)

object_meters = sa.Table(
    "object_meters", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("object_id", sa.Integer, sa.ForeignKey(
        "objects.id", ondelete="CASCADE")),
    sa.Column("meter_id", sa.Integer, sa.ForeignKey(
        "meters.id", ondelete="SET NULL"), nullable=True),
    sa.Column("number", sa.String, nullable=True),
    sa.Column("installation_date", sa.Date, nullable=True),
    sa.Column("last_reading", sa.Float, default=0.0),
    sa.Column("heating_percentage", sa.Float, default=0.0)
)

limits = sa.Table(
    "limits", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String, unique=True, nullable=False)
)

subobjects = sa.Table(
    "subobjects", metadata,
    sa.Column("id", sa.Integer, primary_key=True, unique=True),
    sa.Column("title", sa.String, unique=True, nullable=False)
)

workshops_subobjects = sa.Table(
    "workshops_subobjects", metadata,
    sa.Column("id", sa.Integer, primary_key=True, unique=True),
    sa.Column("workshop_id", sa.Integer, sa.ForeignKey(
        "workshops.id", ondelete="CASCADE"), nullable=True),
    sa.Column("subobject_id", sa.Integer, sa.ForeignKey(
        "subobjects.id", ondelete="CASCADE"), nullable=True)
)

banks = sa.Table(
    "banks", metadata,
    sa.Column("id", sa.Integer, primary_key=True, unique=True),
    sa.Column("title", sa.String, nullable=False),
    sa.Column("code", sa.String, nullable=False, unique=True)
)


"""
Renters Table:
id - идентификатор
name - краткое наименование
full_name - полное наименование организации
bank_id - идентификатор банка организации
checking_account - расчетный счет
registration_number - унп
respondent_number - номер респондента (окпо)
contract_number - номер договора
contract_date - дата заключения договора
is_bank_payer - для создания платежного поручения
address - адрес
contacts - контакты 
is_public_sector - ялвляется ли бюджетной организацией 
"""

renters = sa.Table(
    "renters", metadata,
    sa.Column("id", sa.Integer, primary_key=True, unique=True),
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
    sa.Column("is_closed", sa.Boolean, default=False),
    sa.UniqueConstraint("registration_number", "contract_number",
                        "contract_date", name="uniq_field")
)


object_limits = sa.Table(
    "object_limits", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("limit_id", sa.Integer, sa.ForeignKey(
        "limits.id", ondelete="SET NULL"), nullable=True),
    sa.Column("object_id", sa.Integer, sa.ForeignKey(
        "objects.id", ondelete="CASCADE")),
    sa.Column("subobject_id", sa.Integer, sa.ForeignKey(
        "subobjects.id", ondelete="CASCADE"), nullable=True),
    sa.Column("renter_id", sa.Integer, sa.ForeignKey(
        "renters.id", ondelete="CASCADE"), nullable=True),
    sa.Column("percentage", sa.Float, default=0)
)

addresses = sa.Table(
    "addresses", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("city_type", sa.String, nullable=False),
    sa.Column("city_name", sa.String, nullable=False),
    sa.Column("street_type", sa.String),
    sa.Column("street_name", sa.String)
)

calculation_data = sa.Table(
    "calculation_data", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("year", sa.Integer, nullable=False),
    sa.Column("month", sa.Integer, nullable=False),
    sa.Column("factor_1", sa.Float, nullable=False),
    sa.Column("factor_2", sa.Float, default=0),
    sa.Column("working_hours", sa.Integer, nullable=False),
    sa.Column("limit", sa.Integer, nullable=False)
)

objects_subrenters = sa.Table(
    "objects_subrenters", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("object_id", sa.Integer, sa.ForeignKey("objects.id", ondelete="CASCADE"), nullable=False),
    sa.Column("is_local", sa.Boolean, default=False),
    sa.Column("subrenter_id", sa.Integer, sa.ForeignKey("objects.id", ondelete="CASCADE"), nullable=False),
    sa.UniqueConstraint("object_id", "is_local", "subrenter_id", name="obj_rent_uuid")
)

objects_calculation_data = sa.Table(
    "objects_calculation_data", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("object_id", sa.Integer, sa.ForeignKey("objects.id", ondelete="CASCADE")),
    sa.Column("vat", sa.Integer, nullable=False, default=20),
    sa.Column("calculation_factor", sa.Integer, default=1),
    sa.Column("break_percentage", sa.Float, nullable=False, default=0.0)
)

