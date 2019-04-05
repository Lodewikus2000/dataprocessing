#!/usr/bin/env python
# Name: Leo Schreuders
# Student number: 5742978
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
import re
from contextlib import closing
from requests import get
from requests.exceptions import RequestException
from bs4 import BeautifulSoup


TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    movies = []
    movie_list = dom.find_all(class_="lister-item-content")
    for item in movie_list:
        # Find the title.
        title = item.find(href=re.compile("title"))
        title = title.string

        # Find the rating.
        rating = item.find(class_="inline-block ratings-imdb-rating")
        rating = rating["data-value"]

        # Find the year and strip it.
        year = item.find(class_="lister-item-year")
        year = year.string.strip("(I) ")

        # Find the list of actors.
        actors_list = item.find_all(href=re.compile("adv_li_st"))

        # Turns the names into strings.
        for i, value in enumerate(actors_list):
            actors_list[i] = value.string

        # Turn the list into one string.
        actors_string = ", ".join(actors_list)


        runtime = item.find(class_="runtime")
        runtime = runtime.string.strip("min ")

        movie = [title, rating, year, actors_string, runtime]

        # Fill empty values with "N/A".
        for i, value in enumerate(movie):
            if not value:
                movie[i] = "N/A"

        movies.append(movie)

    return movies


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])
    for movie in movies:
        writer.writerow(movie)


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0}: {1}'
              .format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # Get HTML content at target URL.
    html = simple_get(TARGET_URL)

    # Save a copy to disk in the current directory, this serves as a backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation.
    dom = BeautifulSoup(html, 'html.parser')

    # Extract the movies (using the function you implemented).
    movies = extract_movies(dom)

    # Write the CSV file to disk (including a header).
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
