import assert from "assert";
import {
    InitiateKeeperSlashingLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {InitiateKeeperSlashing} from "../../types/models"
import {logger} from "ethers/lib/ethers";

export async function handleInitiateKeeperSlashing(log: InitiateKeeperSlashingLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing InitiateKeeperSlashing Handle`);

    const job = await getJobByKey(log.args.jobKey);
    job.jobReservedSlasherId = log.args.slasherKeeperId.toBigInt();
    job.jobSlashingPossibleAfter = log.args.jobSlashingPossibleAfter.toBigInt();

    await job.save();

    const slashing = InitiateKeeperSlashing.create({
        createTxHash: log.transaction.hash,
        createdAt: log.block.timestamp,
        id: log.transaction.hash,
        jobId: log.args.jobKey,
        jobSlashingPossibleAfter: log.args.jobSlashingPossibleAfter.toBigInt(),
        slasherKeeperId: log.args.slasherKeeperId.toString(),
        useResolver: log.args.useResolver
    });

    await slashing.save();
}