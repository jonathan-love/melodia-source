library(ggplot2)
library(dplyr)
library(viridis)

data <- read.csv("data_cleaned.csv")

ggplot(data, aes(x = danceability)) +
  geom_histogram(aes(y = ..density.., fill = ..count..), 
                 bins = 30, color = "black") +
  scale_fill_viridis(option = "plasma") +
  ggtitle("Normality Histogram") +
  xlab("Danceability") +
  ylab("Frequency") +
  theme_minimal()
