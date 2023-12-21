import assert from "assert";
import {ExecuteLog as ExecuteRandao} from "../../types/abi-interfaces/PPAgentV2Randao";
import {Execution} from "../../types";
import {
    BIG_INT_ONE,
    BIG_INT_ZERO,
    getCertainExecution,
    getKeeper,
    getOrCreateJobOwner
} from "../../helpers/initializers";
import {BigNumber} from "ethers/lib/ethers";
import {getJobByKey} from "../initializers";
import {getOrCreateRandaoAgent} from "../initializers";
export async function handleExecution(log: ExecuteRandao): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing Execution Handle`);

    const inputString = log.transaction.input;

    let execution = Execution.create({
        baseFee: log.args!.baseFee.toBigInt(),
        binJobAfter: log.args!.binJobAfter,
        block: BigInt(log.block.number),
        compensation: log.args!.compensation.toBigInt(),
        createTxHash: log.transaction.hash,
        createdAt: log.block.timestamp,
        expenses: log.args!.gasPrice.toBigInt(),
        gasPrice: log.args!.gasPrice.toBigInt(),
        id: log.transaction.hash,
        jobAddress: log.args!.job,
        jobCalldata: inputString.slice(64, inputString.length),
        jobGasUsed: log.args!.gasUsed.toBigInt(),
        jobId: log.args!.jobKey,
        jobOwner: "",
        keeperConfig: BigInt(inputString.slice(56, 58)),
        keeperId: log.args!.keeperId.toString(),
        keeperWorker: log.transaction.from,
        profit: BIG_INT_ZERO,
        txCalldata: log.transaction.input,
        txGasLimit: log.block.gasLimit,
        txGasUsed: log.args!.gasUsed.toBigInt(),
        txIndex: log.transaction.transactionIndex,
        txNonce: log.transaction.nonce,
    });

    if (BigNumber.from(execution.txGasUsed).gt(BIG_INT_ZERO)) {
        execution.expenses = BigNumber.from(execution.gasPrice).mul(execution.txGasUsed).toBigInt();
        execution.profit = log.args!.compensation.sub(execution.expenses).toBigInt();
    }

    const job = await getJobByKey(log.args!.jobKey);

    const jobOwner = await getOrCreateJobOwner(job.ownerId);

    execution.jobOwner = job.ownerId;

    if (job.useJobOwnerCredits) {
        jobOwner.credits = BigNumber.from(jobOwner.credits).sub(log.args!.compensation).toBigInt()
    } else {
        job.credits = BigNumber.from(job.credits).sub(log.args!.compensation).toBigInt()
    }

    job.lastExecutionAt = log.block.timestamp;
    job.totalCompensations = BigNumber.from(job.totalCompensations).add(log.args!.compensation).toBigInt();

    job.totalExpenses = BigNumber.from(job.totalExpenses).add(execution.expenses).toBigInt()

    job.totalProfit = BigNumber.from(job.totalProfit).add(execution.profit).toBigInt();

    job.executionCount = BigNumber.from(job.executionCount).add(BIG_INT_ONE).toBigInt();

    await job.save();

    const keeper = await getKeeper(execution.keeperId);

    if (execution.keeperConfig != BIG_INT_ZERO) {
        keeper.compensationsToWithdraw = BigNumber.from(keeper.compensationsToWithdraw).add(log.args!.compensation).toBigInt();
    }

    keeper.compensations = BigNumber.from(keeper.compensations).add(execution.compensation).toBigInt();
    keeper.expenses = BigNumber.from(keeper.expenses).add(execution.expenses).toBigInt();
    keeper.profit = BigNumber.from(keeper.profit).add(execution.profit).toBigInt();

    keeper.executionCount = BigNumber.from(keeper.executionCount).add(BIG_INT_ONE).toBigInt();

    await jobOwner.save();
    await execution.save();
    await keeper.save();

    // count statistics after execution
    const agent = await getOrCreateRandaoAgent();
    // const execution = await getCertainExecution(log.transaction.hash);
    agent.executionsCount = BigNumber.from(agent.executionsCount).add(BIG_INT_ONE).toBigInt();
    agent.paidCount = BigNumber.from(agent.paidCount).add(log.args.compensation).toBigInt();

    agent.profitCount = BigNumber.from(agent.profitCount).add(execution.profit).toBigInt();

    await agent.save();
}