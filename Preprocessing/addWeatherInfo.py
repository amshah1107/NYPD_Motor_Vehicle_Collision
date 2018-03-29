from math import cos, asin, sqrt
import pandas as pd
import numpy as np
import os
import re
import datetime

def distance(lat1, lon1, lat2, lon2):
    p = 0.017453292519943295
    a = 0.5 - cos((lat2-lat1)*p)/2 + cos(lat1*p)*cos(lat2*p) * (1-cos((lon2-lon1)*p)) / 2
    return 12742 * asin(sqrt(a))

def closest(data, v):
    return min(data, key=lambda p: distance(v['lat'],v['lon'],p['lat'],p['lon']))

tempDataList = []

#v = {'lat': 39.7622290, 'lon': -86.1519750}
#print(closest(tempDataList, v))

print os.getcwd()

filed_ = open("weatherfinal.txt", 'r')
fileo_ = open("weatherfinal_updated.txt","w")
lines_ = filed_.readlines()
for line_ in lines_:
    outline = re.sub("  +"," ",line_)
    fileo_.write(outline + "\n")
fileo_.close()

df = pd.read_csv("NYPD_Motor_Vehicle_Collisions.csv")

colhead = np.append(df.columns.values,['TEMP', 'PREP'])

outdf = pd.DataFrame(columns=colhead)

df2 = pd.read_csv("weatherfinal_updated.txt",' ')
df2.set_index(['WBANNO', 'LST_DATE', 'LST_TIME'])

sensorIds = df2['WBANNO'].unique()

for ids_ in sensorIds:
    longitude = df2.loc[df2['WBANNO']==ids_,'LONGITUDE'].iloc[0]
    latitude = df2.loc[df2['WBANNO'] == ids_, 'LATITUDE'].iloc[0]
    tempDataList.append({'lat':latitude,'lon':longitude,'SENSORID': ids_ })

print tempDataList

for index, row in df.iterrows():
    lon_ = row['LONGITUDE']
    lat_ = row['LATITUDE']
    tdate = row['DATE']
    ttime = row['TIME']
    tcal = 5
    pcal = 0
    fwdate = datetime.datetime.strptime(str(tdate), '%m/%d/%Y').strftime('%Y%m%d')
    fwtime = datetime.datetime.strptime(str(ttime), '%H:%M').strftime('%H%M')
    ntime = float(fwtime) + float(100)
    closests_ = closest(tempDataList, {'lat':lat_,'lon':lon_})
    sensorid = closests_['SENSORID']
    usedSensorId = sensorid
    selectedWeatherRow = df2.loc[(df2.WBANNO == sensorid) & (df2.LST_DATE == float(fwdate)) & (df2.LST_TIME >= float(fwtime)) & (df2.LST_TIME < ntime) ,['T_CALC', 'P_CALC']]
    if len(selectedWeatherRow.index) == 0:
        for sensId in sensorIds:
            if sensId == sensorid:
                continue
            selectedWeatherRow = df2.loc[(df2.WBANNO == sensId) & (df2.LST_DATE == float(fwdate)) & (df2.LST_TIME >= float(fwtime)) & (df2.LST_TIME < ntime), ['T_CALC', 'P_CALC']]
            if len(selectedWeatherRow.index) == 0:
                continue
            else:
                tcal = selectedWeatherRow['T_CALC'].values[0]
                pcal = selectedWeatherRow['P_CALC'].values[0]
                usedSensorId = sensId
                break
    else:
        tcal = selectedWeatherRow['T_CALC'].values[0]
        pcal = selectedWeatherRow['P_CALC'].values[0]
    row['TEMP'] = tcal
    row['PREP'] = pcal
    outdf.loc[index] = row
    print index, tcal, pcal, fwdate, fwtime, ntime, usedSensorId


print "Loop completed"
outdf.to_csv("NYPD_TRAFFIC_DATA.csv")
print "file completed"
