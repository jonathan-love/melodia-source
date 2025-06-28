# Recommendation logic

import pandas as pd
import numpy as np
import plotly.express as px
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

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

previous_recommendations = [] # To store in a DB if ever expanding upon this

# Preprocess clusters (KMeans). Scaled to feature_weights
def process_pca_and_clusters():

    X = df[music_terms]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    weights = [feature_weights[feat] for feat in music_terms]
    X_weighted = X_scaled * weights

    N_CLUSTERS = 20 # Ideal range: 15-25. < 10 is too broad, > 30 is too specific
    song_cluster_pipeline = Pipeline([('kmeans', KMeans(n_clusters=N_CLUSTERS, verbose=False, random_state=42))], verbose=False)

    song_cluster_pipeline.fit(X_weighted)
    song_cluster_labels = song_cluster_pipeline.predict(X_weighted)
    df['cluster_label'] = song_cluster_labels

    pca_pipeline = Pipeline([('pca', PCA(n_components=2))])
    song_embedding = pca_pipeline.fit_transform(X_weighted)

    projection = pd.DataFrame(columns=['x', 'y'], data=song_embedding)
    projection['title'] = df['name']
    projection['cluster'] = df['cluster_label']

    # Generate 2D projection of cluster data 
    fig = px.scatter(
        projection, 
        x='x', y='y', 
        color='cluster', 
        color_discrete_sequence=px.colors.sequential.Purpor,
         hover_data=['x','y','title'], 
        )

    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)', 
        legend=dict(
            font=dict(color="white"),
            title_font=dict(color="white"),
            bgcolor="rgba(0,0,0,0)",
            x=1,
            y=0.5,
            xanchor="left",
            yanchor="middle"),
        coloraxis_colorbar=dict(
            tickfont=dict(color="white"),
            title=dict(text="Cluster", font=dict(color="white"))),
        xaxis=dict(
            showgrid=False,
            title=dict(font=dict(color="white")),
            tickfont=dict(color="white")),
        yaxis=dict(
            showgrid=False,
            title=dict(font=dict(color="white")),
            tickfont=dict(color="white"))
    )

    # Note to reduce depending on dataset size
    fig.update_traces(marker=dict(size=3))

    html_path = 'static/pca_plot.html'
    fig.write_html(html_path)

    return html_path


def get_nearest_songs(song_name, num_recommendations=1, language_code="en"):
    global previous_recommendations

    if song_name not in df['name'].values:
        return pd.DataFrame()

    song_data = df[df['name'] == song_name]
    song_cluster = song_data['cluster_label'].values[0]

    cluster_songs = df[df['cluster_label'] == song_cluster]

    scaler = StandardScaler()
    X_cluster_scaled = scaler.fit_transform(cluster_songs[music_terms])
    X_song_scaled = scaler.transform(song_data[music_terms])

    similarities = cosine_similarity(X_song_scaled, X_cluster_scaled)[0]
    cluster_songs = cluster_songs.copy()
    cluster_songs['similarity'] = similarities

    if language_code:
        cluster_songs = cluster_songs[cluster_songs['language'] == language_code]

    cluster_songs = cluster_songs[~cluster_songs['name'].isin(previous_recommendations)]
    cluster_songs = cluster_songs.sort_values(by='similarity', ascending=False)

    if cluster_songs.empty:
        previous_recommendations = []
        return get_nearest_songs(song_name, num_recommendations, language_code)

    nearest_songs = cluster_songs.iloc[:num_recommendations]

    return nearest_songs