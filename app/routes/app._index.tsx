import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  DataTable,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              media(first: 1) {
                edges {
                  node {
                    preview {
                      image {
                        url
                      }
                    }
                  }
                }
              }

              priceRangeV2 {
                minVariantPrice {
                  amount
                }
              }
              totalInventory
              combinedListing {
                parentProduct {
                  totalInventory
                }
              }
              
            }
          }
        }
        }
      `
  );
  

  const responseJson = await response.json();
  const products = responseJson.data.products.edges.map((edge: any) => edge.node);

  return { products };
};
export const action = async ({ request }: ActionFunctionArgs) => {
};
// Helper function to generate random numbers
const generateRandomSales = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const randomSales = generateRandomSales(0, 1000); // Generate random sales between 0 and 1000


export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  const rows = products.map((product: any) => {
    const randomSales = generateRandomSales(0, 1000); // Generate random sales between 0 and 1000
    const totalSalesValue = randomSales * parseFloat(product.priceRangeV2.minVariantPrice.amount); // Calculate total sales value
    return [
      <img width={150} src={product.media.edges[0]?.node.preview.image.url} alt={product.title} />,
      product.title,
      `$${product.priceRangeV2.minVariantPrice.amount}`,
      randomSales,
      product.totalInventory,
      `$${totalSalesValue.toFixed(2)}`,
    ];
  });

  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();

  return (
    <Page fullWidth>
      <TitleBar title="My Listly">
        <Link url="/app" external>
          Back to Home
        </Link>
      </TitleBar>
      <BlockStack>
        <Layout>
          <Layout.Section>
            <BlockStack>
            <DataTable
        columnContentTypes={[
          'text',
          'text',
          'numeric',
          'numeric',
          'numeric',
          'numeric',
        ]}
        headings={[
          'Image',
          'Product Name',
          'Price',
          'Number of times purchased',
          'Current stock level',
          'Total value of orders',
        ]}
        rows={rows}
        pagination={{
          hasNext: true,
          onNext: () => {},
        }}
      />       
                </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

