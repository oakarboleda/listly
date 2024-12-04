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
              
            }
          }
        }
        }
      `
  );

  const responseJson = await response.json();
  // const getOrdersJson = await getOrders.json();
  const products = responseJson.data.products.edges.map((edge: any) => edge.node);
  // const orders = getOrders.data.orders.edges.map((edge: any) => edge.node);

  return { products };
};
export const action = async ({ request }: ActionFunctionArgs) => {
};

export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  // const { orders } = useLoaderData<typeof loader>();
  const rows = products.map((product: any) => [
    <img width={150} src={product.media.edges[0]?.node.preview.image.url} alt={product.title} />,
    product.title,
    `$${product.priceRangeV2.minVariantPrice.amount}`,
    product.totalSales,
    product.totalInventory,
    `$${(product.totalSales * product.priceRangeV2.minVariantPrice.amount).toFixed(2)}`,
  ]);

  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();

  useEffect(() => {
  }, []);


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

