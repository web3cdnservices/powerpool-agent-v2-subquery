import assert from "assert";
import {
    RegisterAsKeeperLog as RegisterAsKeeperRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getOrCreateRandaoAgent, getJobByKey} from "../initializers";
import {BigNumber, logger} from "ethers/lib/ethers";
import {
    BIG_INT_ONE,
    BIG_INT_ZERO,
    createKeeper
} from "../../helpers/initializers";

export async function handleRegisterAsKeeper(log: RegisterAsKeeperRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing RegisterAsKeeper Handle`);

    const keeperId = log.args.keeperId.toString();
    const keeper = await createKeeper(keeperId);

    keeper.createTxHash = log.transaction.hash;
    keeper.createdAt = log.block.timestamp;
    keeper.active = true;
    keeper.numericalId = BigNumber.from(keeperId).toBigInt();
    keeper.admin = log.args.keeperAdmin;
    keeper.worker = log.args.keeperWorker;

    keeper.slashedStake = BIG_INT_ZERO;
    keeper.currentStake = BIG_INT_ZERO;
    keeper.compensationsToWithdraw = BIG_INT_ZERO;
    keeper.compensations = BIG_INT_ZERO;
    keeper.expenses = BIG_INT_ZERO;
    keeper.profit = BIG_INT_ZERO;
    keeper.pendingWithdrawalAmount = BIG_INT_ZERO;
    keeper.pendingWithdrawalEndsAt = BIG_INT_ZERO;
    keeper.keeperActivationCanBeFinalizedAt = BIG_INT_ZERO;
    keeper.executionCount = BIG_INT_ZERO;

    keeper.stakeCount = BIG_INT_ZERO;
    keeper.redeemInitCount = BIG_INT_ZERO;
    keeper.redeemFinalizeCount = BIG_INT_ZERO;
    keeper.compensationWithdrawalCount = BIG_INT_ZERO;

    await keeper.save();

    const agent = await getOrCreateRandaoAgent();

    agent.keepersCount = BigNumber.from(agent.keepersCount).add(BIG_INT_ONE).toBigInt();

    agent.lastKeeperId = log.args.keeperId.toBigInt();

    await agent.save();
}