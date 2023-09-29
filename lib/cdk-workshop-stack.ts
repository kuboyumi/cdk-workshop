import { 
  aws_apigateway,
  aws_iam,
  aws_lambda,
  aws_ssm,
  Stack,
  StackProps
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new aws_lambda.Function(this, 'HelloHandler', {
      runtime: aws_lambda.Runtime.NODEJS_14_X,    // execution environment
      code: aws_lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'hello.handler'                    // file is "hello", function is "handler"
    })

    // defines an IP address to allow access to the API Gateway
    const ssmApigatewayIp = aws_ssm.StringParameter.valueForStringParameter(this, '/apigateway/allow-ip')

    // defines a resource policy to attach to the API Gateway
    const resourcePolicy = new aws_iam.PolicyDocument({
      statements: [
        new aws_iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          effect: aws_iam.Effect.ALLOW,
          principals: [new aws_iam.AnyPrincipal()],
          resources: ['*'],
        }),
        new aws_iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          effect: aws_iam.Effect.DENY,
          principals: [new aws_iam.AnyPrincipal()],
          resources: ['*'],
          conditions: {
            NotIpAddress: {
              'aws:SourceIp': [ssmApigatewayIp],
            },
          },
        })
      ],
    })

    // defines an API Gateway REST API resource backed by our "hello" function
    new aws_apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: hello,
      policy: resourcePolicy
    })
  }
}
