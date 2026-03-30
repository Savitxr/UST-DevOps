from collections import Counter
import re

inputfile = "test.log"
outputfile = "output.txt" 

counts = Counter()
lines = []

word_pattern = re.compile(r"\b[a-zA-Z0-9]+\b")

with open(inputfile, "r") as f:
    for line in f:
        line_lower = line.lower()
        lines.append(line_lower)

        words = word_pattern.findall(line_lower)
        counts.update(words)


with open(outputfile, "w") as out:  
    for k, v in counts.items():
        if v < (len(lines) * 0.01):
            for line in lines:
                if k in line.lower().split():
                    out.write(line)   
print("Check Output.txt for the flagged lines")
