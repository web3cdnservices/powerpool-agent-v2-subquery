import assert from "assert";
import {
    DepositJobCreditsLog as DepositJobCreditsRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {
    BIG_INT_ONE,createJobDeposit
} from "../../helpers/initializers";
import {BigNumber, logger} from "ethers/lib/ethers";

export async function handleDepositJobCredits(log: DepositJobCreditsRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing DepositJobCredits Handle`);

    const job = await getJobByKey(log.args.jobKey);

    const depositKey = log.args.jobKey.concat("-").concat(job.depositCount.toString());
    const deposit = await createJobDeposit(depositKey);
    deposit.jobId = log.args.jobKey;
    deposit.createTxHash = log.transaction.hash;
    deposit.depositor = log.args.depositor;
    deposit.amount = log.args.amount.toBigInt();
    deposit.fee = log.args.fee.toBigInt();
    deposit.total = log.args.fee.add(log.args.amount).toBigInt();
    deposit.createdAt = log.block.timestamp;

    await deposit.save();

    job.credits = BigNumber.from(job.credits).add(log.args.amount).toBigInt();
    job.depositCount = BigNumber.from(job.depositCount).add(BIG_INT_ONE).toBigInt();

    await job.save();
}