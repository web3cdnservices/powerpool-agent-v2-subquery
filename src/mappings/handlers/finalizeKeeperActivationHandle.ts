import assert from "assert";
import {
    FinalizeKeeperActivationLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {FinalizeKeeperActivation} from "../../types"
import {
    BIG_INT_ZERO, getKeeper, BIG_INT_ONE
} from "../../helpers/initializers";
import {getOrCreateRandaoAgent, getJobByKey} from "../initializers";
import {BigNumber} from "ethers";


export async function handleFinalizeKeeperActivation(log: FinalizeKeeperActivationLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing FinalizeKeeperActivation Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());
    keeper.keeperActivationCanBeFinalizedAt = BIG_INT_ZERO;
    keeper.active = true;

    await keeper.save();

    const finalize = FinalizeKeeperActivation.create({
        createTxHash: log.transaction.hash,
        createdAt: log.block.timestamp,
        id: log.transaction.hash,
        keeperId: log.args.keeperId.toString()
    });

    await finalize.save();

    const agent = await getOrCreateRandaoAgent();
    agent.activeKeepersCount = BigNumber.from(agent.activeKeepersCount).add(BIG_INT_ONE).toBigInt();
    await agent.save();
}