# Name: Leo Schreuders
# Student number: 5742978

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

INPUT_CSV = 'input.csv'
OUTPUT_CSV = 'cleaned.csv'
OUTPUT_JSON = 'data.json'
NR_OF_BINS = 20
KEYS = ['Country',
        'Region',
        'Pop. Density (per sq. mi.)',
        'Infant mortality (per 1000 births)',
        'GDP ($ per capita) dollars']


def format_string(string):
    """
    Takes a string, replaces commas with periods, and removes 'dollars', and
    strips spaces. Returns the new string.
    """
    if isinstance(string, str):
        string = string.replace(',', '.').replace('dollars', '').strip(' ')
    return string


def clean(value):
    """
    Turns a string into NaN if's empty or 'unknown'. Returns the new value.
    """
    if isinstance(value, str):
        if (not value) or (value == 'unknown'):
            value = np.nan
    return value


def print_stats(dataframe, column_name):
    """
    Print the mean, median, mode and standard deviation of a column in a
    panda dataframe. Returns nothing.
    """
    mean = dataframe[column_name].mean()
    median = dataframe[column_name].median()
    mode = dataframe[column_name].mode()
    std = dataframe[column_name].std()

    print(f'--------------------------------------')
    print(f'{column_name}')
    print(f'mean: {mean:.2f}')
    print(f'median: {median:.2f}')
    print(f'mode: {mode[0]:.2f}')
    print(f'standard deviation: {std:.2f}')
    print(f'--------------------------------------')


def print_five(dataframe, column_name):
    """
    Print the five number summary of a specified column in a panda dataframe.
    Returns nothing.
    """
    minimum = dataframe[column_name].min()
    q1 = dataframe[column_name].quantile(0.25)
    median = dataframe[column_name].median()
    q3 = dataframe[column_name].quantile(0.75)
    maximum = dataframe[column_name].max()

    print(f'--------------------------------------')
    print(f'{column_name}')
    print(f'minimum: {minimum:.2f}')
    print(f'first quartile: {q1:.2f}')
    print(f'median: {median:.2f}')
    print(f'third quartile: {q3:.2f}')
    print(f'maximum: {maximum:.2f}')
    print(f'--------------------------------------')


if __name__ == '__main__':

    df = pd.read_csv(INPUT_CSV)

    # Drop columns we're not interested in.
    for column in df:
        if column not in KEYS:
            df.drop(column, axis=1, inplace=True)

    # Reformat the string values.
    for column in ['Country',
                   'Region',
                   'Pop. Density (per sq. mi.)',
                   'Infant mortality (per 1000 births)',
                   'GDP ($ per capita) dollars']:
        df[column] = df[column].map(format_string)

    # Make the Country column the index column.
    df.set_index('Country', inplace=True)

    # Turn unknown or empty values in to NaN.
    df = df.applymap(clean)

    # Turn strings of numbers into actual numbers.
    for column in ['Pop. Density (per sq. mi.)',
                   'Infant mortality (per 1000 births)',
                   'GDP ($ per capita) dollars']:
        df[column] = pd.to_numeric(df[column])



    length_before = len(df.index)
    print(df)

    # Drop rows with missing values.
    df.dropna(inplace=True)

    length_after = len(df.index)


    # Surinam's GDP seems incorrect, we will drop the value.
    df.drop('Suriname', inplace=True)


    print(f'--------------------------------------')
    print(f'{length_before - length_after} rows with missing values or outliers'
          ' were dropped.')


    print_stats(df, 'GDP ($ per capita) dollars')

    # Save and show histogram.
    fig, ax = plt.subplots()
    df['GDP ($ per capita) dollars'].plot.hist(bins=NR_OF_BINS,
                                               title='GDP ($ per capita) '
                                                     'dollars')
    ax.set_xlabel('dollars')
    ax.set_ylabel('frequency')
    ax.set_title('GDP')
    plt.grid(b=True, axis='y')
    plt.savefig('GDP.png')
    plt.show()

    print_five(df, 'Infant mortality (per 1000 births)')

    # Save and show boxplot.
    fig, ax = plt.subplots()
    df['Infant mortality (per 1000 births)'].plot.box()
    ax.set_title('Infant mortality')
    ax.set_xticklabels([])
    ax.set_ylabel('mortality per 1000 births')
    plt.grid(b=True, axis='y')
    plt.savefig('Infant_mortality.png')
    plt.show()


    json_data = df.to_json(orient='index')
    with open(OUTPUT_JSON, 'w') as outfile:
        outfile.write(json_data)
