#!/usr/bin/env python
# Name: Leo Schreuders
# Student number: 5742978
"""
This script crawls the IMDB top 250 movies.
"""

import os
import csv
import codecs
import errno
import re
import json

from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

# global constants
TOP_250_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------
# Utility functions (no need to edit):


def create_dir(directory):
    """
    Create directory if needed.
    Args:
        directory: string, path of directory to be made
    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    """

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already existing backup directory
            # are not handled, so the exception is re-raised and the
            # script will crash here.
            raise


def save_csv(filename, rows):
    """
    Save CSV file with the top 250 most popular movies on IMDB.
    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (250 movies in this exercise)
    """
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'title', 'runtime', 'genre(s)', 'director(s)', 'writer(s)',
            'actor(s)', 'rating(s)', 'number of rating(s)'
        ])

        writer.writerows(rows)


def make_backup(filename, html):
    """
    Save HTML to file.
    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file
    """

    with open(filename, 'wb') as f:
        f.write(html)


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
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


def main():
    """
    Crawl the IMDB top 250 movies, save CSV with their information.
    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    """

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print('Setting up backup dir if needed ...')
    create_dir(BACKUP_DIR)

    # Make backup of the IMDB top 250 movies page
    print('Access top 250 page, making backup ...')
    top_250_html = simple_get(TOP_250_URL)
    top_250_dom = BeautifulSoup(top_250_html, "lxml")

    make_backup(os.path.join(BACKUP_DIR, 'index.html'), top_250_html)

    # extract the top 250 movies
    print('Scraping top 250 page ...')
    url_strings = scrape_top_250(top_250_dom)

    # grab all relevant information from the 250 movie web pages
    rows = []
    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print('Scraping movie %d ...' % i)

        # Grab web page
        movie_html = simple_get(url)

        # Extract relevant information for each movie
        movie_dom = BeautifulSoup(movie_html, "lxml")
        rows.append(scrape_movie_page(movie_dom))

        # Save one of the IMDB's movie pages (for testing)
        if i == 83:
            html_file = os.path.join(BACKUP_DIR, 'movie-%03d.html' % i)
            make_backup(html_file, movie_html)

    # Save a CSV file with the relevant information for the top 250 movies.
    print('Saving CSV ...')
    save_csv(os.path.join(SCRIPT_DIR, 'top250movies.csv'), rows)


# --------------------------------------------------------------------------
# Functions to adapt or provide implementations for:

def scrape_top_250(soup):
    """
    Scrape the IMDB top 250 movies index page.
    Args:
        soup: parsed DOM element of the top 250 index page
    Returns:
        A list of strings, where each string is the URL to a movie's page on
        IMDB, note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    """
    movie_urls = []
    # Search for the elements with class=titleColumns.
    attr = {"class": "titleColumn"}
    results = soup.find_all("td", class_="titleColumn")

    for item in results:
        # Within the elements, get a hyperlink starting with "/title/".
        item = item.find(href=re.compile("/title/")).get("href")

        item = "https://www.imdb.com" + item

        # Everything after "?" in the link is unnecessary.
        item = item.split("?")[0]

        movie_urls.append(item)

    return movie_urls


def scrape_movie_page(dom):
    """
    Scrape the IMDB page for a single movie
    Args:
        dom: BeautifulSoup DOM instance representing the page of 1 single
            movie.
    Returns:
        A list of strings representing the following (in order): title, year,
        duration, genre(s) (semicolon separated if several), director(s)
        (semicolon separated if several), writer(s) (semicolon separated if
        several), actor(s) (semicolon separated if several), rating, number
        of ratings.
    """
    movie = []

    # Get the JSON from the website and convert it to a dict.
    movie_json = dom.find(type="application/ld+json")
    info_dict = json.loads(movie_json.get_text())


    title = info_dict['name']
    movie.append(title)


    runtime = info_dict['duration']

    # If the movie is less than an hour, there will be no H in the string.
    if 'H' in runtime:
        hours, minutes = runtime.split('H')
    else:
        hours = 0
        minutes = runtime

    # If hours is a string, only keep the digits and transform to an int.
    if hours:
        hours = int(re.sub(r"\D", "", hours))

    # If minutes is a string, only keep the digits and transform to an int.
    if minutes:
        minutes = int(re.sub(r"\D", "", minutes))
    else:
        minutes = 0

    minutes += hours*60
    movie.append(minutes)


    genres = info_dict['genre']
    # If genres is a list of several items, join them in a string.
    if isinstance(genres, list):
        genres = ";".join(genre for genre in genres)
    movie.append(genres)


    directors = info_dict['director']
    # If directors is a list, join the items in a string.
    if not isinstance(directors, dict):
        directors_list = []
        for director in directors:
            if director['@type'] == 'Person':
                # Don't add the director if they're already in the list.
                if director['name'] not in directors_list:
                    directors_list.append(director['name'])
        directors_list = ";".join(director for director in directors_list)
        movie.append(directors_list)
    else:
        movie.append(directors['name'])


    writers = info_dict['creator']
    # If writers is a list, join the items in a string.
    if not isinstance(writers, dict):
        writers_list = []
        for writer in writers:
            if writer['@type'] == 'Person':
                # Don't add the writer if they're already in the list.
                if writer['name'] not in writers_list:
                    writers_list.append(writer['name'])
        writers_list = ";".join(writer for writer in writers_list)
        movie.append(writers_list)
    else:
        movie.append(writers['name'])


    actors = info_dict['actor']
    # If actors is a list, join the items in a string.
    if not isinstance(actors, dict):
        actors_list = []
        for actor in actors:
            if len(actors_list) == 3:
                break
            if actor['@type'] == 'Person':
                # Don't add the actor if they're already in the list.
                if actor['name'] not in actors_list:
                    actors_list.append(actor['name'])
        actors_list = ";".join(actor for actor in actors_list)
        movie.append(actors_list)
    else:
        movie.append(actors['name'])


    ratings_dict = info_dict['aggregateRating']
    rating_value = ratings_dict['ratingValue']
    rating_count = ratings_dict['ratingCount']

    movie.append(rating_value)
    movie.append(rating_count)


    print(movie)
    return movie


if __name__ == '__main__':
    main()  # call into the progam

    # If you want to test the functions you wrote, you can do that here:
    # ...
