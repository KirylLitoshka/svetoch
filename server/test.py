import table


def main():
    with dbf.Table("ao44.dbf").open() as file:
        table_data = [dict(zip(file.field_names, row)) for row in file]
    print(table_data)


if __name__ == '__main__':
    main()
