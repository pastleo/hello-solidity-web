import { ethers } from "ethers";

import TransactionsContractABI from '../artifacts/contracts/Transactions.sol/Transactions.json';
import SimpleAccountKVStorageContractABI from '../artifacts/contracts/SimpleAccountKVStorage.sol/SimpleAccountKVStorage.json';

const TRANSACTION_CONTRACT_ADDR = '0x4573765e80220cf72b819aa1b120c6cAA6191663';
const SIMPLE_ACCOUNT_KV_STORAGE_CONTRACT_ADDR = '0x43936c19550E97413fC95F36fA743Ad6631c8596';

const { ethereum } = window;

let transactionsContract;
let simpleAccountKVStorageContract;

function createEthereumContract(contractAddr, contractAbi) {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddr, contractAbi.abi, signer);

  return transactionsContract;
};

async function requireAccount() {
  const accounts = await ethereum.request({ method: "eth_requestAccounts", });
  //const accounts = await ethereum.request({ method: "eth_accounts" });

  if (accounts.length <= 0) {
    console.log("No accounts found");
    return false;
  }

  return accounts[0];
}

async function transferAndAddToBlockchain() {
  console.log('transferAndAddToBlockchain...');

  const currentAccount = await requireAccount();
  if (!currentAccount) return;

  const addressTo = document.getElementById('address-to').value;
  const parsedAmount = ethers.utils.parseEther(document.getElementById('amount').value);

  console.log('ethereum.request [eth_sendTransaction]...');
  await ethereum.request({
    method: "eth_sendTransaction",
    params: [{
      from: currentAccount,
      to: addressTo,
      gas: "0x5208",
      value: parsedAmount._hex,
    }],
  });

  const message = document.getElementById('message').value;
  const keyword = document.getElementById('keyword').value;

  console.log('transactionsContract.addToBlockchain...');
  const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

  console.log(`Loading - ${transactionHash.hash}`);
  await transactionHash.wait();
  console.log(`Success - ${transactionHash.hash}`);

  await getTransactionsCount();
}

async function getTransactionsCount() {
  console.log('getTransactionsCount...');

  if (!(await requireAccount())) return;

  console.log('transactionsContract.getTransactionCount...');
  const transactionsCount = await transactionsContract.getTransactionCount();
  const transactionsCountNumber = transactionsCount.toNumber();
  console.log({ transactionsCountNumber });
}

async function getAllTransactions() {
  console.log('getAllTransactions...');

  if (!(await requireAccount())) return;

  console.log('transactionsContract.getAllTransactions...');
  const allTransactions = await transactionsContract.getAllTransactions();

  console.log({ allTransactions });
}

async function getAccountData() {
  console.log('saveAccountData...');

  if (!(await requireAccount())) return;

  console.log('simpleAccountKVStorageContract.get...');
  const data = await simpleAccountKVStorageContract.get();
  console.log({ data });

  document.getElementById('account-data').value = data;
}

async function setAccountData() {
  console.log('setAccountData...');

  if (!(await requireAccount())) return;

  const data = document.getElementById('account-data').value;

  console.log('simpleAccountKVStorageContract.set...');
  const contractOperation = await simpleAccountKVStorageContract.set(data);
  console.log({ contractOperation });

  console.log(`Loading - ${contractOperation.hash}`);
  await contractOperation.wait();
  console.log(`Success - ${contractOperation.hash}`);
}

if (ethereum) {
  transactionsContract = createEthereumContract(TRANSACTION_CONTRACT_ADDR, TransactionsContractABI);
  simpleAccountKVStorageContract = createEthereumContract(SIMPLE_ACCOUNT_KV_STORAGE_CONTRACT_ADDR, SimpleAccountKVStorageContractABI);
  console.log({
    TransactionsContractABI, SimpleAccountKVStorageContractABI,
    transactionsContract, simpleAccountKVStorageContract,
  });

  document.getElementById('transactions-etherscan-link').href = `https://ropsten.etherscan.io/address/${TRANSACTION_CONTRACT_ADDR}`;
  document.getElementById('simple-account-kv-storage-etherscan-link').href = `https://ropsten.etherscan.io/address/${SIMPLE_ACCOUNT_KV_STORAGE_CONTRACT_ADDR}`;

  document.getElementById('get-transactions-count').addEventListener('click', getTransactionsCount);
  document.getElementById('get-all-transactions').addEventListener('click', getAllTransactions);
  document.getElementById('transfer-add-to-blockchain').addEventListener('click', transferAndAddToBlockchain);

  document.getElementById('get-account-data').addEventListener('click', getAccountData);
  document.getElementById('set-account-data').addEventListener('click', setAccountData);
} else {
  return alert('please install metamask!');
}
