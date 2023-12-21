import {
  Job,
  JobDeposit,
  JobOwner,
  JobOwnerDeposit,
  JobOwnerWithdrawal,
  JobWithdrawal,
  Keeper,
  KeeperRedeemFinalize,
  KeeperRedeemInit,
  KeeperStake,
  Agent as RandaoAgent, Execution
} from "../types";
import {BigNumber} from "ethers/lib/ethers";

export const BIG_INT_ZERO = 0n;
export const BIG_INT_ONE = 1n;
export const BIG_INT_TWO = 2n;
export const ZERO_ADDRESS = 0n;




/**
 *
 * @param jobKey
 */
export async function createJob(jobKey: string): Promise<Job> {
  let job = await Job.get(jobKey)
  if (job) {
    throw new Error(`Job with a key ${jobKey} already exists`);
  }
  job = Job.create({
    active: false,
    assertResolverSelector: false,
    calldataSource: 0n,
    createTxHash: "",
    createdAt: 0n,
    credits: 0n,
    depositCount: 0n,
    executionCount: 0n,
    executionRevertCount: 0n,
    fixedReward: 0n,
    id: jobKey,
    intervalSeconds: 0n,
    jobAddress: "",
    jobCreatedAt: 0n,
    jobId: 0n,
    jobNextKeeperId: 0n,
    jobReservedSlasherId: 0n,
    jobSelector: "",
    jobSlashingPossibleAfter: 0n,
    lastExecutionAt: 0n,
    maxBaseFeeGwei: 0n,
    minKeeperCVP: 0n,
    ownerId: "",
    rewardPct: 0n,
    slashingCount: 0n,
    totalCompensations: 0n,
    totalExpenses: 0n,
    totalProfit: 0n,
    useJobOwnerCredits: false,
    withdrawalCount: 0n
  });

  return job
}

/**
 *
 * @param jobKey
 */
export async function getJobByKey(jobKey: string): Promise<Job> {
  let job = await Job.get(jobKey)
  if (!job) {
    throw new Error(`Job with a key ${jobKey} should exist`);
  }
  return job
}

/**
 *
 * @param ownerAddress
 */
export async function getOrCreateJobOwner(ownerAddress: string): Promise<JobOwner> {
  let jobOwner = await JobOwner.get(ownerAddress)
  if (!jobOwner) {
    jobOwner = JobOwner.create({
      credits: BIG_INT_ZERO, depositCount: BIG_INT_ZERO, id: ownerAddress, withdrawalCount: BIG_INT_ZERO
    })
  }
  return jobOwner;
}

/**
 *
 * @param id
 */
export async function createKeeper(id: string): Promise<Keeper> {
  let keeper = await Keeper.get(id)
  if (keeper) {
    throw new Error(`Keeper with address ${id} already exists`);
  } {
    keeper = Keeper.create({
      active: false,
      admin: "",
      compensationWithdrawalCount: 0n,
      compensations: 0n,
      compensationsToWithdraw: 0n,
      createTxHash: "",
      createdAt: 0n,
      currentStake: 0n,
      executionCount: 0n,
      expenses: 0n,
      getBySlashStake: 0n,
      getBySlashStakeCounter: 0n,
      id: id,
      keeperActivationCanBeFinalizedAt: 0n,
      numericalId: 0n,
      pendingWithdrawalAmount: 0n,
      pendingWithdrawalEndsAt: 0n,
      profit: 0n,
      redeemFinalizeCount: 0n,
      redeemInitCount: 0n,
      slashedStake: 0n,
      slashedStakeCounter: 0n,
      stakeCount: 0n,
      worker: ""
    })
  }

  return keeper;
}

/**
 *
 * @param id
 */
export async function getKeeper(id: string): Promise<Keeper> {
  let keeper = await Keeper.get(id)
  if (!keeper) {
    throw new Error(`Keeper with address ${id} does not exists`);
  }
  return keeper;
}

/**
 *
 * @param id
 */
