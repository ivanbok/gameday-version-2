import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

client = boto3.client('dynamodb')

def lambda_handler(event, context):
  country = event["queryStringParameters"]["country"]
  race_datetime = event["queryStringParameters"]["racedatetime"]
  # username = event["queryStringParameters"]["username"]
  username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
  
  ## For Testing
  #country = 'singapore'
  #race_datetime = '202206241200'
  #username = "ivan"
  
  ## API Gateway Parameters
  # country=singapore&starttime=202206041000&endtime=202206052000
  
  data = client.query(
    TableName='gamedaybettingresults',
    KeyConditionExpression='username = :username AND race_datetime = :race_datetime',
    ExpressionAttributeValues={
      ':username': {
        'S': username
      },
      ':race_datetime': {
        'N': race_datetime
      },
    }
  )
  
  if data["Count"] == 0:
    body = json.dumps({})
  else:
    bet_result = []
    for item in data["Items"]:
        if item["country"]["S"] == country:
            bet_result.append({"country": item["country"]["S"], 
                "race_datetime": item["race_datetime"]["N"], 
                "country": item["country"]["S"],
                "bet_amount": item["bet_amount"]["N"],
                "winnings": item["winnings"]["N"],
                "bet_type": item["bet_type"]["S"],
                "bet_value": item["bet_value"]["S"],
                "result_value": item["result_value"]["S"],
            })
    body = json.dumps(bet_result)

  response = {
      'statusCode': 200,
      'body': body,
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
  }
  
  return response