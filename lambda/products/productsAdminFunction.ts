import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {Context} from "vm";
import {ProductsRepository} from "/otp/nodejs/productsLayer";
import {DynamoDB} from "aws-sdk";
import {Product} from "aws-sdk/clients/ssm";

const productsDdb = process.env.PRODUCTS_DDB; //table name defined in productsApp-stack file
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductsRepository(ddbClient, productsDdb);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    const method = event.httpMethod;

    console.log(`API Gateway RequestId: ${apiRequestId} -  lambda RequestId: ${lambdaRequestId}`);

    if (event.resource === "/products") {
        console.log("POST-products");
        const product = JSON.parse(event.body!) as Product;
        try {
            const productCreated = await productRepository.create(product)
            return {
                statusCode: 201,
                body: JSON.stringify(productCreated)
            }
        } catch (error) {
            console.error((<Error>error).message)
            return {
                statusCode:504,
                body:JSON.stringify((<Error>error).message)
            }
        }

    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string;
        if (event.httpMethod === "PUT") {

            console.log(`PUT-products - ID:${productId}`);
            const product = JSON.parse(event.body!) as Product;
            try {
                const productUpdated = await productRepository.update(productId, product);
                return {
                    statusCode: 200,
                    body: JSON.stringify(productUpdated)
                }
            } catch (ConditionalCheckFailException) {
                return {
                    statusCode:404,
                    body: "Product not found"
                }
            }
        } else if (event.httpMethod === "DELETE") {
            console.log(`DELETE-products - ID:${productId}`);
            try{
                const product = await productRepository.delete(productId);
                return {
                    statusCode: 200,
                    body: JSON.stringify(`Deleted product ${product} Id:${productId}`)
                }
            } catch (error) {
                console.error((<Error>error).message)
                return {
                    statusCode:404,
                    body:(<Error>error).message
                }
            }
        }
    }

    return {
        statusCode: 400,
        body: "Bad Request"
    }
}
