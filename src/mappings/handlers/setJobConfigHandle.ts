import assert from "assert";
import {
    SetJobConfigLog as SetJobConfigRandao
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey, getOrCreateRandaoAgent} from "../initializers";
import {SetJobConfig} from "../../types"
import {BigNumber} from "ethers";
import {
    BIG_INT_ONE
} from "../../helpers/initializers";

export async function handleSetJobConfig(log: SetJobConfigRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing SetJobConfig Handle`);

    const job = await getJobByKey(log.args.jobKey);

    job.active = log.args.isActive_;
    job.useJobOwnerCredits = log.args.useJobOwnerCredits_;
    job.assertResolverSelector = log.args.assertResolverSelector_;

    await job.save();

    const entity = SetJobConfig.create({
        assertResolverSelector: false,
        createTxHash: "",
        createdAt: 0n,
        id: log.transaction.hash,
        isActive: false,
        jobId: "",
        useJobOwnerCredits: false

    });

    entity.createTxHash = log.transaction.hash;
    entity.createdAt = log.block.timestamp;
    entity.jobId = log.args.jobKey;
    entity.isActive = log.args.isActive_;
    entity.useJobOwnerCredits = log.args.useJobOwnerCredits_;
    entity.assertResolverSelector = log.args.assertResolverSelector_;

    await entity.save();

    const agent = await getOrCreateRandaoAgent();
    // if config wants to change job active state, we should handle activeJobsCount
    if (!job.active && log.args.isActive_) {
        agent.activeJobsCount = BigNumber.from(agent.activeJobsCount).add(BIG_INT_ONE).toBigInt();
    } else if (job.active && !log.args.isActive_) {
        agent.activeJobsCount = BigNumber.from(agent.activeJobsCount).sub(BIG_INT_ONE).toBigInt();
    }

    await agent.save();
}