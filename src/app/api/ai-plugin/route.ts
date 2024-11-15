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
      "/api/{token}": {
        get: {
          operationId: "get-contract-info",
          description:
            "Get contract info from Mintbase indexer. Info can be name, owner and minters.",
          parameters: [
            {
              name: "contract",
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
                      id: {
                        type: "string",
                      },
                      owner: {
                        type: "string",
                      },
                      symbol: {
                        type: "string",
                      },
                      decimals: {
                        type: "number",
                      },
                      icon: {
                        type: "string",
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
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/swap/{tokenIn}/{tokenOut}/{quantity}": {
        get: {
          operationId: "get-swap-transactions",
          description:
            "Get a transaction payload for swapping between two tokens using the best trading route on Ref.Finance. Token identifiers can be the name, symbol, or contractId and will be fuzzy matched automatically.",
          parameters: [
            {
              name: "tokenIn",
              in: "path",
              description: "The identifier for the input token.",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "tokenOut",
              in: "path",
              description: "The identifier for the output token.",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "quantity",
              in: "path",
              description: "The amount of tokens to swap (input amount).",
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
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        signerId: {
                          type: "string",
                          description:
                            "The account ID that will sign the transaction",
                        },
                        receiverId: {
                          type: "string",
                          description:
                            "The account ID of the contract that will receive the transaction",
                        },
                        actions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                description: "The type of action to perform",
                              },
                              params: {
                                type: "object",
                                properties: {
                                  methodName: {
                                    type: "string",
                                    description:
                                      "The name of the method to be called",
                                  },
                                  args: {
                                    type: "object",
                                    description:
                                      "Arguments for the function call",
                                  },
                                  gas: {
                                    type: "string",
                                    description:
                                      "Amount of gas to attach to the transaction",
                                  },
                                  deposit: {
                                    type: "string",
                                    description:
                                      "Amount to deposit with the transaction",
                                  },
                                },
                                required: [
                                  "methodName",
                                  "args",
                                  "gas",
                                  "deposit",
                                ],
                              },
                            },
                            required: ["type", "params"],
                          },
                        },
                      },
                      required: ["signerId", "receiverId", "actions"],
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
          },
        },
      },
    },
  };
  return NextResponse.json(pluginData);
}
