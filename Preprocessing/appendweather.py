from math import cos, asin, sqrt
import pandas as pd
import numpy as np
import os
import re
import datetime
import csv
from sys import argv

def distance(slat1, slon1, slat2, slon2):
    lat1 = float(slat1)
    lon1 = float(slon1)
    lat2 = float(slat2)
    lon2 = float(slon2)
    p = 0.017453292519943295
    a = 0.5 - cos((lat2-lat1)*p)/2 + cos(lat1*p)*cos(lat2*p) * (1-cos((lon2-lon1)*p)) / 2
    return 12742 * asin(sqrt(a))

def closest(data, v):
    return min(data, key=lambda p: distance(v['lat'],v['lon'],p['lat'],p['lon']))

def buildWeatherDict(wlines):
    weather_dict = {}
    for wline_ in wlines[1:]:
        line_ = wline_.split(' ')
        sensorid_ = line_[0]
        lst_date = line_[3]
        lst_time = line_[4] 
        if not sensorid_ in weather_dict:
            weather_dict[sensorid_] = {}
        if not lst_date in weather_dict[sensorid_]:
            weather_dict[sensorid_][lst_date] = {}
        weather_dict[sensorid_][lst_date][lst_time] = line_
    return weather_dict
        
def getWeatherDataforSensor(idate, itime, sensorId):
    if idate in weatherDict[sensorId]:
        if itime in weatherDict[sensorId][idate]:
            weatherdata_ = weatherDict[sensorId][idate][itime]
            return (weatherdata_[8],weatherdata_[12])
    for sensId in sensorIds:
        if sensId == sensorId:
            continue
        if idate in weatherDict[sensId]:
            if itime in weatherDict[sensId][idate]:
                weatherdata_ = weatherDict[sensId][idate][itime]
                return (weatherdata_[8],weatherdata_[12])

    return (5,0)

def processWeatherFile():
    filed_ = open("weatherfinal.txt", 'r')
    fileo_ = open("weatherfinal_updated.txt","w")
    lines_ = filed_.readlines()
    for line_ in lines_:
        outline = re.sub("  +"," ",line_)
        fileo_.write(outline)
    fileo_.close()
    filed_.close()
    

def getWeatherData():
    filer_ = open("weatherfinal_updated.txt","r")
    return (filer_.readlines())


def getSensorLatLong(weatherDataLines):
    sensorDetails = [] 
    sensorlistdict = {}
    linecount = 0
    for wline_ in weatherDataLines[1:]:
        linecount += 1
        line_ = wline_.split(' ')
        if line_[0] in sensorlistdict:
            continue
        sensorDetails.append({'sensorid':line_[0], 'lon':line_[6],'lat':line_[7]})
        sensorlistdict[line_[0]] = 1
    return (sensorDetails, sensorlistdict)
    

print os.getcwd()

processWeatherFile()

print "Completed replacing space"

weatherData = getWeatherData()

weatherDict = buildWeatherDict(weatherData)
sensorIds = weatherDict.keys()

print "completed building weather dictionary"

(sensorDetails, sensorIds) = getSensorLatLong(weatherData)

i=0
outlist = []
collisionFileName = argv[1]
print "Filename=" + collisionFileName
with open(collisionFileName, 'r') as f:
    reader = f.readlines() 
    for row in reader:
        fieldcount = 0
        outrow = row.strip()
        if i==0:
            outrow = outrow +  ",TEMP,PREC" + "\n"
        else:
            allcols = row.split(",")
            tdate_ = allcols[0].strip()
            ttime_ = allcols[1].strip()
            try:
                lon_ = float(allcols[5].strip())
                lat_ = float(allcols[4].strip())
                fwdate = datetime.datetime.strptime(str(tdate_), '%m/%d/%Y').strftime('%Y%m%d')
                fwtime = datetime.datetime.strptime(str(ttime_), '%H:%M').strftime('%H%M')
            except:
                continue
            ntime = float(fwtime) + float(100)
            closestSensor = closest(sensorDetails, {'lat':lat_,'lon':lon_})
            (temp, prec) = getWeatherDataforSensor(fwdate,fwtime, closestSensor['sensorid'])
            appendData = "," + str(temp) + "," + str(prec) + "\n" 
            outrow = outrow + appendData 
        i += 1
        if i % 100000 == 0: 
            print "Completed " + str(i) 

            
        outlist.append(outrow)


print "Completed processing"
outfileName = argv[2]

fd = open(outfileName, "w")
for outlines in outlist:
    fd.write(outlines)
fd.close()
print "Completed file write"


