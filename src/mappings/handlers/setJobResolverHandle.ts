import assert from "assert";
import {
    SetJobResolverLog as SetJobResolverRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {SetJobResolver} from "../../types"
import {logger} from "ethers/lib/ethers";



export async function handleSetJobResolver(log: SetJobResolverRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing SetJobResolver Handle`);

    const job = await getJobByKey(log.args.jobKey);

    job.resolverAddress = log.args.resolverAddress;
    job.resolverCalldata = log.args.resolverCalldata;

    await job.save();

    const entity = SetJobResolver.create({
        createTxHash: "", createdAt: 0n, id: log.transaction.hash, jobId: "", resolverAddress: "", resolverCalldata: ""
    });

    entity.createTxHash = log.transaction.hash;
    entity.createdAt = log.block.timestamp;
    entity.jobId = log.args.jobKey;
    entity.resolverAddress = log.args.resolverAddress;
    entity.resolverCalldata = log.args.resolverCalldata;

    await entity.save();
}