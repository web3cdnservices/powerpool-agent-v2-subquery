import assert from "assert";
import {
    OwnershipTransferredLog as OwnershipTransferredRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getOrCreateRandaoAgent, getJobByKey} from "../initializers";
import {BigNumber, getDefaultProvider} from "ethers/lib/ethers";
import {PPAgentV2Randao__factory} from "../../types/contracts"

export async function handleOwnershipTransferred(log: OwnershipTransferredRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing OwnershipTransferred Handle`);

    const agent = await getOrCreateRandaoAgent();

    // Init block
    if (!agent.owner) {
        let provider =  getDefaultProvider();
        const agentContract = PPAgentV2Randao__factory.connect(log.address, provider)

        // Fetch CVP
        const res1 = await agentContract.CVP();
        if (!res1) {
            throw new Error('Init: Unable to fetch CVP');
        }
        agent.address = log.address;
        agent.cvp = res1;
    }

    agent.owner = log.args.newOwner;
    await agent.save();
}