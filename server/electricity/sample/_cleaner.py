import json
import os
import pathlib

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


def create_objects_meters():
    objects = load_data("objects.json")
    object_meters = []
    for index, obj in enumerate(objects):
        object_meter = {
            "object_id": index + 1,
            "meter_id": obj.pop("meter_id"),
            "meter_number": obj.pop("meter_number"),
            "meter_installation_date": obj.pop("meter_installation_date"),
            "meter_last_reading": obj.pop("meter_last_reading"),
            "meter_heating_percentage": obj.pop("meter_heating_percentage")
        }
        object_meters.append(object_meter)
    save_data("objects.json", objects)
    save_data("object_meters.json", object_meters)


def update_objects_area_index(objects_list: list):
    areas_ids = load_data("_old_areas_ids.json")
    for item in objects_list:
        if item['area_id'] is None:
            continue
        item["area_id"] = areas_ids[item['area_id']]


def remove_unnecessary_keys(lst):
    for item in lst:
        del item["D_IRA"]
        del item["D_VID"]
        del item["E_DM"]
        del item["E_DM1"]
        del item['E_DOM']
        del item['E_SAT']
        del item['E_ULI']


def update_objects_fields(lst):
    for item in lst:
        item['title'] = item.pop("HO")
        item['cipher_id'] = item.pop("KKO")
        item['area_id'] = item.pop("CEXX")
        item['meter_id'] = item.pop("D_KSC")
        item['meter_number'] = item.pop("D_NSC")
        item["meter_installation_date"] = item.pop("D_DSC")
        item['meter_heating_percentage'] = item.pop("D_PRO")
        item['meter_last_reading'] = item.pop("D_NAC")
        item['calculation_factor'] = item.pop("D_KOE")
        item['subscriber_type'] = item.pop("D_SAB")
        item['break_percentage'] = item.pop("D_PRZ")
        item['counting_point'] = item.pop("TU")
        item['is_closed'] = item.pop("PR_BL")
        item['jeu_code'] = item.pop("E_JEU")
        item['address_id'] = None
        item['house_number'] = None
        item['ee'] = item.pop("E_EE")


def update_objects_fields_type(lst):
    for item in lst:
        if not item['meter_id'] or item['meter_id'] == "999" or item['meter_id'] == "499":
            item['meter_id'] = None
        else:
            item['meter_id'] = int(item['meter_id'])
        if not item['meter_heating_percentage']:
            item['meter_heating_percentage'] = 0
        else:
            item['meter_heating_percentage'] = float(
                item['meter_heating_percentage'])
        if item['is_closed']:
            item['is_closed'] = True
        else:
            item['is_closed'] = False
        if not item['counting_point'] or item['counting_point'] == "0":
            item['counting_point'] = None
        else:
            item['counting_point'] = int(item['counting_point'])
        if not item['calculation_factor']:
            item['calculation_factor'] = 1
        else:
            item['calculation_factor'] = int(item['calculation_factor'])
        if not item['ee']:
            item['ee'] = 0
        else:
            item['ee'] = int(item['ee'])
        if not item['meter_last_reading']:
            item['meter_last_reading'] = 0.00
        else:
            item['meter_last_reading'] = float(item['meter_last_reading'])
        if not item['break_percentage']:
            item['break_percentage'] = 0
        else:
            item['break_percentage'] = float(item['break_percentage'])
        if not item['subscriber_type']:
            item['subscriber_type'] = 0
        else:
            item['subscriber_type'] = int(item['subscriber_type'])
        if not item['meter_number'] or item['meter_number'] == "нет":
            item['meter_number'] = None
        elif item['meter_number'] == 'перерасчет' or "уст" in item['meter_number']:
            item['meter_number'] = None
        if item['meter_installation_date'] == '.  .':
            item['meter_installation_date'] = None
        if item['area_id'] == "" or item['area_id'] == "99":
            item['area_id'] = None
        if not item['jeu_code'] or item['jeu_code'] == "0":
            item['jeu_code'] = None


def update_objects_cipher_index(lst):
    ciphers_list = load_data("ciphers.json")
    ciphers_codes = [cipher['code'] for cipher in ciphers_list]
    for item in lst:
        if item['cipher_id'] not in ciphers_codes:
            raise
        cipher_index = ciphers_codes.index(item['cipher_id']) + 1
        item['cipher_id'] = cipher_index


