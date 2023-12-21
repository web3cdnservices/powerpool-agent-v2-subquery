import assert from "assert";
import {
    SetRdConfigLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getOrCreateRandaoAgent, getJobByKey} from "../initializers";
import {BigNumber} from "ethers/lib/ethers";


/****** RANDAO-SPECIFIC HANDLERS ******/
export async function handleSetRdConfig(log: SetRdConfigLog): Promise<void> {
  assert(log.args, "No log.args");

  logger.debug(`Processing SetRdConfig Handle`);

  const randaoAgent = await getOrCreateRandaoAgent();

  randaoAgent.slashingEpochBlocks = BigNumber.from(log.args.rdConfig.slashingEpochBlocks).toBigInt();
  randaoAgent.period1 = BigNumber.from(log.args.rdConfig.period1).toBigInt();
  randaoAgent.period2 = BigNumber.from(log.args.rdConfig.period2).toBigInt();
  randaoAgent.slashingFeeFixedCVP = BigNumber.from(log.args.rdConfig.slashingFeeFixedCVP).toBigInt();
  randaoAgent.slashingFeeBps = BigNumber.from(log.args.rdConfig.slashingFeeBps).toBigInt();
  randaoAgent.jobMinCreditsFinney = BigNumber.from(log.args.rdConfig.jobMinCreditsFinney).toBigInt();
  randaoAgent.agentMaxCvpStake = BigNumber.from(log.args.rdConfig.agentMaxCvpStake).toBigInt();
  randaoAgent.jobCompensationMultiplierBps = BigNumber.from(log.args.rdConfig.jobCompensationMultiplierBps).toBigInt();
  randaoAgent.stakeDivisor = BigNumber.from(log.args.rdConfig.stakeDivisor).toBigInt();
  randaoAgent.keeperActivationTimeoutHours = BigNumber.from(log.args.rdConfig.keeperActivationTimeoutHours).toBigInt();
  randaoAgent.jobFixedRewardFinney = BigNumber.from(log.args.rdConfig.jobFixedReward).toBigInt();

  await randaoAgent.save();
}