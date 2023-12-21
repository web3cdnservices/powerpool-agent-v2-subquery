import assert from "assert";
import {
    OwnerSlashLog as SlashRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {KeeperOwnerSlash} from "../../types"
import {BigNumber, logger} from "ethers/lib/ethers";
import {
    getKeeper
} from "../../helpers/initializers";

export async function handleSlash(log: SlashRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing Slash Handle`);


    const keeper = await getKeeper(log.args.keeperId.toString());

    keeper.currentStake = BigNumber.from(keeper.currentStake).sub(log.args.currentAmount).toBigInt();
    keeper.slashedStake = BigNumber.from(keeper.slashedStake).add(log.args.currentAmount).toBigInt();
    keeper.pendingWithdrawalAmount = BigNumber.from(keeper.pendingWithdrawalAmount).sub(log.args.pendingAmount).toBigInt();

    await keeper.save();

    const ownerSlash = KeeperOwnerSlash.create({
        createTxHash: log.transaction.hash,
        createdAt: log.block.timestamp,
        currentAmount: log.args.currentAmount.toBigInt(),
        id: log.transaction.hash,
        keeperId: log.args.keeperId.toString(),
        pendingAmount: log.args.pendingAmount.toBigInt(),
        to: log.args.to
    });

    await ownerSlash.save();
}