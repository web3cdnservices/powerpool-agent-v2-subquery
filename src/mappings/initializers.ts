import {Agent as RandaoAgent, Job, ExecutionRevert} from "../types/models";

const AGENT_ID:string = "Agent";


export async function getOrCreateRandaoAgent(): Promise<RandaoAgent> {
    let randaoAgent = await RandaoAgent.get(AGENT_ID);
    if (!randaoAgent) {
        randaoAgent = RandaoAgent.create({
            activeJobsCount: 0n,
            activeKeepersCount: 0n,
            address: "",
            agentMaxCvpStake: 0n,
            cvp: "",
            executionsCount: 0n,
            feePpm: 0n,
            feeTotal: 0n,
            id: AGENT_ID,
            jobCompensationMultiplierBps: 0n,
            jobFixedRewardFinney: 0n,
            jobMinCreditsFinney: 0n,
            jobOwnersCount: 0n,
            jobsBalanceCount: 0n,
            jobsCount: 0n,
            keeperActivationTimeoutHours: 0n,
            keepersCount: 0n,
            lastKeeperId: 0n,
            minKeeperCVP: 0n,
            owner: "",
            paidCount: 0n,
            pendingWithdrawalTimeoutSeconds: 0n,
            period1: 0n,
            period2: 0n,
            profitCount: 0n,
            slashingEpochBlocks: 0n,
            slashingFeeBps: 0n,
            slashingFeeFixedCVP: 0n,
            stakeCount: 0n,
            stakeDivisor: 0n
        })
    }

    return randaoAgent;
}

export async function getJobByKey(jobKey: string): Promise<Job> {
    let job = await Job.get(jobKey)
    if (!job) {
        throw new Error(`Job with a key ${jobKey} should exist`);
    }
    return job
}
