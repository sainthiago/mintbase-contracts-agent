import { NextResponse } from "next/server";
import { DEPLOYMENT_URL } from "vercel-url";

const key = JSON.parse(process.env.BITTE_KEY || "{}");
const config = JSON.parse(process.env.BITTE_CONFIG || "{}");

if (!key?.accountId) {
  console.warn("Missing account info.");
}
if (!config || !config.url) {
  console.warn("Missing config or url in config.");
}

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Mintbase Contracts API",
      description:
        "API for managing Mintbase contracts, add/remove minters, transfer ownership.",
      version: "1.0.0",
    },
    servers: [
      {
        url: config?.url || DEPLOYMENT_URL,
      },
    ],
    "x-mb": {
      "account-id": key.accountId || "",
      assistant: {
        name: "Mintbase Contracts Agent",
        description:
          "An assistant that allows users to manage the Mintbase contracts they own - add/remove minters and transfer contract ownership.",
        instructions:
          "Get information for a Mintbase contract or add/remove minters from that contract or transfer ownership of the contract to other wallet. Only possible if the connected wallet is the owner of the contract.",
        tools: [{ type: "generate-transaction" }],
      },
    },
    paths: {
      "/api/tools/get-contract-info": {
        get: {
          operationId: "get-contract-info",
          description:
            "Get contract info from Mintbase indexer. Info can be name, owner and minters.",
          parameters: [
            {
              name: "contractId",
              in: "path",
              description: "The identifier for the contract to get info for.",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      owner: {
                        type: "string",
                      },
                      minters: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                      },
                    },
                    required: ["name", "owner", "minters"],
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/transfer-contract-ownership": {
        post: {
          operationId: "transfer-contract-ownership",
          description:
            "Transfer the ownership of a contract to a new owner. The connected wallet must be the current owner of the contract.",
          parameters: [
            {
              name: "contractId",
              in: "path",
              description: "The identifier for the contract to transfer.",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "newOwner",
              in: "path",
              description: "The account ID of the new owner.",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Ownership transferred successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        description: "Success message",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "The error message",
                      },
                    },
                  },
                },
              },
            },
            "403": {
              description: "Forbidden",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description:
                          "Error message indicating lack of permissions",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return NextResponse.json(pluginData);
}
