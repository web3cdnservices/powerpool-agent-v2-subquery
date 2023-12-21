import assert from "assert";
import {
    JobUpdateLog as JobUpdateRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {JobUpdate} from "../../types"
import {logger} from "ethers/lib/ethers";

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
        createTxHash: "",
        createdAt: 0n,
        fixedReward: 0n,
        id: log.transaction.hash,
        intervalSeconds: 0n,
        jobId: "",
        jobMinCvp: 0n,
        maxBaseFeeGwei: 0n,
        rewardPct: 0n

    });

    jobUpdate.createTxHash = log.transaction.hash;
    jobUpdate.createdAt = log.block.timestamp;
    jobUpdate.jobId = log.args.jobKey;
    jobUpdate.maxBaseFeeGwei = log.args.maxBaseFeeGwei.toBigInt();
    jobUpdate.rewardPct = log.args.rewardPct.toBigInt();
    jobUpdate.fixedReward = log.args.fixedReward.toBigInt();
    jobUpdate.jobMinCvp = log.args.jobMinCvp.toBigInt();
    jobUpdate.intervalSeconds = log.args.intervalSeconds.toBigInt();

    await jobUpdate.save();
}