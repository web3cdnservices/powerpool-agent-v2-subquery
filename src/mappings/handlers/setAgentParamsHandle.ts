import assert from "assert";
import {
    SetAgentParamsLog as SetAgentParamsRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getOrCreateRandaoAgent} from "../initializers";
import {logger} from "ethers/lib/ethers";

export async function handleSetAgentParams(log: SetAgentParamsRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing SetAgentParams Handle`);

    const agent = await getOrCreateRandaoAgent();

    agent.minKeeperCVP = log.args.minKeeperCvp_.toBigInt();
    agent.pendingWithdrawalTimeoutSeconds = log.args.timeoutSeconds_.toBigInt();
    agent.feePpm = log.args.feePpm_.toBigInt();

    await agent.save();
}
