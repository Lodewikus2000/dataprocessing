#!/usr/bin/env python
# Name: Leo Schreuders
# Student number: 5742978
"""
This script visualizes data obtained from a .csv file
"""

import csv
import numpy as np
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

with open(INPUT_CSV,newline="") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        data_dict[row['Year']].append(float(row['Rating']))


if __name__ == "__main__":
    x = []
    y = []
    for key, value in data_dict.items():
        x.append(int(key))
        y.append(np.mean(np.array(value)))

    fig, ax = plt.subplots()
    ax.plot(x,y,color='gold', linestyle='-', marker='o')
    ax.set(xlabel="year", ylabel="average rating",
     title="average rating of IMDB top 50 movies by year")
    ax.set_xlim(2007.5,2017.5)
    plt.xticks(range(2008, 2018, 1))
    ax.set_ylim(np.min(y)-0.5, np.max(y)+0.5)
    plt.yticks()
    plt.grid(True, 'major', 'y', ls='-', lw=.5, c='k', alpha=.3)
    plt.show()
