import assert from "assert";
import {
    JobUpdateLog as JobUpdateRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {JobUpdate} from "../../types"

export async function handleJobUpdate(log: JobUpdateRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing JobUpdate Handle`);

    const job = await getJobByKey(log.args.jobKey);

    job.minKeeperCVP = log.args.jobMinCvp.toBigInt();
    job.rewardPct = log.args.rewardPct.toBigInt();
    job.fixedReward = log.args.fixedReward.toBigInt();
    job.maxBaseFeeGwei = log.args.maxBaseFeeGwei.toBigInt();
    job.intervalSeconds = log.args.intervalSeconds.toBigInt();

    await job.save();

    const jobUpdate = JobUpdate.create({
        createTxHash: log.transaction.hash,
        createdAt: log.block.timestamp,
        fixedReward: log.args.fixedReward.toBigInt(),
        id: log.transaction.hash,
        intervalSeconds: log.args.intervalSeconds.toBigInt(),
        jobId: log.args.jobKey,
        jobMinCvp: log.args.jobMinCvp.toBigInt(),
        maxBaseFeeGwei: log.args.maxBaseFeeGwei.toBigInt(),
        rewardPct: log.args.rewardPct.toBigInt()
    });

    await jobUpdate.save();


}