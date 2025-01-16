import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Votingdapp } from "@/../anchor/target/types/votingdapp"
import { Program } from "@coral-xyz/anchor";
import { BN } from "bn.js";

const IDL = require("../../../../anchor/target/idl/votingdapp.json")

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://engineering.jhu.edu/magazine/2016/06/internet-voting-nonstarter/backtalk_onlinevoting_cmyk-copy/",
    title: "Vote for your favorite peanut butter",
    description: "Vote between crunchy and smooth peanut butter.",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Vote for Crunchy",
          href: "/api/vote?candidate=Crunchy",
          type: "transaction"
        },
        {
          label: "Vote for Smooth",
          href: "/api/vote?candidate=Smooth",
          type: "transaction"
        }
      ]
    }
  };
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "Crunchy" && candidate != "Smooth"){
    return new Response("Invalid candidate", { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  //http://localhost:3000/api/vote/?candidate=Smooth

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Votingdapp> = new Program( IDL, {connection});
  const body: ActionPostRequest = await request.json();
  let voter: PublicKey;

  try {
    voter = new PublicKey(body.account);
  } catch(error) {
    return new Response("Invalid account", { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const instruction = await program.methods
  .vote(
    candidate, new BN(1)
  )
  .accounts({
    signer: voter,
  })
  .instruction()

  const blockhash = await connection.getLatestBlockhash();

  const transction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transction
    }
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });

}