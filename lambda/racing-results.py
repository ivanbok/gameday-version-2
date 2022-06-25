import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

client = boto3.client('dynamodb')

def lambda_handler(event, context):
  country = event["queryStringParameters"]["country"]
  date_time = event["queryStringParameters"]["datetime"]

  ## For Testing
  # country = 'singapore'
  # datetime = 202206061200

  ## API Gateway Parameters
  # country=singapore&datetime=202206061200
  
  data = client.query(
    TableName='racingresults',
    KeyConditionExpression='country = :country AND #dt = :date_time',
    ExpressionAttributeValues={
      ':country': {
        'S': country
      },
      ':date_time': {
        'N': date_time
      },
    },
    ExpressionAttributeNames={
      "#dt": "datetime"}
  )
  
  if data["Count"] == 0:
    body = json.dumps()
  else:
    # body = json.dumps(data)
    num_racers = int(len(data["Items"][0])-2)
    body_list = []
    for i in range(1,num_racers+1):
      body_list.append(winnerstrtodict(data["Items"][0][str(i)]["S"]))
    body = json.dumps(body_list)
    # body = data["Items"][0]["1"]["S"]
  
  response = {
      'statusCode': 200,
      'body': body,
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
  }
  
  return response

def winnerstrtodict(stringinput):
  # stringinput = "Max Verstappen,Red Bull,125"
  arr = stringinput.split(",")
  dictoutput = {"position": arr[0], "driver": arr[1], "team": arr[2], "points": arr[3]}
  return dictoutput