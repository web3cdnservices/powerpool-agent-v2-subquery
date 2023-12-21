import assert from "assert";
import {
    InitiateJobTransferLog as InitiateJobTransferRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {InitiateJobTransfer} from "../../types"

export async function handleInitiateJobTransfer(log: InitiateJobTransferRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing InitiateJobTransfer Handle`);

    const job = await getJobByKey(log.args.jobKey);
    job.pendingOwnerId = log.args.to;
    await job.save();

    const entity = InitiateJobTransfer.create({
        createTxHash: "", createdAt: 0n, from: "", id: log.transaction.hash, jobId: "", to: ""
    });

    entity.createTxHash = log.transaction.hash;
    entity.createdAt = log.block.timestamp;
    entity.jobId = log.args.jobKey;
    entity.to = log.args.to;
    entity.from = log.args.from;

    await entity.save();
}