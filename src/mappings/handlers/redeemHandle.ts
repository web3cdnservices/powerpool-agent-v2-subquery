import assert from "assert";
import {
    InitiateRedeemLog as InitiateRedeemRandao,
    FinalizeRedeemLog as FinalizeRedeemRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getOrCreateRandaoAgent, getJobByKey} from "../initializers";
import {BigNumber} from "ethers/lib/ethers";
import {
    BIG_INT_ONE, BIG_INT_ZERO, getKeeper, createKeeperRedeemInit, createKeeperRedeemFinalize
} from "../../helpers/initializers";


export async function handleInitiateRedeem(log: InitiateRedeemRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing InitiateRedeem Handle`);

    const agent = await getOrCreateRandaoAgent();

    const keeper = await getKeeper(log.args.keeperId.toString());

    const initKey = keeper.id.toString().concat("-").concat(keeper.redeemInitCount.toString());
    const init = await createKeeperRedeemInit(initKey);

    init.createTxHash = log.transaction.hash;
    init.createdAt = log.block.timestamp;
    init.keeperId = log.args.keeperId.toString();
    init.inputAmount = log.args.redeemAmount.toBigInt();
    init.slashedStakeReduction = log.args.slashedStakeAmount.toBigInt();
    init.stakeReduction = log.args.stakeAmount.toBigInt();
    init.initiatedAt = log.block.timestamp;
    init.availableAt = BigNumber.from(log.block.timestamp).add(agent.pendingWithdrawalTimeoutSeconds).toBigInt();
    init.cooldownSeconds = agent.pendingWithdrawalTimeoutSeconds;

    await init.save();


    const stakeOfToReduceAmount = log.args.redeemAmount.sub(keeper.slashedStake);
    keeper.currentStake = BigNumber.from(keeper.currentStake).sub(stakeOfToReduceAmount).toBigInt();
    keeper.pendingWithdrawalAmount = BigNumber.from(keeper.pendingWithdrawalAmount).add(stakeOfToReduceAmount).toBigInt();

    keeper.pendingWithdrawalEndsAt = BigNumber.from(log.block.timestamp).add(agent.pendingWithdrawalTimeoutSeconds).toBigInt();

    keeper.slashedStake = BIG_INT_ZERO;

    keeper.redeemInitCount = BigNumber.from(keeper.redeemInitCount).add(BIG_INT_ONE).toBigInt();

    await keeper.save();

    // removes stake from total counter
    agent.stakeCount = BigNumber.from(agent.stakeCount).sub(stakeOfToReduceAmount).toBigInt();

    await agent.save();
}

export async function handleFinalizeRedeem(log: FinalizeRedeemRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing FinalizeRedeem Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());

    const finalizeKey = keeper.id.toString().concat("-").concat(keeper.redeemFinalizeCount.toString());
    const finalize = await createKeeperRedeemFinalize(finalizeKey);

    finalize.createTxHash = log.transaction.hash;
    finalize.keeperId = log.args.keeperId.toString();
    finalize.to = log.args.beneficiary;
    finalize.amount = log.args.amount.toBigInt();
    finalize.createdAt = log.block.timestamp;

    await finalize.save();

    keeper.pendingWithdrawalAmount = BIG_INT_ZERO;
    keeper.pendingWithdrawalEndsAt = BIG_INT_ZERO;
    keeper.redeemFinalizeCount = BigNumber.from(keeper.redeemFinalizeCount).add(BIG_INT_ONE).toBigInt();

    await keeper.save();
}

