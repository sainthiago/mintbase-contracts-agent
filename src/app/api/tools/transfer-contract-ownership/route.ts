import { storeData } from "@mintbase-js/data";
import { GAS, ONE_YOCTO } from "@mintbase-js/sdk";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const mbMetadata = JSON.parse(headersList.get("mb-metadata") || "{}");
    const accountId = mbMetadata?.accountData?.accountId || "near";

    const { searchParams } = new URL(request.url);

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

    if (
      contractError ||
      !contractData ||
      contractData.nft_contracts.length === 0
    ) {
      return NextResponse.json(
        {
          error: `Contract ${contractId} was not found.`,
        },
        { status: 404 }
      );
    }

    if (contractData.nft_contracts[0].owner_id !== accountId) {
      return NextResponse.json(
        {
          error: `${accountId} is not the owner of the contract.`,
        },
        { status: 403 }
      );
    }

    const transactionPayload = {
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
