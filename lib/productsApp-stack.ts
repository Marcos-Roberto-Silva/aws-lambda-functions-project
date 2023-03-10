import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib'
import {Construct} from 'constructs'
//---------------creating storage-----------------------//
import * as dynaDB from 'aws-cdk-lib/aws-dynamodb'
//----------------------------------------------------//
import * as ssm from "aws-cdk-lib/aws-ssm";

export class ProductsAppStack extends cdk.Stack {
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction; //it's referencing my function
    readonly productsAdminHandler: lambdaNodeJS.NodejsFunction;

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

        //ProductsLayers
        const productsLayerArn = ssm.StringParameter.valueForStringParameter(this,"productsLayersVersionArn")
        const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "productsLayersVersionArn", productsLayerArn)

        //productsFetchHandler can be used in the constructor of the archive ecommerceApi-stack when using only .js extension
        //This method was built to be able to perform action as: GET requests
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
                environment: {
                    PRODUCTS_DDB: this.productsDdb.tableName
                },
                layers: [productsLayer] //here I'm setting permissions to this method access the layers and share information
            });
        this.productsDdb.grantReadData(this.productsFetchHandler); //permission for the function access the table

        //This method was built to be able to perform actions as: POST/ UPDATE and DELETE
        this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this,
            "ProductsAdminFunction", {
                functionName: "ProductsAdminFunction", // this is the name I will search for on aws-console
                entry: "lambda/products/productsAdminFunction.ts", //this is where my code will stay
                handler: "handler", // method to be executed in productsFetchFunction.ts
                memorySize: 128, // memory size in mgb when executing the function
                timeout: cdk.Duration.seconds(5), // maximum time of execution
                bundling: { // packaging to upload the function
                    minify: true, // removing spaces and shortening variables' name
                    sourceMap: false
                },
                environment: {
                    PRODUCTS_DDB: this.productsDdb.tableName
                },
                layers: [productsLayer] //here I'm setting permissions to this method access the layers and share information
            });
        this.productsDdb.grantWriteData(this.productsAdminHandler); //permission to the function access the table
    }
}
