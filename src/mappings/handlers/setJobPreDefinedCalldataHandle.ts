import assert from "assert";
import {
    SetJobPreDefinedCalldataLog as SetJobPreDefinedCalldataRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {SetJobPreDefinedCalldata} from "../../types"
import {logger} from "ethers/lib/ethers";



export async function handleSetJobPreDefinedCalldata(log: SetJobPreDefinedCalldataRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing SetJobPreDefinedCalldata Handle`);

    const job = await getJobByKey(log.args.jobKey);
    job.preDefinedCalldata = log.args.preDefinedCalldata;

    await job.save();

    const entity = SetJobPreDefinedCalldata.create({
        createTxHash: "", createdAt: 0n, id: log.transaction.hash, jobId: "", preDefinedCalldata: ""
    });
    entity.createTxHash = log.transaction.hash;
    entity.createdAt = log.block.timestamp;
    entity.jobId = log.args.jobKey;
    entity.preDefinedCalldata = log.args.preDefinedCalldata;

    await entity.save();
}