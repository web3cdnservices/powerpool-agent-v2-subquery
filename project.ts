import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "powerpool-v2-arbone-subql",
  description:
      "PowerPool v2 subquery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for Arbitrum One this is 42161
     * https://chainlist.org/chain/42161
     */
    chainId: "42161",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["https://arbitrum.public-rpc.com"],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      // This is the block that the contract was deployed on https://arbiscan.io
      startBlock: 157793700,
      options: {
        abi: "randao",
        // This is the contract address https://arbiscan.io/address/0xad1e507f8A0cB1B91421F3bb86BBE29f001CbcC6
        address: "0xad1e507f8A0cB1B91421F3bb86BBE29f001CbcC6",
      },
      // assets: new Map([["erc20", { file: "./abis/erc20.abi.json" }]]),
      assets: new Map([["randao", { file: "./abis/PPAgentV2Randao.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [

          {
            kind: EthereumHandlerKind.Event,
            handler: "handleExecution",
            filter: {
              topics: [
                "Execute(bytes32,address,uint256,uint256,uint256,uint256,uint256,bytes32)"
              ]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleRegisterJob",
            filter: {
              topics: ["RegisterJob(bytes32,address,uint256,address,(address,bytes4,bool,bool,uint16,uint16,uint32,uint256,uint8,uint24))"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleJobUpdate",
            filter: {
              topics: ["JobUpdate(bytes32,uint256,uint256,uint256,uint256,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSetJobConfig",
            filter: {
              topics: ["SetJobConfig(bytes32,bool,bool,bool)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleInitiateJobTransfer",
            filter: {
              topics: ["InitiateJobTransfer(bytes32,address,address)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleAcceptJobTransfer",
            filter: {
              topics: ["AcceptJobTransfer(bytes32,address)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDepositJobCredits",
            filter: {
              topics: ["DepositJobCredits(bytes32,address,uint256,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleWithdrawJobCredits",
            filter: {
              topics: ["WithdrawJobCredits(bytes32,address,address,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDepositJobOwnerCredits",
            filter: {
              topics: ["DepositJobOwnerCredits(address,address,uint256,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleWithdrawJobOwnerCredits",
            filter: {
              topics: ["WithdrawJobOwnerCredits(address,address,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSetJobPreDefinedCalldata",
            filter: {
              topics: ["SetJobPreDefinedCalldata(bytes32,bytes)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSetJobResolver",
            filter: {
              topics: ["SetJobResolver(bytes32,address,bytes)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleRegisterAsKeeper",
            filter: {
              topics: ["RegisterAsKeeper(uint256,address,address)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSetWorkerAddress",
            filter: {
              topics: ["SetWorkerAddress(uint256,address,address)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleStake",
            filter: {
              topics: ["Stake(uint256,uint256,address)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleInitiateRedeem",
            filter: {
              topics: ["InitiateRedeem(uint256,uint256,uint256,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleFinalizeRedeem",
            filter: {
              topics: ["FinalizeRedeem(uint256,address,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleWithdrawCompensation",
            filter: {
              topics: ["WithdrawCompensation(uint256,address,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSlash",
            filter: {
              topics: ["OwnerSlash(uint256,address,uint256,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleOwnershipTransferred",
            filter: {
              topics: ["OwnershipTransferred(address,address)"]
            }
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSetAgentParams",
            filter: {
              topics: ["SetAgentParams(uint256,uint256,uint256)"]
            }
          },
// // Randao events
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSetRdConfig",
            filter: {
              topics: ["SetRdConfig((uint8,uint24,uint16,uint24,uint16,uint16,uint40,uint16,uint32,uint8,uint16))"]
            }
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleJobKeeperChanged",
            filter: {
              topics: ["JobKeeperChanged(bytes32,uint256,uint256)"]
            }
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleInitiateKeeperSlashing",
            filter: {
              topics: ["InitiateKeeperSlashing(bytes32,uint256,bool,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleSlashKeeper",
            filter: {
              topics: ["SlashKeeper(bytes32,uint256,uint256,uint256,uint256,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDisableKeeper",
            filter: {
              topics: ["DisableKeeper(uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleInitKeeperActivation",
            filter: {
              topics: ["InitiateKeeperActivation(uint256,uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleFinalizeKeeperActivation",
            filter: {
              topics: ["FinalizeKeeperActivation(uint256)"]
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleExecutionReverted",
            filter: {
              topics: ["ExecutionReverted(bytes32,uint256,uint256,bytes,uint256)"]
            },
            //receipt
          }

          //////
        ],
      },
    },
  ],
  repository: "https://github.com/subquery/ethereum-subql-starter",
};

// Must set default to the project instance
export default project;
