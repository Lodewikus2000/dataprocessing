# Name: Leo Schreuders
# Student number: 5742978

import pandas as pd
import csv
import json

from collections import defaultdict


INPUT_CSV = 'data.csv'
OUTPUT_JSON = 'data.json'
INDEX_NAME = 'LOCATION'


if __name__ == '__main__':

    df = pd.read_csv(INPUT_CSV, delimiter=',', usecols=['LOCATION', 'MEASURE', 'TIME', 'Value'])

    df = df[df.MEASURE == "KTOE"]
    # df = df[df.TIME == 2016]
    df = df[df.LOCATION != "OECD"]
    # df = df.set_index("TIME")
    # df = df.dropna()

    json_data = df.to_json(orient='records')

    with open(OUTPUT_JSON, 'w') as outfile:
        outfile.write(json_data)
    #
    #
    #
    #
    # j = (df.groupby(['LOCATION', 'INDICATOR', 'MEASURE'], as_index=False)
    #              .apply(lambda x: x[['TIME','Value']].to_dict('r'))
    #              .reset_index()
    #              .rename(columns={0:'Data'})
    #              .to_json(orient='records'))
    # print(j)
    # with open(OUTPUT_JSON, 'w') as outfile:
    #     outfile.write(j)




    # data = []
    # with open('data.csv', 'r') as f:
    #     reader = csv.reader(f)
    #     data = list(reader)
    #
    # d = {}
    #
    # for row in data[1:]:
    #     if row[0] not in d:
    #         d[row[0]] = {}
    #     if row[3] not in d[row[0]]:
    #         d[row[0]][row[3]] = {}
    #     if row[5] not in d[row[0]][row[3]]:
    #         d[row[0]][row[3]][row[5]] = row[6]
    #
    # data_json = json.dumps(d)
    #
    # with open(OUTPUT_JSON, 'w') as outfile:
    #     outfile.write(data_json)
