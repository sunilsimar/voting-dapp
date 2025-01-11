import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'

describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Votingdapp as Program<Votingdapp>

  const votingdappKeypair = Keypair.generate()

  it('Initialize Votingdapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        votingdapp: votingdappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([votingdappKeypair])
      .rpc()

    const currentCount = await program.account.votingdapp.fetch(votingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Votingdapp', async () => {
    await program.methods.increment().accounts({ votingdapp: votingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingdapp.fetch(votingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Votingdapp Again', async () => {
    await program.methods.increment().accounts({ votingdapp: votingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingdapp.fetch(votingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Votingdapp', async () => {
    await program.methods.decrement().accounts({ votingdapp: votingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingdapp.fetch(votingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set votingdapp value', async () => {
    await program.methods.set(42).accounts({ votingdapp: votingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingdapp.fetch(votingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the votingdapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        votingdapp: votingdappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.votingdapp.fetchNullable(votingdappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
