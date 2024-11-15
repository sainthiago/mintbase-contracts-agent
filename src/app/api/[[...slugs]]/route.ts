import { swagger } from "@elysiajs/swagger";

import { Elysia } from "elysia";

import { contractMinters, storeData } from "@mintbase-js/data";
import { GAS, ONE_YOCTO } from "@mintbase-js/sdk";

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get("/:contractId", async ({ params: { contractId } }) => {
    const { data: contractData, error: contractError } = await storeData(
      contractId
    );

    console.log({ contractId, contractData });

    const contractExists = contractData?.nft_contracts.length === 0;
    if (!contractExists || contractError) {
      return {
        error: `Contract ${contractId} was not found.`,
      };
    }

    const { data: mintersData, error: mintersError } = await contractMinters(
      contractId
    );

    if (!mintersData || mintersError) {
      return {
        error: `Minters for contract ${contractId} were not found`,
      };
    }

    return {
      name: contractData.nft_contracts[0].name,
      owner: contractData.nft_contracts[0].owner_id,
      minters: mintersData,
    };
  })
  .get(
    "/transfer-ownership/:contractId/:newOwner",
    async ({
      params: { contractId, newOwner },
      headers,
    }): Promise<any | { error: string }> => {
      const mbMetadata: { accountId: string } | undefined =
        headers["mb-metadata"] && JSON.parse(headers["mb-metadata"]);
      const accountId = mbMetadata?.accountId || "near";

      const { data: contractData, error: contractError } = await storeData(
        contractId
      );

      const contractExists = contractData?.nft_contracts.length === 0;
      if (!contractExists || contractError) {
        return {
          error: `Contract ${contractId} was not found.`,
        };
      }

      if (contractData.nft_contracts[0].owner_id !== accountId) {
        return {
          error: `${accountId} is not the owner of the contract.`,
        };
      }

      const transactionPayload = {
        receiverId: accountId,
        signerId: accountId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "transfer_store_ownership",
              contractAddress: contractId,
              args: {
                new_owner: newOwner,
                keep_old_minters: true,
              },
              gas: GAS,
              deposit: ONE_YOCTO,
            },
          },
        ],
      };

      return transactionPayload;
    }
  )
  .compile();

export const GET = app.handle;
export const POST = app.handle;
