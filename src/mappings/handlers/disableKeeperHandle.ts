import assert from "assert";
import {
    DisableKeeperLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {DisableKeeper} from "../../types"
import {BigNumber} from "ethers/lib/ethers";
import {
   getKeeper,BIG_INT_ONE
} from "../../helpers/initializers";
import {getOrCreateRandaoAgent} from "../initializers";

export async function handleDisableKeeper(log: DisableKeeperLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing DisableKeeper Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());
    keeper.active = false;

    await keeper.save();

    const disableEvent = DisableKeeper.create({
        createTxHash: log.transaction.hash,
        createdAt: log.block.timestamp,
        id: log.transaction.hash,
        keeperId: log.args.keeperId.toString()
    });

    await disableEvent.save();

    const agent = await getOrCreateRandaoAgent();

    agent.activeKeepersCount = BigNumber.from(agent.activeKeepersCount).sub(BIG_INT_ONE).toBigInt();

    await agent.save();
}