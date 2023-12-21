import assert from "assert";
import {
    AcceptJobTransferLog as AcceptJobTransferRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {AcceptJobTransfer} from "../../types"
import {BigNumber} from "ethers/lib/ethers";

export async function handleAcceptJobTransfer(log: AcceptJobTransferRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing AcceptJobTransfer Handle`);

    const job = await getJobByKey(log.args.jobKey_);

    job.ownerId = log.args.to_;
    job.pendingOwnerId = undefined;

    await job.save();

    const entity = AcceptJobTransfer.create({
        createTxHash: "", createdAt: 0n, id: log.transaction.hash, jobId: "", to: ""

    });

    entity.createTxHash = log.transaction.hash;
    entity.createdAt = log.block.timestamp;
    entity.jobId = log.args.jobKey_;
    entity.to = log.args.to_;

    await entity.save();
}
