const inquirer = require("inquirer");
const ip = require("ip");
const fs = require("fs");
const path = require("path");
const GraphQLClient = require("@arcblock/graphql-client");
const camelCase = require("lodash/camelCase");
const { types } = require("@arcblock/mcrypto");
const { fromRandom, WalletType } = require("@arcblock/forge-wallet");
const inquirerAutoComplete = require("inquirer-autocomplete-prompt");

inquirer.registerPrompt("autocomplete", inquirerAutoComplete);

process.on('unhandledRejection', err => {
  throw err;
});

async function getConfigs() {
  const defaults = {
    appName: "Forge Java Starter",
    appDescription:
      "Starter dApp built on springboot that runs on forge powered blockchain",
    chainHost: "http://localhost:8210/api",
    postgreUri: "jdbc:postgresql://localhost:5432/postgres",
    appPort: 3000,
    serverPort: 9090,
    grpcPort: 28210
  };

  const questions = [
    {
      type: "text",
      name: "chainHost",
      message: "Running chain node graphql endpoint:",
      default: defaults.chainHost,
      validate: input => {
        if (!input) return "Chain node endpoint should not be empty";
        return true;
      }
    },
    {
      type: "text",
      name: "appName",
      message: "dApp name:",
      default: defaults.appName,
      validate: input => {
        if (!input) return "dApp name should not be empty";
        return true;
      }
    },
    {
      type: "text",
      name: "appDescription",
      message: "dApp description:",
      default: defaults.appDescription,
      validate: input => {
        if (!input) return "dApp description should not be empty";
        return true;
      }
    },
    {
      type: "text",
      name: "appPort",
      message: "dApp listening port:",
      default: defaults.appPort,
      validate: input => {
        if (!input) return "dApp listening port should not be empty";
        return true;
      }
    },
    {
      type: "text",
      name: "grpcPort",
      message: "Forge gRPC port:",
      default: defaults.grpcPort,
      validate: input => {
        if (!input) return "gRPC port should not be empty";
        return true;
      }
    },
    {
      type: "text",
      name: "serverPort",
      message: "Java server port:",
      default: defaults.serverPort,
      validate: input => {
        if (!input) return "server port should not be empty";
        return true;
      }
    },
    {
      type: "text",
      name: "postgreUri",
      message: "Postgresql URI:",
      default: defaults.postgreUri,
      validate: input => {
        if (!input) return "Postgresql connection string:";
        return true;
      }
    },
    {
      type: "text",
      name: "dbUserName",
      message: "Postgresql user name:",
      validate: input => {
        if (!input || !input.trim()) return "Postgresql user name:";
        return true;
      }
    },
    {
      type: "password",
      name: "dbPassword",
      message: "Postgresql user password:",
      validate: input => {
        if (!input || !input.trim()) return "Postgresql user password:";
        return true;
      }
    }
  ];

  const {
    chainHost,
    appName,
    appDescription,
    appPort,
    postgreUri,
    serverPort,
    grpcPort,
    dbUserName,
    dbPassword
  } = await inquirer.prompt(questions);
  const ipAddress = ip.address();
  const client = new GraphQLClient({ endpoint: chainHost });
  const {
    info: { network: chainId }
  } = await client.getChainInfo();

  // Declare application on chain
  const wallet = fromRandom(
    WalletType({
      role: types.RoleType.ROLE_APPLICATION,
      pk: types.KeyType.ED25519,
      hash: types.HashType.SHA3
    })
  );
  const hash = await client.sendDeclareTx({
    tx: {
      chainId,
      itx: {
        moniker: camelCase(appName)
      }
    },
    wallet
  });
  console.log("application declare tx", hash);
  console.log(`application account declared on chain: ${wallet.toAddress()}`);

  // Generate config
  const envContent = `POSTGRE_URI="${postgreUri}"
DB_USER="${dbUserName.trim()}"
DB_PW="${dbPassword}"
REACT_APP_CHAIN_ID="${chainId}"
REACT_APP_CHAIN_HOST="${chainHost
    .replace("127.0.0.1", ipAddress)
    .replace("localhost", ipAddress)}"
REACT_APP_APP_NAME="${appName}"
APP_DESCRIPTION="${appDescription}"
APP_PORT="${appPort}"
APP_PK="${wallet.publicKey.slice(2).toUpperCase()}"
APP_SK="${wallet.secretKey.slice(2).toUpperCase()}"
REACT_APP_APP_ID="${wallet.toAddress()}"
APP_TOKEN_SECRET="${wallet.publicKey.slice(16)}"
APP_TOKEN_TTL="1d"
SERVER_PORT="${serverPort}"
FORGE_SOCK_GRPC="${grpcPort}"
REACT_APP_SERVER_PORT="${serverPort}"
REACT_APP_SERVER_HOST="http://${ipAddress}:${serverPort}"
REACT_APP_BASE_URL="http://${ipAddress}:${serverPort}"`;

  return {
    envContent,
    proxy: `http://0.0.0.0:${serverPort}`
  };
}

const run = async () => {
  const { envContent, proxy } = await getConfigs();
  const targetDir = process.env.FORGE_BLOCKLET_TARGET_DIR;
  fs.writeFileSync(path.join(targetDir, ".env"), envContent);

  const packageJSONPath = path.join(targetDir, "package.json");
  const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  packageJSON["proxy"] = proxy;
  fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 4));
};

run();
