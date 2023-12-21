import assert from "assert";
import {
    StakeLog as StakeRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {BigNumber} from "ethers/lib/ethers";
import {
    BIG_INT_ONE, getKeeper, createKeeperStake
} from "../../helpers/initializers";
import {getOrCreateRandaoAgent} from "../initializers";

export async function handleStake(log: StakeRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing Stake Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());

    const stakeKey = log.args.keeperId.toString().concat("-").concat(keeper.stakeCount.toString());
    const stake = await createKeeperStake(stakeKey);
    stake.createTxHash = log.transaction.hash;
    stake.keeperId = log.args.keeperId.toString();
    stake.staker = log.args.staker;
    stake.amount = log.args.amount.toBigInt();
    stake.createdAt = log.block.timestamp;

    await stake.save();


    keeper.currentStake = BigNumber.from(keeper.currentStake).add(log.args.amount).toBigInt();
    keeper.stakeCount = BigNumber.from(keeper.stakeCount).add(BIG_INT_ONE).toBigInt();

    await keeper.save();

    // adds stake to total counter
    const agent = await getOrCreateRandaoAgent();
    agent.stakeCount = BigNumber.from(agent.stakeCount).add(log.args.amount).toBigInt();

    await agent.save();
}