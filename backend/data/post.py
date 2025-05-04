import json
import re

f = open("data/train_no_dup.json")

d = {}
with open("data/category_id.txt") as cat:
    for line in cat:
       (key, val) = re.split(r'(?<=\d)\D', line, maxsplit=1)
       d[int(key)] = val[0:-1]
cat.close()

data = json.load(f)
x = []

for i in data:
    for item in i['items']:
        if item['name'] == '':
            continue
        x.append([item['name']+ "," +d[item['categoryid']]])
        
        
with open('data/post.txt', 'w') as outfile:
    json.dump(x, outfile, indent=4)

f.close()