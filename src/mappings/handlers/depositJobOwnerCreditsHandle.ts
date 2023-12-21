import assert from "assert";
import {
    DepositJobOwnerCreditsLog as DepositJobOwnerCreditsRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {BigNumber} from "ethers/lib/ethers";
import {
    BIG_INT_ONE, getOrCreateJobOwner, createJobOwnerDeposit
} from "../../helpers/initializers";
import {getOrCreateRandaoAgent} from "../initializers";

export async function handleDepositJobOwnerCredits(log: DepositJobOwnerCreditsRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing DepositJobOwnerCredits Handle`);

    const jobOwner = await getOrCreateJobOwner(log.args.jobOwner);

    const depositKey = log.args.jobOwner.concat("-").concat(jobOwner.depositCount.toString());
    const deposit = await createJobOwnerDeposit(depositKey);
    deposit.jobOwnerId = log.args.jobOwner;
    deposit.createTxHash = log.transaction.hash;
    deposit.amount = log.args.amount.toBigInt();
    deposit.fee = log.args.fee.toBigInt();
    deposit.total = log.args.fee.add(log.args.amount).toBigInt();
    deposit.createdAt = log.block.timestamp;
    deposit.depositor = log.args.depositor;

    await deposit.save();

    jobOwner.credits = BigNumber.from(jobOwner.credits).add(log.args.amount).toBigInt();
    jobOwner.depositCount = BigNumber.from(jobOwner.depositCount).add(BIG_INT_ONE).toBigInt();

    await jobOwner.save();

    const agent = await getOrCreateRandaoAgent();
    agent.jobsBalanceCount = BigNumber.from(agent.jobsBalanceCount).add(log.args.amount).toBigInt();

    await agent.save();

}