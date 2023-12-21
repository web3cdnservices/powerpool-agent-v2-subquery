import assert from "assert";
import {
    WithdrawJobOwnerCreditsLog as WithdrawJobOwnerCreditsRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {BigNumber} from "ethers/lib/ethers";
import {
    BIG_INT_ONE, getOrCreateJobOwner, createJobOwnerWithdrawal
} from "../../helpers/initializers";
import {getOrCreateRandaoAgent} from "../initializers";

export async function handleWithdrawJobOwnerCredits(log: WithdrawJobOwnerCreditsRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing WithdrawJobOwnerCredits Handle`);

    const jobOwner = await getOrCreateJobOwner(log.args.jobOwner);

    const withdrawalKey = log.args.jobOwner.concat("-").concat(jobOwner.withdrawalCount.toString());

    const withdrawal = await createJobOwnerWithdrawal(withdrawalKey);

    withdrawal.createTxHash = log.transaction.hash;
    withdrawal.jobOwnerId = log.args.jobOwner;
    withdrawal.to = log.args.to;
    withdrawal.amount = log.args.amount.toBigInt();
    withdrawal.createdAt = log.block.timestamp;

    await withdrawal.save();


    jobOwner.credits = BigNumber.from(jobOwner.credits).sub(log.args.amount).toBigInt();
    jobOwner.withdrawalCount = BigNumber.from(jobOwner.withdrawalCount).add(BIG_INT_ONE).toBigInt();

    await jobOwner.save();


    const agent = await getOrCreateRandaoAgent();
    agent.jobsBalanceCount = BigNumber.from(agent.jobsBalanceCount).sub(log.args.amount).toBigInt();

    await agent.save();
}