def save_old_renters_ids(items: list):
    old_ids = {}
    for index, item in enumerate(items):
        old_ids[item.pop("id")] = index + 1
    save_data("_old_renters_ids.json", old_ids)


def save_old_objects_keys(items):
    old_ids = {}
    for index, item in enumerate(items):
        old_ids[item.pop("KO")] = index + 1
    save_data("_old_objects_ids.json", old_ids)


def replace_renters_banks_ids(items: list):
    old_banks_ids = load_data("_old_banks_ids.json")
    for item in items:
        if item['bank_id'] is None:
            continue
        for entry in old_banks_ids:
            if int(item['bank_id']) in entry['old_ids']:
                item["bank_id"] = entry['new_id']
                break


def split_renters_contract_field(items: list):
    for item in items:
        contract_field = item.pop('contract', None)
        if contract_field is None:
            item["contract_number"] = None
            item['contract_date'] = None
            continue
        array = contract_field.split()
        if len(array) > 2:
            item["contract_number"] = array[1]
            item['contract_date'] = array[2] if "г." not in array[2] else array[2][:-2]
            continue
        if "№" in array[0]:
            item["contract_number"] = array[0][1:]
        else:
            item['contract_number'] = array[0]
        item['contract_date'] = array[1] if "г." not in array[1] else array[1][:-2]


def prepare_meters_data():
    old_meters_data = load_data("MSCE1.json", is_old=True)
    sorted_objects = sorted(old_meters_data, key=lambda x: int(x["M_KO"]))
    output_data = []
    for meter in sorted_objects:
        if meter["M_KO"] == "999":
            continue
        output_data.append(
            {"title": meter["M_HO"], "capacity": int(meter["M_RAZ"])}
        )
    save_data("meters.json", output_data)


def prepare_ciphers_data():
    old_ciphers_data = load_data("SHFR1.json", is_old=True)
    output_data = []
    for cipher in old_ciphers_data:
        if not any([cipher["H_KO"], cipher["H_HO"], cipher["H_TAR"]]):
            print("Cipher object was been skipped:", end="\t")
            print(cipher)
            continue
        output_data.append({
            "rate_id": int(cipher["H_TAR"]),
            "code": cipher["H_KO"],
            "title": cipher["H_HO"]
        })
    save_data("ciphers.json", output_data)


def prepare_rates_data():
    old_rates = load_data("CENA1.json", is_old=True)
    output_data = []
    for rate in old_rates:
        if not rate["N_HO"]:
            print("Rate object was been skipped:", end="\t")
            print(rate)
            continue
        output_data.append({"title": rate["N_HO"]})
    save_data("rates.json", output_data)


def prepare_rates_history_data():
    old_rates_history = load_data("TARI1.json", is_old=True)
    output_data = []
    for rh in old_rates_history:
        output_data.append({
            "rate_id": int(rh["T_KO"]),
            "entry_date": rh["T_DT"],
            "value": float(rh['T_S'])
        })
    save_data("rates_history.json", output_data)


def prepare_areas_data():
    old_areas = load_data("UCAS1.json", is_old=True)
    output_data = []
    old_areas_ids = {}
    for index, area in enumerate(old_areas):
        output_data.append({"title": area["U_HO"]})
        old_areas_ids[area['U_KO']] = index + 1
    save_data("_old_areas_ids.json", old_areas_ids)
    save_data("areas.json", output_data)


def prepare_objects_data():
    old_objects = load_data("SORG1.json", is_old=True)
    sorted_objects = sorted(old_objects, key=lambda item: int(item["KO"]))
    remove_unnecessary_keys(sorted_objects)
    save_old_objects_keys(sorted_objects)
    update_objects_fields(sorted_objects)
    update_objects_fields_type(sorted_objects)
    update_objects_cipher_index(sorted_objects)
    update_objects_area_index(sorted_objects)
    save_data("objects.json", sorted_objects)


