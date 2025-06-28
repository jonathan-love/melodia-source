# Main Flask app

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
import pandas as pd
import numpy as np
from deep_translator import GoogleTranslator
import plotly.express as px
from genius_api import get_lyric_data
from spotify_api import get_track_metadata
from visualisations import generate_charts
from recommender import process_pca_and_clusters, get_nearest_songs, previous_recommendations
from nrclex import NRCLex
import warnings
import requests
import io
import csv

# Set-ExecutionPolicy Unrestricted -Scope Process (<-- Needed for venv\Scripts\activate)

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app, origins="http://localhost:3000")

if not os.path.exists('static'):
    os.makedirs('static')

# Data files:
# - data.csv: Main lang-processed dataset
# - dataset_a: Full, unprocessed dataset
# - data_cleaned: Subproject dataset

df = pd.read_csv("data/data.csv")

# Excluded csv data: duration, release_date, all string data
music_terms = ['danceability', 'energy', 'loudness', 'mode',
                 'speechiness', 'acousticness', 'liveness', 'valence',
                 'popularity', 'tempo', 'key', 'instrumentalness']

# Change to emphasise different characteristics
feature_weights = {
    'danceability': 1.5,
    'energy': 1.8,
    'loudness': 1.2,
    'instrumentalness': 1.7,
    'mode': 0.8,
    'speechiness': 1.0,
    'acousticness': 1.3,
    'liveness': 1.0,
    'valence': 1.6,
    'popularity': 0.7,
    'tempo': 1.4,
    'key': 0.9,
}

liked_songs = [] # To store in a DB if ever expanding upon this

pca_plot_html_path = process_pca_and_clusters()
generate_charts()

# Get lyrics via GeniusLyrics API (See genius_api.py)
# Translator isn't fantastic - Use Google Translate or DeepL API if continuing onwards
@app.route('/lyrics')
def get_song_lyrics():

    song_title = request.args.get('song_name')

    if not song_title:
        return jsonify({"error": "A song name is required"}), 400

    song_data = df[df['name'].str.contains(song_title, case=False, na=False)]

    if song_data.empty:
        return jsonify({"error": f"No song called '{song_title}' was found."}), 404

    if len(song_data) > 1:
        return jsonify({
            "message": f"Multiple songs called '{song_title}' were found in the .csv data.",
            "songs": song_data[['name', 'artists']].to_dict(orient='records')
        })

    song = song_data.iloc[0]
    artist_name = song['artists']

    lyrics = get_lyric_data(song_title, artist_name)

    if lyrics != None:
        index = lyrics.lower().find("lyrics")
        if index != -1:
            lyrics = lyrics[index + len("lyrics"):]
        lyric_translations = [{"original": lyrics, "translated": GoogleTranslator(source='auto', target='en').translate(lyrics),}]
    else:
        lyric_translations = [{"original": "Original Lyrics Not Found","translated": "Translated Lyrics Not Found",}]

    return jsonify(lyric_translations)


# Function to handle recommendation lists
@app.route('/recommendations')
def get_recommendations():
    song_name = request.args.get('song_name')
    language_code = request.args.get('language')

    if not song_name:
        return jsonify({"error": "A song name is required"}), 400

    if not language_code:
        return jsonify({"error": "A target language is required."}), 400

    nearest_songs = get_nearest_songs(song_name, language_code=language_code)

    if nearest_songs.empty:
        return jsonify({"message": f"No recommendations found for '{song_name}' in {language_code}."})

    filtered_songs = nearest_songs[~nearest_songs['name'].isin(previous_recommendations)]

    if filtered_songs.empty:
        return jsonify({"message": "All songs from this cluster have been recommended already."})

    previous_recommendations.extend(filtered_songs['name'].tolist())

    return jsonify(filtered_songs.to_dict(orient="records"))

# Get all songs
@app.route('/api/songs', methods=['GET'])
def get_songs():
    song_data = df[['name', 'artists', 'year', 'language', 'duration_ms', 'tempo', 'explicit', 'liveness', 'valence', 'danceability', 'energy', 'id', 'instrumentalness', 'key', 'mode', 'acousticness', 'loudness']].to_dict(orient='records')
    return jsonify(song_data)


