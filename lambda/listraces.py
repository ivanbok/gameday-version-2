import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

client = boto3.client('dynamodb')

def lambda_handler(event, context):
  country = event["queryStringParameters"]["country"]
  starttime = event["queryStringParameters"]["starttime"]
  endtime = event["queryStringParameters"]["endtime"]
  
  ## For Testing
  # country = 'singapore'
  # starttime = 202206041000
  # endtime = 202206052000
  
  ## API Gateway Parameters
  # country=singapore&starttime=202206041000&endtime=202206052000
  
  data = client.query(
    TableName='racingresults',
    KeyConditionExpression='country = :country AND #dt BETWEEN :date1 AND :date2',
    ExpressionAttributeValues={
      ':country': {
        'S': country
      },
      ':date1': {
        'N': starttime
      },
      ':date2': {
        'N': endtime
      },
    },
    ExpressionAttributeNames={
      "#dt": "datetime"}
  )
  
  if data["Count"] == 0:
    body = json.dumps({})
  else:
    races = []
    for item in data["Items"]:
        races.append({"country": item["country"]["S"], "datetime": item["datetime"]["N"]})
    body = json.dumps(races)

  response = {
      'statusCode': 200,
      'body': body,
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
  }
  
  return response