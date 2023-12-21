import assert from "assert";
import {
    SetWorkerAddressLog as SetWorkerAddressRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {SetKeeperWorkerAddress} from "../../types/models"
import {
    getKeeper
} from "../../helpers/initializers";
import {logger} from "ethers/lib/ethers";

export async function handleSetWorkerAddress(log: SetWorkerAddressRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing SetWorkerAddress Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());
    keeper.worker = log.args.worker;
    await keeper.save();

    const setAddress = SetKeeperWorkerAddress.create({
        createTxHash: "", createdAt: 0n, id: log.transaction.hash, keeperId: "", prev: "", worker: ""

    });
    setAddress.createTxHash = log.transaction.hash;
    setAddress.createdAt = log.block.timestamp;
    setAddress.keeperId = log.args.keeperId.toString();
    setAddress.prev = log.args.prev;
    setAddress.worker = log.args.worker;

    await setAddress.save();
}