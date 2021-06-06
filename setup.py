import pandas
import requests
import pandas as pd
import numpy as np
import sqlalchemy as sqla
import requests_cache
import json
from datetime import date, timedelta

requests_cache.install_cache('college-ed')

parameters = {
    "api_key": "daePtNus2DGUVCe0eXiKnhSnUxKCaSt192a4yJqR",
    "fields": "school.name,id,2018.student.enrollment.undergrad_12_month,school.locale"
}

df = pd.DataFrame()

for i in range(341):
    parameters['page'] = i
    result = requests.get("https://api.data.gov/ed/collegescorecard/v1/schools", params=parameters)
    df = df.append(pd.DataFrame.from_dict(result.json()['results']))

df = df.dropna()

df['num_students'] = df['2018.student.enrollment.undergrad_12_month']

df = df[df['num_students'] > 1500]

print(df.head())

print(len(df.index))

locale_dict_detailed = {
    11.0: "City: Large (population of 250,000 or more)",
    12.0: "City: Midsize (population of at least 100,000 but less than 250,000)",
    13.0: "City: Small (population less than 100,000)",
    21.0: "Suburb: Large (outside principal city, in urbanized area with population of 250,000 or more)",
    22.0: "Suburb: Midsize (outside principal city, in urbanized area with population of at least 100,000 but less than 250,000)",
    23.0: "Suburb: Small (outside principal city, in urbanized area with population less than 100,000)",
    31.0: "Town: Fringe (in urban cluster up to 10 miles from an urbanized area)",
    32.0: "Town: Distant (in urban cluster more than 10 miles and up to 35 miles from an urbanized area)",
    33.0: "Town: Remote (in urban cluster more than 35 miles from an urbanized area)",
    41.0: "Rural: Fringe (rural territory up to 5 miles from an urbanized area or up to 2.5 miles from an urban cluster)",
    42.0: "Rural: Distant (rural territory more than 5 miles but up to 25 miles from an urbanized area or more than 2.5 and up to 10 miles from an urban cluster)",
    43.0: "Rural: Remote (rural territory more than 25 miles from an urbanized area and more than 10 miles from an urban cluster)",
}

locale_dict_simple = {
    11.0: "City: Large",
    12.0: "City: Midsize",
    13.0: "City: Small",
    21.0: "Suburb: Large",
    22.0: "Suburb: Midsize",
    23.0: "Suburb: Small",
    31.0: "Town: Fringe",
    32.0: "Town: Distant",
    33.0: "Town: Remote",
    41.0: "Rural: Fringe",
    42.0: "Rural: Distant",
    43.0: "Rural: Remote",
}


colleges = pd.read_csv("colleges.csv")

colleges['ipeds_id'] = colleges['ipeds_id'].apply(pandas.to_numeric)

colleges = pd.merge(colleges, df, right_on="id", left_on="ipeds_id")

colleges['cases_per_capita'] = colleges['cases'] / colleges['num_students']

colleges = colleges.sort_values(by=['state'])
colleges["locale_name"] = colleges['school.locale'].map(locale_dict_simple)
colleges["locale_name_detailed"] = colleges['school.locale'].map(locale_dict_detailed)

colleges.to_csv('colleges_with_pop.csv')

print(colleges)




