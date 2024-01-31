import pathlib
import os
import json

BASE_DIR = pathlib.Path(__file__).parent
OLD_DATA_DIR = os.path.join(BASE_DIR, "old")


def load_data(filename, is_old=False):
    filepath = os.path.join(BASE_DIR, filename)
    if is_old:
        filepath = os.path.join(OLD_DATA_DIR, filename)
    with open(filepath, encoding="utf8", mode="r") as f:
        objects = json.loads(f.read())
        if not objects:
            raise
    return objects


def save_data(filename, data):
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, encoding="utf8", mode="w") as f:
        json_data = json.dumps(data, ensure_ascii=False, indent=4)
        f.write(json_data)


def prepare_rates_data():
    old_rates_data = load_data("CENA1.json", True)
    result = []
    for rate in old_rates_data:
        result.append({
            "title": rate['H_HO'],
        })
    save_data("rates.json", result)


def prepare_rates_history_data():
    old_rates_history_data = load_data("TARI1.json", True)
    result = []
    for row in old_rates_history_data:
        result.append({
            "rate_id": int(row['T_KO']),
            "year": int(row['T_GG']),
            "month": int(row['T_MM']),
            "value_1": float(row['T_C1']),
            "value_2": float(row['T_C2'])
        })
    save_data("rates_history.json", result)


def prepare_workshops_data():
    old_data = load_data("CEXA1.json", is_old=True)
    old_data = sorted(old_data, key=lambda x: int(x['C_KO']))
    old_workshops_ids = {}
    result = []
    start_index = 1
    for row in old_data:
        if not row['C_HO']:
            continue
        old_workshops_ids[row['C_KO']] = start_index
        result.append({
            "title": row['C_HO'],
            "workshop_group_id": int(row['C_3']),
            "is_currency_coefficient_applied": bool(row["C_1"])
        })
        start_index += 1
    save_data("_old_workshops_ids.json", old_workshops_ids)
    save_data("workshops.json", result)


def prepare_currency_coefficients_data():
    old_data = load_data("VALU1.json", is_old=True)
    result = []
    for row in old_data:
        result.append({
            "year": int(row['K_G']),
            "month": int(row['K_M']),
            "value_1": float(row['K_K1']),
            "value_2": float(row['K_K2'])
        })
    save_data("currency_coefficients.json", result)


def prepare_codes_data():
    old_data = load_data("ENNA1.json", is_old=True)
    old_data = sorted(old_data, key=lambda x: int(x['X_KO']))
    keys = {}
    result = []
    for index, row in enumerate(old_data):
        keys[row['X_KO']] = index + 1
        result.append({
            "title": row['X_HO']
        })
    save_data("_old_codes_ids.json", keys)
    save_data("reconciliation_codes.json", result)


def prepare_required_objects_id():
    energy_file = load_data("ao441.json", is_old=True)
    foreign_data = load_data("DARE1.json", is_old=True)
    result = []
    for row in foreign_data:
        object_id = int(row['D_KKO'])
        if not object_id or object_id in [row['object_id'] for row in result]:
            continue
        result.append({
            "object_id": object_id,
            "vat": float(row['D_NDS'])
        })
    for row in energy_file:
        if int(row["KO"]) in [row['object_id'] for row in result]:
            continue
        result.append({
            "object_id": int(row['KO']),
            "vat": 0
        })
    save_data("_required_objects_ids.json", result)


def prepare_objects():
    prepare_required_objects_id()
    _required_objects_ids = load_data("_required_objects_ids.json")
    required_objects_ids = [row['object_id'] for row in _required_objects_ids]
    old_objects = load_data("SORG1.json", is_old=True)
    old_objects = sorted(old_objects, key=lambda x: int(x['KO']))
    old_workshops_ids = load_data("_old_workshops_ids.json")
    index = 1
    old_objects_ids = {}
    result = []
    for row in old_objects:
        if int(row['KO']) not in required_objects_ids:
            continue
        temp_obj = next((item for item in _required_objects_ids if item['object_id'] == int(row['KO'])), None)
        old_objects_ids[row['KO']] = index
        result.append(({
            "title": row['HO'],
            "code": int(row['KO']),
            "rate_id": int(row['CEN']),
            "workshop_id": old_workshops_ids[row['CEX']],
            "reconciliation_code_id": int(row['TEN']) if int(row['TEN']) else None,
            "is_closed": row['PRBL'] == "*",
            "vat": temp_obj['vat']
        }))
        index += 1
    save_data("_old_objects_ids.json", old_objects_ids)
    save_data("objects.json", result)


def prepare_renters_data():
    old_renters = load_data("AREN1.json", is_old=True)
    banks_ids = load_data("_old_banks_ids.json")
    old_renters_ids = {}
    result = []
    index = 1
    for row in old_renters:
        new_bank_id = None
        if not row["A_HO"] and not row['A_HHO']:
            continue
        for bank_id in banks_ids:
            if int(row['A_BNK']) in bank_id['old_ids']:
                new_bank_id = bank_id['new_id']
        old_renters_ids[row['A_KO']] = index
        result.append({
            "name": row['A_HO'] if row['A_HO'] else row['A_HHO'],
            "full_name": row['A_HHO'] if row['A_HHO'] else row['A_HO'],
            "bank_id": new_bank_id,
            "checking_account": row['A_RS'] if row['A_RS'] else None,
            "registration_number": row['A_UNN'] if row['A_UNN'] else None,
            "respondent_number": row['A_OKPO'] if row['A_OKPO'] else None,
            "contract_number": None,
            "contract_date": None,
            "is_bank_payer": bool(int(row['A_PVT'])),
            "address": row['A_ADR'] if row['A_ADR'] else None,
            "contacts": row['A_TEL'] if row['A_TEL'] else None,
            "is_public_sector": False,
            "is_closed": False
        })
        index += 1
    save_data("renters.json", result)
    save_data("_old_renters_ids.json", old_renters_ids)


def prepare_renters_objects_data():
    result = []
    old_ids = load_data("DARE1.json", is_old=True)
    old_renters_ids = load_data("_old_renters_ids.json")
    old_objects_ids = load_data("_old_objects_ids.json")
    for row in old_ids:
        if not int(row['D_KKO']):
            continue
        if row['D_KO'] not in old_renters_ids.keys():
            continue
        try:
            result.append({
                "renter_id": old_renters_ids[row['D_KO']],
                "object_id": old_objects_ids[row['D_KKO']]
            })
        except KeyError:
            continue
    save_data("renters_objects.json", result)


def main():
    prepare_rates_data()
    prepare_rates_history_data()
    prepare_workshops_data()
    prepare_currency_coefficients_data()
    prepare_codes_data()
    prepare_objects()
    prepare_renters_data()
    prepare_renters_objects_data()


if __name__ == "__main__":
    main()
