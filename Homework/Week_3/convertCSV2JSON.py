# Name: Leo Schreuders
# Student number: 5742978

import pandas as pd

INPUT_CSV = 'arbeidsdeelname_per_maand.csv'
OUTPUT_JSON = 'data.json'
INDEX_NAME = 'Perioden'


if __name__ == '__main__':

    df = pd.read_csv(INPUT_CSV, delimiter=';')

    df.set_index(INDEX_NAME, inplace=True)

    json_data = df.to_json(orient='index')

    with open(OUTPUT_JSON, 'w') as outfile:
        outfile.write(json_data)
