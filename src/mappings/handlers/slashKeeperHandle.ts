import assert from "assert";
import {
    SlashKeeperLog
} from "../../types/abi-interfaces/PPAgentV2Randao";
import {getJobByKey} from "../initializers";
import {Execution, ExecutionRevert, SlashKeeper} from "../../types"
import {BigNumber} from "ethers/lib/ethers";
import {
    BIG_INT_ONE, getKeeper
} from "../../helpers/initializers";


export async function handleSlashKeeper(log: SlashKeeperLog): Promise<void> {
    assert(log.args, "No log.args");

    logger.debug(`Processing SlashKeeper Handle`);

    // Not sure about right id. expectedKeeper + actualKeeper might not be unique, so I used txHash
    const id = log.transaction.hash;
    const slashKeeper = SlashKeeper.create({
        createTxHash: "",
        createdAt: 0n,
        dynamicSlashAmount: 0n,
        fixedSlashAmount: 0n,
        id: id,
        jobId: "",
        slashAmountMissing: 0n,
        slashAmountResult: 0n,
        slashedKeeperId: "",
        slasherKeeperId: "",
        txIndex: 0n,
        txNonce: 0n

    });

    slashKeeper.createTxHash = log.transaction.hash;
    slashKeeper.createdAt = log.block.timestamp;
    slashKeeper.txIndex = log.transaction.transactionIndex;
    slashKeeper.txNonce = log.transaction.nonce;

    slashKeeper.jobId = log.args.jobKey;
    slashKeeper.slashedKeeperId = log.args.assignedKeeperId.toString();
    slashKeeper.slasherKeeperId = log.args.actualKeeperId.toString();

    slashKeeper.fixedSlashAmount = log.args.fixedSlashAmount.toBigInt();
    slashKeeper.dynamicSlashAmount = log.args.dynamicSlashAmount.toBigInt();
    slashKeeper.slashAmountMissing = log.args.slashAmountMissing.toBigInt();


    const totalSlashAmount = BigNumber.from(slashKeeper.fixedSlashAmount).add(slashKeeper.dynamicSlashAmount).sub(slashKeeper.slashAmountMissing);
    slashKeeper.slashAmountResult = totalSlashAmount.toBigInt();

    // Link either to execution or executionRevert
    {
        const txHash = log.transaction.hash;

        // Try execution first
        let execution = await Execution.get(txHash);
        if (!execution) {
            // Then it should be executionRevert
            let executionRevert = await ExecutionRevert.get(txHash);
            if (!executionRevert) {
                throw new Error(`Neither execution nor execution revert found for tx ${txHash}.`);
            }
            slashKeeper.executionRevertId = txHash;
        }
        slashKeeper.executionId = txHash;
    }

    await slashKeeper.save();

    const slasherId = log.args.actualKeeperId.toString();
    const slashedId = log.args.assignedKeeperId.toString();

    const slashedKeeper = await getKeeper(slashedId);
    const slasherKeeper = await getKeeper(slasherId);


    slashedKeeper.currentStake = BigNumber.from(slashedKeeper.currentStake).sub(totalSlashAmount).toBigInt();
    slasherKeeper.currentStake = BigNumber.from(slasherKeeper.currentStake).add(totalSlashAmount).toBigInt();


    slashedKeeper.slashedStake = BigNumber.from(slashedKeeper.slashedStake).add(totalSlashAmount).toBigInt();
    slashedKeeper.slashedStakeCounter = BigNumber.from(slashedKeeper.slashedStakeCounter).add(BIG_INT_ONE).toBigInt();
    slasherKeeper.getBySlashStake = BigNumber.from(slashedKeeper.getBySlashStake).add(totalSlashAmount).toBigInt();
    slasherKeeper.getBySlashStakeCounter = BigNumber.from(slashedKeeper.getBySlashStakeCounter).add(BIG_INT_ONE).toBigInt();

    await slashedKeeper.save();
    await slasherKeeper.save();


    const job = await getJobByKey(log.args.jobKey);
    job.slashingCount = BigNumber.from(job.slashingCount).add(BIG_INT_ONE).toBigInt();
    await job.save();
}
