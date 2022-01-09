import { ethers } from "ethers";

import contractABI from '../artifacts/contracts/Transactions.sol/Transactions.json';

const contractAddress = '0x4573765e80220cf72b819aa1b120c6cAA6191663';

const { ethereum } = window;

function createEthereumContract() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

  return transactionsContract;
};

async function main() {
  if (!ethereum) {
    return alert('please install metamask!');
  }

  const ethereumContract = createEthereumContract();
  console.log({ ethereumContract });
}

main();
