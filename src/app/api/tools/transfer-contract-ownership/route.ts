import { storeData } from "@mintbase-js/data";
import { GAS, ONE_YOCTO } from "@mintbase-js/sdk";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const accountId = searchParams.get("accountId");
    const contractId = searchParams.get("contractId");
    const newOwner = searchParams.get("newOwner");

    if (!contractId || !newOwner || !accountId) {
      return NextResponse.json(
        {
          error: "contractId, newOwner and accountID are required parameters.",
        },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ transactionPayload });
  } catch (error) {
    console.error("Error generating NEAR transaction payload:", error);
    return NextResponse.json(
      { error: "Failed to generate NEAR transaction payload" },
      { status: 500 }
    );
  }
}
