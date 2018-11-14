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

# Read INPUT_CSV, clean up the data, replace missing or unknown values
# with np.nan.
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

# Output cleaner csv.
with open(OUTPUT_CSV, "w", newline="") as outfile:
    writer = csv.DictWriter(outfile, fieldnames=keys, extrasaction="ignore")
    writer.writeheader()
    for row in data:
        writer.writerow(row)

# Make list of countries to use as main index for the dataframe.
index = [row["Country"] for row in data]
dataframe = pd.DataFrame(data, index=index)
dataframe = dataframe.drop(columns="Country")

# Turn data into actual numbers.
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

# Save and show histogram.
nr_of_bins = 80
fig, ax = plt.subplots()
dataframe["GDP ($ per capita) dollars"].plot.hist(bins=nr_of_bins,
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

# Drop all unnecessary columns.
for column in dataframe:
    if column not in keys:
        dataframe.drop(column, axis=1, inplace=True)

json_data = dataframe.to_json(orient="index")

with open(OUTPUT_JSON, "w") as outfile:
    outfile.write(json_data)