# Save user liked songs
@app.route('/like-song', methods=['POST'])
def like_song():
    song = request.json
    song_id = song.get("id")

    if not song_id:
        return jsonify({"error": "No song ID provided"}), 400

    song_data = df[df['id'] == song_id]

    if song_data.empty:
        return jsonify({"error": "Song not found"}), 404

    liked_songs.append(song_data.iloc[0].to_dict())

    return jsonify({"message": "Song liked!", "total": len(liked_songs)})

# Remove a specific liked song
@app.route('/remove-song', methods=['POST'])
def remove_song():
    song_name = request.json.get('name')

    global liked_songs
    liked_songs = [song for song in liked_songs if song["name"] != song_name]

    return jsonify({"message": "Song removed", "total": len(liked_songs)})


# Get liked songs
@app.route('/liked-songs', methods=['GET'])
def get_liked_songs():
    songs_with_spotify_data = []

    for song in liked_songs:
        metadata = get_track_metadata(song['id'])

        if metadata:
            song_with_spotify_data = {**song, **metadata}
            songs_with_spotify_data.append(song_with_spotify_data)
        else:
            songs_with_spotify_data.append(song)

    return jsonify(songs_with_spotify_data)


# Clear liked songs
@app.route('/clear-liked-songs', methods=['POST'])
def clear_liked_songs():
    liked_songs.clear()
    return jsonify({"message": "Cleared 'liked' songs."})


# Export liked songs to CSV
@app.route('/export-liked-songs', methods=['GET'])
def export_liked_songs():
    if not liked_songs:
        return jsonify({"error": "No liked songs to export"}), 400

    df_liked_songs = pd.DataFrame(liked_songs)

    filename = 'liked_songs.csv'

    df_liked_songs.to_csv(filename, index=False)

    return send_file(filename, as_attachment=True)


# Gets Spotify link to export song to Spotify 
@app.route('/get-spotify-link', methods=['GET'])
def get_spotify_link():

    song_name = request.args.get('song_name')

    song_data = df.loc[df['name'] == song_name]

    if song_data.empty:
        return jsonify({"error": "Song not found"}), 404

    song_id = song_data.iloc[0]['id']

    spotify_url = f"https://open.spotify.com/track/{song_id}"

    return jsonify({"spotify_url": spotify_url})



@app.route('/track-metadata', methods=['GET'])
def get_track_metadata_route():

    song_name = request.args.get('song_name')
    song_data = df[df['name'] == song_name]

    if song_data.empty:
        return jsonify({"error": "Song not found"}), 404

    track_id = song_data.iloc[0]['id']
    metadata = get_track_metadata(track_id)

    if metadata is None:
        return jsonify({"error": "Could not pull metadata"}), 500

    return jsonify(metadata)


