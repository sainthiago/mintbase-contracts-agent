import { contractMinters, storeData } from "@mintbase-js/data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get("contractId");

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is a required parameter." },
        { status: 400 }
      );
    }

    const { data: contractData, error: contractError } = await storeData(
      contractId
    );

    if (!contractData?.nft_contracts?.length || contractError) {
      return NextResponse.json(
        { error: `Contract ${contractId} was not found.` },
        { status: 404 }
      );
    }

    const { data: mintersData, error: mintersError } = await contractMinters(
      contractId
    );

    if (!mintersData || mintersError) {
      return NextResponse.json(
        { error: `Minters for contract ${contractId} were not found` },
        { status: 404 }
      );
    }

    const contractInfo = {
      name: contractData.nft_contracts[0].name,
      owner: contractData.nft_contracts[0].owner_id,
      minters: mintersData,
    };

    return NextResponse.json(contractInfo);
  } catch (error) {
    console.error("Error fetching contract info:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract info." },
      { status: 500 }
    );
  }
}
