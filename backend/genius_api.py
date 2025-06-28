# Genius API call handling

import requests
import os
import re
from dotenv import load_dotenv
from lyricsgenius import Genius
from langdetect import detect

load_dotenv()

token = os.getenv("GENIUS_TOKEN")
genius = Genius(token)

genius.verbose = False
genius.remove_section_headers = True


def clean_song_title(title):

    title = re.sub(r"[\(\[]?[-–]?\s*(live|remaster|alternative|acoustic|version|edit|mix|extended|radio|demo|karaoke|instrumental).*$", "", title, flags=re.IGNORECASE)
    return title.strip()


def search_genius(song_title, artist=None):

    base_url = "https://api.genius.com/search"
    headers = {"Authorization": f"Bearer {token}"}

    query = f"{song_title} {artist}" if artist else song_title
    params = {"q": query}

    response = requests.get(base_url, headers=headers, params=params)
    data = response.json()

    return data.get("response", {}).get("hits", [])

# Find nearest match to song input
def find_best_match(cleaned_title, results):

    for hit in results:
        genius_title = hit["result"]["title"]
        if cleaned_title.lower() in genius_title.lower():
            return hit["result"]

    return results[0]["result"] if results else None


def get_lyrics(song_id):

    return genius.lyrics(song_url=f"https://genius.com/songs/{song_id}")


def get_lyric_data(song_name, artist=None):

    cleaned_title = clean_song_title(song_name)
    results = search_genius(cleaned_title, artist)
    best_match = find_best_match(cleaned_title, results)

    if not best_match:
        results = search_genius(cleaned_title)
        best_match = find_best_match(cleaned_title, results)

    if best_match:
        lyrics = get_lyrics(best_match['id'])
        return lyrics

    else:
        return "No match found"

# Use langdetect to check language
def detect_song_language(song_name, artist=None):

    cleaned_title = clean_song_title(song_name)
    results = search_genius(cleaned_title, artist)
    best_match = find_best_match(cleaned_title, results)

    if not best_match:
        results = search_genius(cleaned_title)
        best_match = find_best_match(cleaned_title, results)

    if best_match:
        lyrics = get_lyrics(best_match['id'])
        language = detect(lyrics) if lyrics else "Unknown"
        return language
    else:
        return "No match found"


def get_song_language(song_name, artist_name=None):

    language = detect_song_language(song_name, artist_name)

    return language
