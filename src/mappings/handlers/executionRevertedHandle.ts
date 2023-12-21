import assert from "assert";
import {
    ExecutionRevertedLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {ExecutionRevert} from "../../types"
import {BigNumber} from "ethers/lib/ethers";
import {
    BIG_INT_ONE, BIG_INT_ZERO, getOrCreateJobOwner
} from "../../helpers/initializers";

export async function handleExecutionReverted(log: ExecutionRevertedLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing ExecutionReverted Handle`);

    const id = log.transaction.hash;
    const revert = ExecutionRevert.create({
        actualKeeperId: "",
        assignedKeeperId: "",
        baseFee: 0n,
        compensation: 0n,
        createTxHash: "",
        createdAt: 0n,
        executionResponse: "",
        expenses: 0n,
        gasPrice: 0n,
        id: id,
        jobId: "",
        jobOwner: "",
        profit: 0n,
        txGasLimit: 0n,
        txGasUsed: 0n,
        txIndex: 0n,
        txNonce: 0n
    });

    revert.createTxHash = log.transaction.hash;
    revert.createdAt = log.block.timestamp;
    revert.txIndex = log.transaction.transactionIndex;
    revert.txNonce = log.transaction.nonce;

    let receipt = await log.transaction.receipt();

    revert.txGasUsed = receipt.gasUsed;
    revert.txGasLimit = log.block.gasLimit;

    revert.baseFee = BigNumber.from(log.block.baseFeePerGas).toBigInt();
    revert.gasPrice = BigNumber.from(log.transaction.gasPrice).toBigInt();
    revert.compensation = log.args.compensation.toBigInt();
    revert.profit = BIG_INT_ZERO;
    revert.expenses = BIG_INT_ZERO;

    if (BigNumber.from(revert.txGasUsed).gt(BIG_INT_ZERO)) {
        revert.expenses = BigNumber.from(revert.gasPrice).mul(revert.txGasUsed).toBigInt();
        revert.profit = log.args.compensation.sub(revert.expenses).toBigInt();
    }

    revert.executionResponse = log.args.executionReturndata;

    revert.jobId = log.args.jobKey;
    revert.actualKeeperId = log.args.actualKeeperId.toString();
    revert.assignedKeeperId = log.args.assignedKeeperId.toString();

    const job = await getJobByKey(log.args.jobKey);

    revert.jobOwner = job.ownerId;

    await revert.save();

    if (job.useJobOwnerCredits) {
        const jobOwner = await getOrCreateJobOwner(job.ownerId);

        jobOwner.credits = BigNumber.from(jobOwner.credits).sub(log.args.compensation).toBigInt();

        await jobOwner.save();
    } else {
        job.credits = BigNumber.from(job.credits).sub(log.args.compensation).toBigInt();
    }

    job.executionRevertCount = BigNumber.from(job.executionRevertCount).add(BIG_INT_ONE).toBigInt();
    job.totalCompensations = BigNumber.from(job.totalCompensations).add(revert.compensation).toBigInt();

    await job.save();
}