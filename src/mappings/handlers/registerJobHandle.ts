import {
    RegisterJobLog as RegisterJobRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import  {createJob,getOrCreateJobOwner,BIG_INT_ONE, BIG_INT_ZERO} from "../../helpers/initializers"
import {getOrCreateRandaoAgent} from "../initializers";
import {BigNumber} from "ethers/lib/ethers";
import assert from "assert";
import {JobOwner} from "../../types";

export async function handleRegisterJob(log: RegisterJobRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing RegisterJob Handle`);

    const jobKey = log.args.jobKey;
    const job = await createJob(jobKey);
    const jobOwner = await getOrCreateJobOwner(log.args.owner);

    await jobOwner.save();

    job.createTxHash = log.transaction.hash;
    job.createdAt = log.block.timestamp;
    job.active = true;
    job.jobAddress = log.args.jobAddress;
    job.jobId = log.args.jobId.toBigInt();
    job.ownerId = log.args.owner;
    job.jobSelector = log.args.params.jobSelector;

    job.maxBaseFeeGwei = BigInt(log.args.params.maxBaseFeeGwei);
    job.rewardPct = BigInt(log.args.params.rewardPct);
    job.fixedReward = BigInt(log.args.params.fixedReward);
    job.calldataSource = BigInt(log.args.params.calldataSource);
    job.intervalSeconds = BigInt(log.args.params.intervalSeconds);

    job.credits = BIG_INT_ZERO; // should be incremented by a deposit event handler
    job.lastExecutionAt = BIG_INT_ZERO;
    job.minKeeperCVP = log.args.params.jobMinCvp.toBigInt();

    job.useJobOwnerCredits = log.args.params.useJobOwnerCredits;
    job.assertResolverSelector = log.args.params.assertResolverSelector;

    job.totalCompensations = BIG_INT_ZERO;
    job.totalProfit = BIG_INT_ZERO;
    job.totalExpenses = BIG_INT_ZERO;

    job.executionCount = BIG_INT_ZERO;
    job.executionRevertCount = BIG_INT_ZERO;
    job.slashingCount = BIG_INT_ZERO;
    job.depositCount = BIG_INT_ZERO;
    job.withdrawalCount = BIG_INT_ZERO;

    job.jobCreatedAt = log.block.timestamp;
    job.jobNextKeeperId = BIG_INT_ZERO;
    job.jobReservedSlasherId = BIG_INT_ZERO;
    job.jobSlashingPossibleAfter = BIG_INT_ZERO;

    await job.save();

  const agent = await getOrCreateRandaoAgent();
    // If job owner not exist here, he will be created at next step. So we can legally increment jow owners counter here.
    let jobOwnerExists=await JobOwner.get(log.args.owner);
    if (jobOwnerExists === undefined) {
        agent.jobOwnersCount = BigNumber.from(agent.jobOwnersCount).add(BIG_INT_ONE).toBigInt();
    }

    agent.jobsCount = BigNumber.from(agent.jobsCount).add(BIG_INT_ONE).toBigInt();
    agent.activeJobsCount = BigNumber.from(agent.activeJobsCount).add(BIG_INT_ONE).toBigInt();

    await agent.save();
}