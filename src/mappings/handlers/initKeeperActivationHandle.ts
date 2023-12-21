import assert from "assert";
import {
    InitiateKeeperActivationLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {InitiateKeeperActivation} from "../../types"
import {
    getKeeper
} from "../../helpers/initializers";


export async function handleInitKeeperActivation(log: InitiateKeeperActivationLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.info(`Processing InitKeeperActivation Handle`);
    console.log('aaaaaaaaaaaaaaa',log.args.keeperId.toString());

    const keeper = await getKeeper(log.args.keeperId.toString());
    keeper.keeperActivationCanBeFinalizedAt = log.args.canBeFinalizedAt.toBigInt();

    await keeper.save();
    const init = InitiateKeeperActivation.create({
        canBeFinalizedAt: 0n, createTxHash: "", createdAt: 0n, id: log.transaction.hash, keeperId: ""

    });

    init.createTxHash = log.transaction.hash;
    init.createdAt = log.block.timestamp;
    init.keeperId = log.args.keeperId.toString();
    init.canBeFinalizedAt = log.args.canBeFinalizedAt.toBigInt();

    await init.save();
}