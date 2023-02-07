import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {Context} from "vm";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    const method = event.httpMethod;

    console.log(`API Gateway RequestId: ${apiRequestId} -  lambda RequestId: ${lambdaRequestId}`);

    if (event.resource === '/products') {
        if (method === 'GET') {
            console.log('GET');

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'GET-products - ok'
                })
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: 'Bad request'
        })
    }
}