def prepare_object_meters_data():
    temp_objects = load_data("objects.json")
    object_meters = []
    for index, obj in enumerate(temp_objects):
        if obj['meter_id'] is None:
            del obj['meter_id']
            del obj['meter_number']
            del obj['meter_installation_date']
            del obj['meter_last_reading']
            del obj['meter_heating_percentage']
            continue
        object_meters.append({
            "object_id": index + 1,
            "meter_id": obj.pop("meter_id"),
            "number": obj.pop("meter_number"),
            "installation_date": obj.pop("meter_installation_date"),
            "last_reading": obj.pop("meter_last_reading"),
            "heating_percentage": obj.pop("meter_heating_percentage")
        })
    save_data("objects.json", temp_objects)
    save_data("object_meters.json", object_meters)


def prepare_subobjects_data():
    data = load_data("CEXA1.json", is_old=True)
    sorted_data = sorted(data, key=lambda x: int(x["C_KO"]))
    subobjects_ids = {}
    subobjects_items = []
    for sub in sorted_data:
        sub["C_KO"] = int(sub['C_KO'])
    filtered_subobjects = list(filter(lambda x: x["C_KO"] < 400, sorted_data))
    for index, subobject in enumerate(filtered_subobjects):
        subobjects_ids[subobject["C_KO"]] = index + 1
        subobjects_items.append({"title": subobject['C_HO']})
    save_data("_old_subobjects_ids.json", subobjects_ids)
    save_data("subobjects.json", subobjects_items)


def prepare_limits_data():
    data = load_data("CEXA1.json", is_old=True)
    sorted_data = sorted(data, key=lambda x: x["C_KO"])
    limits_ids = {}
    limits_items = []
    for sub in sorted_data:
        sub["C_KO"] = int(sub['C_KO'])
    filtered_limits = list(filter(lambda x: x["C_KO"] >= 800, sorted_data))
    for index, limit in enumerate(filtered_limits):
        limits_ids[limit["C_KO"]] = index + 1
        limits_items.append({"title": limit['C_HO']})
    save_data("_old_limits_ids.json", limits_ids)
    save_data("limits.json", limits_items)


def prepare_renter_data():
    old_renters = load_data("AREN1.json", is_old=True)
    ceha = load_data("CEXA1.json", is_old=True)
    old_electricity_renters = list(filter(lambda x: int(
        x["C_KO"]) >= 400 and int(x["C_KO"]) < 800, ceha))
    uncleaned_renters = []
    for entry in sorted(old_electricity_renters, key=lambda x: int(x["C_KO"])):
        if not entry['C_HO']:
            continue
        if entry['C_DOG'] == 'расторгнут':
            uncleaned_renters.append({
                "id": int(entry["C_KO"]),
                "name": entry['C_HO'],
                "full_name": entry['C_HO'],
                "bank_id": None,
                "checking_account": None,
                "registration_number": None,
                "respondent_number": None,
                "address": None,
                "is_bank_payer": False,
                "contract": None,
                "contacts": None,
                "is_public_sector": False,
                "is_closed": True
            })
            continue
        renter = next(
            (rent for rent in old_renters if rent["A_KO"] == entry["C_ARK"]), None)
        if renter is None:
            uncleaned_renters.append({
                "id": int(entry["C_KO"]),
                "name": entry['C_HO'],
                "full_name": entry['C_HO'],
                "bank_id": None,
                "checking_account": None,
                "registration_number": None,
                "respondent_number": None,
                "address": None,
                "is_bank_payer": False,
                "contract": None,
                "contacts": None,
                "is_public_sector": False,
                "is_closed": False
            })
            continue
        if renter['A_RS'] == "1111111111111":
            renter["A_RS"] = None
        uncleaned_renters.append({
            "id": int(entry["C_KO"]),
            "name": renter["A_HO"] if renter["A_HO"] else "Заполнить",
            "full_name": renter['A_HHO'] if renter["A_HHO"] else "Заполнить",
            "bank_id": renter['A_BNK'] if renter['A_BNK'] != "99" else None,
            "checking_account": renter['A_RS'] if renter['A_RS'] else None,
            "registration_number": renter['A_UNN'] if renter['A_UNN'] else None,
            "respondent_number": renter['A_OKPO'] if renter['A_OKPO'] else None,
            "address": renter['A_ADR'] if renter['A_ADR'] else None,
            "is_bank_payer": bool(renter['A_PVT']) if renter['A_PVT'] == "1" else False,
            "contract": renter['A_DG2'] if renter['A_DG2'] else None,
            "contacts": renter['A_TEL'] if renter['A_TEL'] else None,
            "is_public_sector": False,
            "is_closed": False
        })
    save_old_renters_ids(uncleaned_renters)
    replace_renters_banks_ids(uncleaned_renters)
    split_renters_contract_field(uncleaned_renters)
    save_data("renters.json", uncleaned_renters)


