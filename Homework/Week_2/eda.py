# Name: Leo Schreuders
# Student number: 5742978

import csv
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
from scipy import stats

INPUT_CSV = "input.csv"
OUTPUT_CSV = "cleaned.csv"
OUTPUT_JSON = "data.csv"
NR_OF_BINS = 40
KEYS = [
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
            if (len(value) == 0) or (value == "unknown"):
                value = np.nan
            row[key] = value
        data.append(row)


# Output cleaner csv.
with open(OUTPUT_CSV, "w", newline="") as outfile:
    writer = csv.DictWriter(outfile, fieldnames=KEYS, extrasaction="ignore")
    writer.writeheader()
    for row in data:
        writer.writerow(row)


# Make list of countries to use as main index for the dataframe.
index = [row["Country"] for row in data]





# Turn the data into a dataframe.
dataframe = pd.DataFrame(data, index=index)
dataframe = dataframe.drop(columns="Country")


length_before = len(dataframe.index)


# Drop all unnecessary columns.
for column in dataframe:
    if column not in KEYS:
        dataframe.drop(column, axis=1, inplace=True)


# Turn data into actual numbers.
for key in [
    "Pop. Density (per sq. mi.)", "Infant mortality (per 1000 births)",
    "GDP ($ per capita) dollars"
    ]:
    dataframe[key] = pd.to_numeric(dataframe[key])


dataframe.dropna(inplace=True)

# z = np.abs(stats.zscore(dataframe["GDP ($ per capita) dollars"]))
# print(z)

# dataframe = dataframe[(np.abs(stats.zscore(dataframe["GDP ($ per capita) dollars"])) < 3)]

dataframe = dataframe[(np.abs(stats.zscore(dataframe.select_dtypes(exclude='object'))) < 3).all(axis=1)]


length_after = len(dataframe.index)

# dataframe.drop("Suriname", axis=0, inplace=True)

print(f"--------------------------------------")
print(f"{length_before - length_after} rows with missing values or outliers were dropped.")


mean = dataframe["GDP ($ per capita) dollars"].mean()
median = dataframe["GDP ($ per capita) dollars"].median()
mode = dataframe["GDP ($ per capita) dollars"].mode()
std = dataframe["GDP ($ per capita) dollars"].std()

print(f"--------------------------------------")
print(f"GDP ($ per capita) dollars")
print(f"mean: {mean:.2f}")
print(f"median: {median:.2f}")
print(f"mode: {mode[0]:.2f}")
print(f"standard deviation: {std:.2f}")

# Save and show histogram.
fig, ax = plt.subplots()
dataframe["GDP ($ per capita) dollars"].plot.hist(bins=NR_OF_BINS,
    title="GDP ($ per capita) dollars")
ax.set_xlabel("dollars")
plt.grid(b=True, axis="y")
plt.savefig("GDP.png")
plt.show()

minimum = dataframe["Infant mortality (per 1000 births)"].min()
q1 = dataframe["Infant mortality (per 1000 births)"].quantile(0.25)
median = dataframe["Infant mortality (per 1000 births)"].median()
q3 = dataframe["Infant mortality (per 1000 births)"].quantile(0.75)
maximum = dataframe["Infant mortality (per 1000 births)"].max()

print(f"--------------------------------------")
print(f"Infant mortality (per 1000 births)")
print(f"minimum: {minimum:.2f}")
print(f"first quartile: {q1:.2f}")
print(f"median: {median:.2f}")
print(f"third quartile: {q3:.2f}")
print(f"maximum: {maximum:.2f}")
print(f"--------------------------------------")

dataframe["Infant mortality (per 1000 births)"].plot.box()
plt.grid(b=True, axis="y")
plt.savefig("Infant_mortality.png")
plt.show()



json_data = dataframe.to_json(orient="index")

with open(OUTPUT_JSON, "w") as outfile:
    outfile.write(json_data)
