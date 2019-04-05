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

# Make a dictionary from the data.
def get_dict(csv_name):
    """
    From a csv with movie ratings, make a dict with years as keys and a list of
    ratings as values.
    """
    data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

    with open(csv_name, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data_dict[row['Year']].append(float(row['Rating']))

    return data_dict


if __name__ == "__main__":
    years = []
    average_ratings = []

    # Make a dictionary with average ratings per year.
    rating_dict = get_dict(INPUT_CSV)


    for year, ratings in rating_dict.items():
        years.append(int(year))
        average_ratings.append(np.mean(np.array(ratings)))

    fig, ax = plt.subplots()
    ax.plot(years, average_ratings, color='gold', linestyle='-', marker='o')
    ax.set(xlabel="year", ylabel="average rating",
           title="average rating of IMDB top 50 movies by year")


    ax.set_xlim(START_YEAR - .5, END_YEAR - .5)

    # Place x-ticks at every year.
    plt.xticks(range(START_YEAR, END_YEAR, 1))

    y_lower_limit = 0
    y_upper_limit = 10
    ax.set_ylim(y_lower_limit, y_upper_limit)

    # Place y-ticks at every integer from 0 to 10.
    plt.yticks(range(0, 11))

    plt.grid(True, 'major', 'y', ls='-', lw=.5, c='k', alpha=.3)
    plt.savefig('graph.png')
    plt.show()
