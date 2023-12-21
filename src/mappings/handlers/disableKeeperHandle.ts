import assert from "assert";
import {
    DisableKeeperLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {DisableKeeper} from "../../types"
import {BigNumber, logger} from "ethers/lib/ethers";
import {
   getKeeper
} from "../../helpers/initializers";

export async function handleDisableKeeper(log: DisableKeeperLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing DisableKeeper Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());
    keeper.active = false;

    await keeper.save();

    const disableEvent = DisableKeeper.create({
        createTxHash: "", createdAt: 0n, id: log.transaction.hash, keeperId: ""
    });

    disableEvent.createTxHash = log.transaction.hash;
    disableEvent.createdAt = log.block.timestamp;
    disableEvent.keeperId = log.args.keeperId.toString();

    await disableEvent.save();
}