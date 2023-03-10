import * as cdk from 'aws-cdk-lib'
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cwLogs from 'aws-cdk-lib/aws-logs';
import {Construct} from 'constructs'
import {ApiGateway} from "aws-cdk-lib/aws-events-targets";

interface ECommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJS.NodejsFunction
    productsAdminHandler: lambdaNodeJS.NodejsFunction
}

export class EcommerceApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
        super(scope, id, props);

        const logGroup = new cwLogs.LogGroup(this, "EcommerceApiLogs");

        const api = new apiGateway.RestApi(this, "ECommerceApi", {
            restApiName: "ECommerceApi",
            deployOptions: {
                accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
                accessLogFormat:apiGateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true,
                    ip: true,
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    caller: true,
                    user: true,
                })
            }
        })

        const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler);
        // '/products'
        const productsResource =  api.root.addResource('products');
        productsResource.addMethod("GET", productsFetchIntegration)

        // '/products/{id}'
        // here I'm adding a new resource into an existing one, in this case the product id.
        const productsIdResource = productsResource.addResource("{id}");
        productsIdResource.addMethod("GET", productsFetchIntegration);


        const productsAdminIntegration = new apiGateway.LambdaIntegration(props.productsAdminHandler);

        // POST /products
        productsResource.addMethod("POST", productsAdminIntegration);

        // PUT /products/{productId}
        productsIdResource.addMethod("PUT", productsAdminIntegration);

        // DELETE /products/{productId}
        productsIdResource.addMethod("DELETE", productsAdminIntegration);

    }
}
