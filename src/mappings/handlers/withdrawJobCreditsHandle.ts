import assert from "assert";
import {
    WithdrawJobCreditsLog as WithdrawJobCreditsRandao
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {createJobWithdrawal, BIG_INT_ONE} from "../../helpers/initializers"
import {BigNumber, logger} from "ethers/lib/ethers";

export async function handleWithdrawJobCredits(log: WithdrawJobCreditsRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing WithdrawJobCredits Handle`);

    const job = await getJobByKey(log.args.jobKey);

    const withdrawalKey = log.args.jobKey.concat("-").concat(job.withdrawalCount.toString());
    const withdrawal = await createJobWithdrawal(withdrawalKey);

    withdrawal.jobId = log.args.jobKey;
    withdrawal.createTxHash = log.transaction.hash;
    withdrawal.owner = log.args.owner;
    withdrawal.to = log.args.to;
    withdrawal.amount = log.args.amount.toBigInt();
    withdrawal.createdAt = log.block.timestamp;

    await withdrawal.save();


    job.credits = BigNumber.from(job.credits).sub(log.args.amount).toBigInt();
    job.withdrawalCount = BigNumber.from(job.withdrawalCount).add(BIG_INT_ONE).toBigInt();

    await job.save();
}