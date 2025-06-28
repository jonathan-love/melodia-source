# Spotify API call handler

import os
from dotenv import load_dotenv
import base64
import json
from requests import post, get

# See .env file for client ID and secret
load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")


def get_token():
    auth_string = client_id + ":" + client_secret
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    result = post(url, headers=headers, data=data)
    json_result = json.loads(result.content)
    token = json_result["access_token"]
    return token


def get_auth_header(token):
    return {"Authorization": "Bearer " + token}


def search_for_artist(token, artist_name):
    url = "https://api.spotify.com/v1/search"
    headers = get_auth_header(token)
    query = f"?q={artist_name}&type=artist"

    query_url = url + query
    result = get(query_url, headers=headers)
    json_result = json.loads(result.content)["artists"]["items"]
    if len(json_result) == 0:
        print("No artists with this name")
        return None
    
    return json_result[0]


def get_songs_by_arist(token, artist_id):
    url = f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks?country=US"
    headers = get_auth_header(token)
    result = get(url, headers=headers)
    json_result = json.loads(result.content)["tracks"]
    
    return json_result


def get_artist_info(artist_name):
    token = get_token()
    result = search_for_artist(token, artist_name)
    artist_id = result["id"]
    songs = get_songs_by_arist(token, artist_id)

    for idx, song in enumerate(songs):
        print(f"{idx + 1}. {song['name']}")

# Get album cover from Spotify API
def get_track_metadata(track_id):
    token = get_token()
    url = f"https://api.spotify.com/v1/tracks/{track_id}"
    headers = get_auth_header(token)
    response = get(url, headers=headers)

    if response.status_code != 200:
        return None

    track_data = response.json()

    return {
        "name": track_data["name"],
        "artist": track_data["artists"][0]["name"],
        "album_art": track_data["album"]["images"][0]["url"],
        "duration_ms": track_data["duration_ms"],
        "spotify_url": track_data["external_urls"]["spotify"]
    }

token = get_token()