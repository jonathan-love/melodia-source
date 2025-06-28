library(ggplot2)
library(dplyr)
library(FSA)
library(viridis)

data <- read.csv("data_cleaned.csv")

kruskal_test <- kruskal.test(energy ~ language, data = data)
print(kruskal_test)

dunn_test <- dunnTest(energy ~ language, data = data)
print(dunn_test)

ggplot(data, aes(x = language, y = energy, fill = language)) +
  stat_summary(fun = "mean", geom = "bar", position = "dodge", width = 0.7) +
  stat_summary(fun.data = "mean_se", geom = "errorbar", width = 0.25, color = "black") +
  scale_fill_viridis(discrete = TRUE, option = "plasma") +
  labs(title = "Energy by Language",
       x = "Language",
       y = "Energy") +
  theme_minimal()
