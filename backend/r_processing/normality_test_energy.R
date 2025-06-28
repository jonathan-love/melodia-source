library(ggplot2)
library(dplyr)
library(viridis)

setwd("/Users/conta/Desktop/honours/attempt-2/flask-client/data")

data <- read.csv("data_cleaned.csv")

ggplot(data, aes(x = energy)) +
  geom_histogram(aes(y = ..density.., fill = ..count..), 
                 bins = 30, color = "black") +
  scale_fill_viridis(option = "plasma") +
  ggtitle("Histogram of Energy (Testing for Data Normality)") +
  xlab("Energy") +
  ylab("Frequency") +
  theme_minimal()
