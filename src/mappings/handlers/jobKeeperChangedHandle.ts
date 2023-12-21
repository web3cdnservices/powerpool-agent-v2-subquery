import assert from "assert";
import {
    JobKeeperChangedLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {JobKeeperChanged} from "../../types"

export async function handleJobKeeperChanged(log: JobKeeperChangedLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing JobKeeperChanged Handle`);

    const job = await getJobByKey(log.args.jobKey);
    job.jobNextKeeperId = log.args.keeperTo.toBigInt();

    await job.save();

    const keeperChanged = JobKeeperChanged.create({
        createTxHash: "", createdAt: 0n, id: log.transaction.hash, jobId: "", keeperFromId: "", keeperToId: ""
    });

    keeperChanged.createTxHash = log.transaction.hash;
    keeperChanged.createdAt = log.block.timestamp;
    keeperChanged.jobId = log.args.jobKey;
    keeperChanged.keeperFromId = log.args.keeperFrom.toString();
    keeperChanged.keeperToId = log.args.keeperTo.toString();

    await keeperChanged.save();
}