import { Stack, StackProps, aws_lambda } from 'aws-cdk-lib';
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
  }
}