def duration_convert(milliseconds):

    s = milliseconds / 1000
    
    minutes = int(s // 60)
    seconds = int(s % 60)
    
    return f"{minutes}:{seconds:02d}"


def combine_key(key, mode):

    pitch_class_dictionary = {
        -1: "No Key Found",
        0: "C",
        1: "C#/Db",
        2: "D",
        3: "D#/Eb",
        4: "E",
        5: "F",
        6: "F#/Gb",
        7: "G",
        8: "G#/Ab",
        9: "A",
        10: "A#/Bb",
        11: "B"
    }

    mode_dictionary = {
        0: "Minor",
        1: "Major"
    }

    if key == -1:
        return "No Key Found"

    key_name = pitch_class_dictionary.get(key, "Unknown Key")
    mode_name = mode_dictionary.get(mode, "Unknown Mode")
    return f"{key_name} {mode_name}"


@app.route("/search_songs")
def search_songs():
    query = request.args.get("q", "").lower()
    if not query:
        return jsonify([])

    matches = df[df['name'].str.lower().str.contains(query) | df['artists'].str.lower().str.contains(query)]
    results = matches.head(5).to_dict(orient="records")

    for result in results:
        result['artists'] = str(result['artists']).replace("'", "").replace("[", "").replace("]", "")

    print(results)
    return jsonify(results)


@app.route('/emotions', methods=['POST'])
def get_emotions():
    request_data = request.get_json()
    input_song = request_data.get("input_song")
    recommended_songs = request_data.get("recommended_songs", [])

    input_emotion = NRCLex(get_lyric_data(input_song, df.loc[df['name'] == input_song, 'artists'].iloc[0]))
    input_scores = input_emotion.raw_emotion_scores
    input_scores = {k.capitalize(): v for k, v in input_scores.items()}

    song = recommended_songs[0]
    recommended_emotion = NRCLex(get_lyric_data(song, df.loc[df['name'] == song, 'artists'].iloc[0]))
    recommended_scores_raw = recommended_emotion.raw_emotion_scores
    recommended_scores_capitalized = {k.capitalize(): v for k, v in recommended_scores_raw.items()}

    emotion_results = {
        "input_song": input_scores,
        "recommended_songs": {
            song: recommended_scores_capitalized
        }
    }

    # Not ideal but works for now
    if os.path.exists("static/selection_chart.html"):
        os.remove("static/selection_chart.html")

    fig = px.pie(
        names=list(input_scores.keys()),
        values=list(input_scores.values()),
        title="",
        color_discrete_sequence=px.colors.sequential.RdBu
    )
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', legend=dict(
            font=dict(color="white"),
            title_font=dict(color="white"),
            bgcolor="rgba(0,0,0,0)",
            x=1,
            y=0.5,
            xanchor="left",
            yanchor="middle"))
    fig.update_traces(textfont=dict(color='white', size=10), textposition='inside')
    fig.write_html('static/selection_chart.html')

    # Also not ideal but works for now
    if os.path.exists("static/recommended_chart.html"):
        os.remove("static/recommended_chart.html")

    fig = px.pie(
        names=list(recommended_scores_capitalized.keys()),
        values=list(recommended_scores_capitalized.values()),
        title="",
        color_discrete_sequence=px.colors.sequential.RdBu
    ) 
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', legend=dict( 
            font=dict(color="white"),
            title_font=dict(color="white"),
            bgcolor="rgba(0,0,0,0)",
            x=1,
            y=0.5, 
            xanchor="left",
            yanchor="middle"))
    fig.update_traces(textfont=dict(color='white', size=10), textposition='inside')
    fig.write_html('static/recommended_chart.html')

    both_song_qualities = {}

    key_change = {
        'name': 'Song Name',
        'artists': 'Artist(s)',
        'year': 'Year',
        'duration_ms': 'Duration',
        'tempo': 'Tempo',
        'key': 'Key',
        'mode': 'Mode'
    }

    input_song_qualities = df.loc[df['name'] == input_song].iloc[0][['name', 'artists', 'year', 'duration_ms', 'tempo', 'key', 'mode']].to_dict()

    input_song_qualities['Key and Mode'] = combine_key(input_song_qualities['key'], input_song_qualities['mode'])
    input_song_qualities['tempo'] = str(round(input_song_qualities['tempo'])) + " bpm"
    input_song_qualities['artists'] = input_song_qualities['artists'].replace("['", "").replace("']", "")
    input_song_qualities['duration_ms'] = duration_convert(input_song_qualities['duration_ms'])

    legible_input_song_qualities = {key_change.get(key, key): value for key, value in input_song_qualities.items()}

    rec_song_qualities = df.loc[df['name'] == song].iloc[0][['name', 'artists', 'year', 'duration_ms', 'tempo', 'key', 'mode']].to_dict()

    rec_song_qualities['Key and Mode'] = combine_key(rec_song_qualities['key'], rec_song_qualities['mode'])
    rec_song_qualities['tempo'] = str(round(rec_song_qualities['tempo'])) + " bpm"
    rec_song_qualities['artists'] = rec_song_qualities['artists'].replace("['", "").replace("']", "")
    rec_song_qualities['duration_ms'] = duration_convert(rec_song_qualities['duration_ms'])

    legible_rec_song_qualities = {key_change.get(key, key): value for key, value in rec_song_qualities.items()}

    both_song_qualities = {
        "input_song": legible_input_song_qualities,
        "recommended_song": legible_rec_song_qualities
    }

    return jsonify({
        "emotion_results": emotion_results,
        "track_metadata": both_song_qualities
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)