def prepare_objects_limits_data():
    old_object_limits = load_data("PCEX1.json", is_old=True)
    subobjects_ids = load_data("_old_subobjects_ids.json")
    objects_ids = load_data("_old_objects_ids.json")
    limits_ids = load_data("_old_limits_ids.json")
    renters_ids = load_data("_old_renters_ids.json")
    result = []
    for limit in old_object_limits:
        try:
            object_id = objects_ids[limit['P_KOD']]
            limit_id = limits_ids[limit['P_CEX']]
            if int(limit['P_ARN']) >= 400:
                renter_id = renters_ids[limit['P_ARN']]
                subobject_id = None
            else:
                renter_id = None
                subobject_id = subobjects_ids[limit['P_ARN']]
            percentage = float(limit['P_PRC'])
        except KeyError as e:
            print("Ошибка при создании лимитов обьекта. Ключ не найден: ", end=" ")
            print(e)
            continue
        result.append({
            "object_id": object_id,
            "limit_id": limit_id,
            "subobject_id": subobject_id,
            "renter_id": renter_id,
            "percentage": percentage
        })
    save_data("object_limits.json", result)


def prepare_calculation_data():
    old_data = load_data("VALU1.json", is_old=True)
    result = []
    for data in old_data:
        result.append({
            "year": int(data['K_G']),
            "month": int(data['K_M']),
            "factor_1": float(data['K_K1']),
            "factor_2": float(data['K_K2']),
            "working_hours": int(data['K_CAS']),
            "limit": int(data['K_LIMI'])
        })
    save_data("calculation_data.json", result)


def prepare_workshops_data():
    old_workshops = load_data("ECEX1.json", is_old=True)
    old_workshops_indexes = {}
    result = []
    for index, workshop in enumerate(old_workshops):
        old_workshops_indexes[workshop["E_KO"]] = index + 1
        result.append({"title": workshop['E_HO']})
    save_data("workshops.json", result)
    save_data("_old_workshops_ids.json", old_workshops_indexes)


def prepare_workshops_subobjects_data():
    rows = load_data("YCEX1.json", is_old=True)
    workshops_ids = load_data("_old_workshops_ids.json")
    subobjects_ids = load_data("_old_subobjects_ids.json")
    result = []
    for row in rows:
        result.append({
            'workshop_id': workshops_ids[row['Y_CEX']],
            'subobject_id': subobjects_ids[row['Y_ARN']]
        })
    save_data("workshops_subobjects.json", result)


def prepare_objects_subrenters_data():
    old_objects_ids = load_data("_old_objects_ids.json")
    old_table_data = load_data("PRCN1.json", True)
    result = []
    for row in old_table_data:
        result.append({
            "object_id": old_objects_ids[row["E_LS"]],
            "is_local": row["E_PR"] == "2",
            "subrenter_id": old_objects_ids[row["E_SC"]]
        })
    save_data("objects_subrenters.json", result)


def prepare_objects_calculation_data():
    objects = load_data("objects.json")
    result = []
    for index, obj in enumerate(objects):
        result.append({
            "object_id": index + 1,
            "calculation_factor": obj.pop("calculation_factor"),
            "break_percentage": obj.pop("break_percentage")
        })
    save_data("objects.json", objects)
    save_data("objects_calculation_data.json", result)


if __name__ == "__main__":
    prepare_meters_data()
    prepare_ciphers_data()
    prepare_rates_data()
    prepare_rates_history_data()
    prepare_areas_data()
    prepare_objects_data()
    prepare_object_meters_data()
    prepare_subobjects_data()
    prepare_limits_data()
    prepare_renter_data()
    prepare_objects_limits_data()
    prepare_calculation_data()
    prepare_workshops_data()
    prepare_workshops_subobjects_data()
    prepare_objects_subrenters_data()
    prepare_objects_calculation_data()
