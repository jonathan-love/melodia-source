library(ggplot2)
library(dplyr)
library(viridis)

setwd("/Users/conta/Desktop/honours/attempt-2/flask-client/data")


df <- read.csv("data_cleaned.csv")

ggplot(df, aes(x = danceability, y = energy, color = language)) +
  geom_point(alpha = 0.9, size = 1) +
  scale_color_viridis_d(option = "magma", end = 0.9) +
  labs(
    title = "Danceability vs Energy",
    x = "Danceability",
    y = "Energy",
    color = "Language"
  ) +
  theme_minimal(base_size = 11)
