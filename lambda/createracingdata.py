import json
import math
import random
import datetime

import boto3

client = boto3.client('dynamodb')

def lambda_handler(event, context):
    
    generateresults("singapore")
    generateresults("australia")
    generateresults("new zealand")
    generateresults("thailand")

    response = {
        'statusCode': 200,
        'body': 'successfully created item!',
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    }
    return response

def generateresults(country):
    # Generate Results
    results = generatewinnerlist()
    
    #################################
    ## Build item ###################
    #################################
    
    # Get current datetime and convert to int
    now = datetime.datetime.now()
    dt_string = now.strftime("%Y%m%d") + "1200"

    # Begin building item    
    item = {"country": {'S': country}, "datetime": {'N': dt_string}}
    
    # Load racers
    count = 1
    for row in results:
        # Each row entry will take the format of "rank,driver,team,score"
        # For example: "1,Max Verstappen,Red Bull,125"
        row_string = str(count) + ',' + row["driver"] + "," + row["team"] + "," + str(row["score"])
        item[str(count)] = {'S': row_string}
        count += 1
    
    data = client.put_item(
        TableName='racingresults',
        Item=item)

def generatewinnerlist():
    driverlist = [{"driver": "Max Verstappen", "team": "Red Bull"},\
        {"driver": "Pierre Gasly", "team": "Alpha Tauri"},\
        {"driver": "Sergio Perez", "team": "Red Bull"},\
        {"driver": "Felipe Nasr", "team": "Sauber-Ferrari"},\
        {"driver": "Fernando Alonso", "team": "Alpine"},\
        {"driver": "Charles Leclerc", "team": "Ferrari"},\
        {"driver": "Lance Stroll", "team": "Aston Martin"},\
        {"driver": "Stoffel Vandoorne", "team": "McLaren"},\
        {"driver": "Kevin Magnussen", "team": "Haas"},\
        {"driver": "Esteban Gutierrez", "team": "Haas"},\
        {"driver": "Yuki Tsunoda", "team": "Alpha Tauri"},\
        {"driver": "Alexander Albon", "team": "Williams"},\
        {"driver": "Guanyu Zhou", "team": "Alfa Romeo"},\
        {"driver": "Daniil Kvyat", "team": "Alpha Tauri"},\
        {"driver": "Daniel Ricciardo", "team": "McLaren"}]
    
    for driver in driverlist:
        driver["score"] = random.randint(0,150)
    
    sortedList = sorted(driverlist, key = lambda i: i['score'],reverse=True)
    results = sortedList[0:10]
    return results