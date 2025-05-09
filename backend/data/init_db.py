import json
import re
from unidecode import unidecode

train = open("polyvore_data/train_no_dup.json")
valid = open("polyvore_data/valid_no_dup.json")
train_json = json.load(train)
valid_json = json.load(valid)
train.close()
valid.close()

data = train_json + valid_json
d = {}
with open("polyvore_data/clothing_categories.txt") as cat:
    for line in cat:
       (key, val) = re.split(r'(?<=\d)\D', line, maxsplit=1)
       d[int(key)] = val[0:-1]
cat.close()


x = []

for i in data:
    outfit_images_code = i['set_id']
    
    for item in i['items']:
        if not (item['categoryid'] in d):
            continue
        x = x + [{
            'id': str(outfit_images_code) + '/' + str(item['index']),
            'keywords': ' '.join(unidecode(x) for x in item['name'].split()),
            'category': d[item['categoryid']],
        }]
        
        
with open('polyvore_data/items.json', 'w') as outfile:
    json.dump(x, outfile, indent=4)

