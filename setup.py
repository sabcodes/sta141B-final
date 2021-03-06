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

# print(df.head())

# print(len(df.index))

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

state_averages = colleges.groupby('state').sum()

state_averages = state_averages.drop(columns=["ipeds_id", "school.locale", "id", "ipeds_id", "2018.student.enrollment.undergrad_12_month"])

state_averages["cases_per_capita"] = state_averages["cases"] / state_averages["num_students"]


# print(state_averages)


state_averages.to_csv('college_state_averages.csv')

counties = pd.read_csv("counties.csv")

states = counties.groupby('state').sum()
# print(states)

better_pop_data = pd.read_csv('co-est2020-alldata.csv')

better_pop_data = better_pop_data[["STNAME", "CTYNAME", "POPESTIMATE2020", "COUNTY"]]


state_pops = better_pop_data[better_pop_data["COUNTY"] == 0]
state_pops = state_pops.drop(columns=["COUNTY", "CTYNAME"])

county_pops = better_pop_data[better_pop_data["COUNTY"] != 0]
county_pops = county_pops.drop(columns=["COUNTY"])


state_pops.to_csv('state_pops.csv')
county_pops.to_csv('county_pops.csv')

states = pd.merge(states, state_pops, right_on="STNAME", left_on="state")

states['cases_per_capita'] = states['cases'] / states['POPESTIMATE2020']

states.to_csv("states.csv")

colleges['county_state'] = colleges['county'] + ' ' + colleges['state']

# print(colleges.head())

thingy = colleges.groupby(['state', 'locale_name']).sum()

thingy = thingy.drop(columns=['2018.student.enrollment.undergrad_12_month', 'ipeds_id', 'id', 'school.locale', 'cases_2021'])

thingy['cases_per_capita'] = thingy['cases'] / thingy['num_students']

# print(thingy)

thingy.to_json("data_states.json", orient='index')
thingy.to_csv("data_states.csv")

# print(thingy)

data_dict = {}

# thingy['state'] = thingy['state']

for index, row in thingy.iterrows():
    if index[0] not in data_dict:
        data_dict[index[0]] = {}
    data_dict[index[0]][index[1]] = row[2]
# print(data_dict)


with open("sample.json", "w") as outfile:
    json.dump(data_dict, outfile)


all_states = thingy.groupby('locale_name').sum()

all_states['cases_per_capita'] = all_states['cases'] / all_states['num_students']

# print(all_states.head())

all_states.to_json('all_states.json', orient='index')

states = states[['STNAME', 'cases_per_capita']]

states = states.set_index('STNAME')


# print(states.head())

states.to_json('states.json', orient='index')



# colleges = pd.merge(colleges, df, right_on="id", left_on="ipeds_id")



