import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib'
import {Construct} from 'constructs'
//---------------creating storage-----------------------//
import * as dynaDB from 'aws-cdk-lib/aws-dynamodb'
//----------------------------------------------------//

export class ProductsAppStack extends cdk.Stack {
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction; //it's referencing my function
    readonly productsDdb: dynaDB.Table //sets attribute type;

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props)

        this.productsDdb = new dynaDB.Table(this, "productsDdb", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: id,
                type: dynaDB.AttributeType.STRING
            },
            billingMode: dynaDB.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        });

        //productsFetchHandler can be used in the constructor of the archive ecommerceApi-stack when using only .js extension
        this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this,
            "ProductsFetchFunction", {
                functionName: "ProductsFetchFunction", // this is the name I will search for on aws-console
                entry: "lambda/products/productsFetchFunction.ts", //this is where my code will stay
                handler: "handler", // method to be executed in productsFetchFunction.ts
                memorySize: 128, // memory size in mgb when executing the function
                timeout: cdk.Duration.seconds(5), // maximum time of execution
                bundling: { // packaging to upload the function
                    minify: true, // removing spaces and shortening variables' name
                    sourceMap: false
                },
            });
    }
}
