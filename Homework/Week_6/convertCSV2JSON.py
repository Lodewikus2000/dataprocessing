# Name: Leo Schreuders
# Student number: 5742978

import pandas as pd
import csv
import json

from collections import defaultdict


INPUT_CSV = ['data/life_expectancy_before.csv']
OUTPUT_JSON = ['data/life_expectancy_after.json']
INDEX_NAME = 'LOCATION'


if __name__ == '__main__':

    df = pd.read_csv(INPUT_CSV[0], delimiter=',', usecols=["COU", "Country", "Variable", "Year", "Value"])


    # df = df[df.MEASURE == "GINI"]
    # df = df[df.AGE == "TOT"]


    # df = df.set_index("TIME")
    # df = df.dropna()

    json_data = df.to_json(orient='records')

    with open(OUTPUT_JSON[0], 'w') as outfile:
        outfile.write(json_data)




    # df = pd.read_csv(INPUT_CSV[1], delimiter=',', usecols=["Variable", "Measure" ,"COU","Country","Year","Value"])
    #
    #
    # print(df)
    # # df = df.set_index("TIME")
    # # df = df.dropna()
    #
    # json_data = df.to_json(orient='records')
    #
    # with open(OUTPUT_JSON[1], 'w') as outfile:
    #     outfile.write(json_data)
