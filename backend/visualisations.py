# Chart and visualisation creation

import os
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

df = pd.read_csv("data/data.csv")

# Duration Histogram - Language-separated durations of songs
def duration_histogram():

    df['duration_sec'] = df['duration_ms'] / 1000

    fig = px.histogram(df, x='duration_sec', nbins=50, title='', labels={'duration_sec': 'Song Duration (s)'}, color='language', color_discrete_sequence=px.colors.sequential.RdBu)
    
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color="white"),
        title_font=dict(color="white"), 
        xaxis=dict(
            title_font=dict(color="white"),
            tickfont=dict(color="white")
        ),
        yaxis=dict(
            title_font=dict(color="white"),
            tickfont=dict(color="white")
        ),
        legend=dict(
            font=dict(color="white"),
            title_font=dict(color="white"),
            bgcolor="rgba(0,0,0,0)"
        )
    )

    html_path = 'static/histogram.html'
    fig.write_html(html_path)

    return html_path

# Lang Pie Chart - Distrubution of languages in dataset
def language_pie_chart():

    df_filtered = df[df['language'] != 'No match found']

    language_counts = df_filtered['language'].value_counts().reset_index()
    language_counts.columns = ['language', 'count']

    fig = px.pie(language_counts, names='language', values='count',title='', hole=0.5, color_discrete_sequence=px.colors.sequential.RdBu)

    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', legend=dict(font=dict(color="white"), title_font=dict(color="white"), bgcolor="rgba(0,0,0,0)", x=1, y=0.5, xanchor="left", yanchor="middle"))

    fig.update_traces(textfont=dict(color='white', size=10), textposition='inside')

    html_path = 'static/language_pie.html'
    fig.write_html(html_path)

    return html_path

def generate_charts():

    if os.path.exists("static/languauge_pie.html"):
        os.remove("static/languauge_pie.html")
    elif os.path.exists("static/histogram.html"):
        os.remove("static/histogram.html")

    duration_histogram()
    language_pie_chart()