#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ProductsAppStack} from "../lib/productsApp-stack";
import {EcommerceApiStack} from "../lib/ecommerceApi-stack";
import * as dotenv from 'dotenv';
dotenv.config();

const app = new cdk.App();

const env: cdk.Environment = {
    account: process.env.S3_BUCKET,
    region: "us-east-1",
}

const tags =  {
    cost: "Ecommerce",
    team: "thinkShield"
}

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
    tags: tags,
    env: env
});

const eCommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
    productsFetchHandler: productsAppStack.productsFetchHandler,
    productsAdminHandler: productsAppStack.productsAdminHandler,
    tags: tags,
    env: env
})

eCommerceApiStack.addDependency(productsAppStack)
