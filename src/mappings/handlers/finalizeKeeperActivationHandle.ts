import assert from "assert";
import {
    FinalizeKeeperActivationLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {FinalizeKeeperActivation} from "../../types"
import {
    BIG_INT_ZERO, getKeeper
} from "../../helpers/initializers";
import {logger} from "ethers/lib/ethers";


export async function handleFinalizeKeeperActivation(log: FinalizeKeeperActivationLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing FinalizeKeeperActivation Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());
    keeper.keeperActivationCanBeFinalizedAt = BIG_INT_ZERO;
    keeper.active = true;

    await keeper.save();
    const finalize = FinalizeKeeperActivation.create({
        createTxHash: "", createdAt: 0n, id: log.transaction.hash, keeperId: ""
    });

    finalize.createTxHash = log.transaction.hash;
    finalize.createdAt = log.block.timestamp;
    finalize.keeperId = log.args.keeperId.toString();

    await finalize.save();
}