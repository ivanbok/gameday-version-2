import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

client = boto3.client('dynamodb')

def lambda_handler(event, context):
  country = event["queryStringParameters"]["country"]
  starttime = event["queryStringParameters"]["starttime"]
  endtime = event["queryStringParameters"]["endtime"]
  username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
  
  ## For Testing
  # country = 'singapore'
  # starttime = '202206041000'
  # endtime = '202206302000'
  # username = "ivan"
  
  ## API Gateway Parameters
  # country=singapore&starttime=202206041000&endtime=202206302000&username=ivan
  
  data = client.query(
    TableName='gamedaybettingresults',
    KeyConditionExpression='username = :username AND race_datetime BETWEEN :date1 AND :date2',
    ExpressionAttributeValues={
      ':username': {
        'S': username
      },
      ':date1': {
        'N': starttime
      },
      ':date2': {
        'N': endtime
      },
    }
  )
  
  if data["Count"] == 0:
    body = json.dumps({})
  else:
    bet_result = []
    for item in data["Items"]:
        if item["country"]["S"] == country:
            race_datetime = item["race_datetime"]["N"]
            race_datetime_str =  str(race_datetime)[6:8] + '/' + str(race_datetime)[4:6] + '/' + str(race_datetime)[0:4]
            bet_result.append({"country": item["country"]["S"], 
                "race_datetime": race_datetime,
                "race_datetime_str": race_datetime_str
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