export async function createJobDeposit(id: string): Promise<JobDeposit> {
  let deposit = await JobDeposit.get(id)
  if (deposit) {
    throw new Error(`JobDeposit with the key ${id} already exists`);
  }
  deposit = JobDeposit.create({
    amount: 0n, createTxHash: "", createdAt: 0n, depositor: "", fee: 0n, id: id, jobId: "", total: 0n
  })

  return deposit;
}

/**
 *
 * @param id
 */
export async function createJobWithdrawal(id: string): Promise<JobWithdrawal> {
  let withdrawal = await JobWithdrawal.get(id)
  if (withdrawal) {
    throw new Error(`JobWithdrawal with the key ${id} already exists`);
  }
  withdrawal = JobWithdrawal.create({amount: 0n, createTxHash: "", createdAt: 0n, id: id, jobId: "", owner: "", to: ""});

  return withdrawal;
}

/**
 *
 * @param id
 */
export async function createJobOwnerDeposit(id: string): Promise<JobOwnerDeposit> {
  let deposit = await JobOwnerDeposit.get(id)
  if (deposit) {
    throw new Error(`JobOwnerDeposit with the key ${id} already exists`);
  }
  deposit = JobOwnerDeposit.create({
    amount: 0n, createTxHash: "", createdAt: 0n, depositor: "", fee: 0n, id: id, jobOwnerId: "", total: 0n

  })
  return deposit;
}

/**
 *
 * @param id
 */
export async function createJobOwnerWithdrawal(id: string): Promise<JobOwnerWithdrawal> {
  let withdrawal = await JobOwnerWithdrawal.get(id)
  if (withdrawal) {
    throw new Error(`JobOwnerWithdrawal with the key ${id} already exists`);
  }
  withdrawal = JobOwnerWithdrawal.create({amount: 0n, createTxHash: "", createdAt: 0n, id: id, jobOwnerId: "", to: ""})

  return withdrawal;
}

/**
 *
 * @param id
 */
export async function createKeeperStake(id: string): Promise<KeeperStake> {
  let stake = await KeeperStake.get(id)
  if (stake) {
    throw new Error(`KeeperStake with the key ${id} already exists`);
  }
  stake = KeeperStake.create({
    amount: 0n, createTxHash: "", createdAt: 0n, id: id, keeperId: "", staker: ""
  });

  return stake;
}

/**
 *
 * @param id
 */
export async function createKeeperRedeemInit(id: string): Promise<KeeperRedeemInit> {
  let init = await KeeperRedeemInit.get(id)
  if (init) {
    throw new Error(`KeeperRedeemInit with the key ${id} already exists`);
  }

  init = KeeperRedeemInit.create({
    availableAt: 0n,
    cooldownSeconds: 0n,
    createTxHash: "",
    createdAt: 0n,
    id: id,
    initiatedAt: 0n,
    inputAmount: 0n,
    keeperId: "",
    slashedStakeReduction: 0n,
    stakeReduction: 0n
  });

  return init;
}

/**
 *
 * @param id
 */
export async function createKeeperRedeemFinalize(id: string): Promise<KeeperRedeemFinalize> {
  let finalize = await KeeperRedeemFinalize.get(id)
  if (finalize) {
    throw new Error(`KeeperRedeemFinalize with the key ${id} already exists`);
  } else
  {
    finalize = KeeperRedeemFinalize.create({
      amount: 0n, createTxHash: "", createdAt: 0n, id: id, keeperId: "", to: ""

    })
  }
  return finalize;
}

/**
 *
 * @param id
 */
export async function getCertainExecution(id: string): Promise<Execution> {
  // load in block used when we are certain entity created in the same block, so graph won't try access database and save time while indexing
  let execution = await Execution.get(id);
  // @CHECKME
  // let execution = Execution.loadInBlock(id);
  if (!execution) {
    throw new Error(`Execution with address ${id} does not exists`);
  }
  return execution;
}