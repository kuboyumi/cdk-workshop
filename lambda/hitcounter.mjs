import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDBClient();
  const lambda = new LambdaClient();

  // update dynamo entry for "path" with hits++
  const dynamoCommand = new UpdateItemCommand({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  });
  await dynamo.send(dynamoCommand);

  // call downstream function and capture response
  const lambdaCommand = new InvokeCommand({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  });
  const response = await lambda.send(lambdaCommand);

  console.log('downstream response:', JSON.stringify(response, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(response.Payload.transformToString('utf-8'));
};
