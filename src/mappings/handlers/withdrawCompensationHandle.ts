import assert from "assert";
import {
    WithdrawCompensationLog as WithdrawCompensationRandao,
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {WithdrawKeeperCompensation} from "../../types"
import {BigNumber} from "ethers/lib/ethers";
import {
    BIG_INT_ONE, getKeeper
} from "../../helpers/initializers";

export async function handleWithdrawCompensation(log: WithdrawCompensationRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing WithdrawCompensation Handle`);

    const keeper = await getKeeper(log.args.keeperId.toString());
    keeper.compensationsToWithdraw = BigNumber.from(keeper.compensationsToWithdraw).sub(log.args.amount).toBigInt();

    await keeper.save();

    const compensation = WithdrawKeeperCompensation.create({
        amount: 0n, createTxHash: "", createdAt: 0n, id: log.transaction.hash, keeperId: "", to: ""
    });
    compensation.createTxHash = log.transaction.hash;
    compensation.createdAt = log.block.timestamp;
    compensation.keeperId = log.args.keeperId.toString();
    compensation.to = log.args.to;
    compensation.amount = log.args.amount.toBigInt();

    await compensation.save();

    keeper.compensationWithdrawalCount = BigNumber.from(keeper.compensationWithdrawalCount).add(BIG_INT_ONE).toBigInt();

    await keeper.save();
}