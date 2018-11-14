# Name: Leo Schreuders
# Student number: 5742978

import csv
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json

INPUT_CSV = "input.csv"
OUTPUT_CSV = "cleaned.csv"
OUTPUT_JSON = "data.csv"

keys = [
    "Country", "Region", "Pop. Density (per sq. mi.)",
    "Infant mortality (per 1000 births)", "GDP ($ per capita) dollars"
    ]

data = []

with open(INPUT_CSV, "r", newline="\n") as infile:
    reader = csv.DictReader(infile)
    for row in reader:
        for key, value in row.items():
            value = value.replace(",",".").replace("dollars","").strip(" ")
            if len(value) == 0:
                value = np.nan
            if value == "unknown":
                value = np.nan
            row[key] = value
        data.append(row)



# output filtered csv
with open(OUTPUT_CSV, "w", newline="") as outfile:
    writer = csv.DictWriter(outfile, fieldnames=keys, extrasaction="ignore")
    writer.writeheader()
    for row in data:
        writer.writerow(row)


all_keys = list(data[0].keys())
ignored_keys = [x for x in all_keys if x not in keys]

for row in data:
    for key in ignored_keys:
        del row[key]


index = [row["Country"] for row in data]

dataframe = pd.DataFrame(data, index=index)
dataframe = dataframe.drop(columns="Country")

pd.set_option("display.max_columns", None)
#dataframe.dropna(how="any",inplace=True)

for key in [
    "Pop. Density (per sq. mi.)", "Infant mortality (per 1000 births)",
    "GDP ($ per capita) dollars"
    ]:
    dataframe[key] = pd.to_numeric(dataframe[key])

mean = dataframe["GDP ($ per capita) dollars"].mean(skipna=True)
median = dataframe["GDP ($ per capita) dollars"].median(skipna=True)
mode = dataframe["GDP ($ per capita) dollars"].mode()
std = dataframe["GDP ($ per capita) dollars"].std(skipna=True)

print(f"--------------------------------------")
print(f"GDP ($ per capita) dollars")
print(f"mean: {mean}")
print(f"median: {median}")
print(f"mode: {mode[0]}")
print(f"standard deviation: {std}")

fig, ax = plt.subplots()
dataframe["GDP ($ per capita) dollars"].plot.hist(bins=100,
    title="GDP ($ per capita) dollars")
ax.set_xlabel("dollars")
plt.savefig("GDP.png")
plt.show()



minimum = dataframe["Infant mortality (per 1000 births)"].min()
q1 = dataframe["Infant mortality (per 1000 births)"].quantile(0.25)
median = dataframe["Infant mortality (per 1000 births)"].median()
q3 = dataframe["Infant mortality (per 1000 births)"].quantile(0.75)
maximum = dataframe["Infant mortality (per 1000 births)"].max()

print(f"--------------------------------------")
print(f"Infant mortality (per 1000 births)")
print(f"minimum: {minimum}")
print(f"first quartile: {q1}")
print(f"median: {median}")
print(f"third quartile: {q3}")
print(f"maximum: {maximum}")
print(f"--------------------------------------")

dataframe["Infant mortality (per 1000 births)"].plot.box()
plt.savefig("Infant_mortality.png")
plt.show()


json_data = dataframe.to_json(orient="index")
json_data = json.dumps(json_data, indent=4, separators=(',', ': '))
with open(OUTPUT_JSON, "w") as outfile:
    outfile.write(json_data)
