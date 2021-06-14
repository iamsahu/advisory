import React, { Component, useState, useEffect, useRef } from "react";
import "./App.css";
import { getWeb3 } from "./getWeb3";
import map from "./artifacts/deployments/map.json";
import { getEthereum } from "./getEthereum";

function App() {
	const [metaMask, setMetaMask] = useState("");
	const details = useRef({
		web3: null,
		accounts: [],
		ethereum: null,
		chainid: 0,
	});

	useEffect(() => {
		async function setup() {
			const web3 = await getWeb3();
			console.log("web3 found");
			details.current.web3 = web3;
			details.current.chainid = parseInt(await web3.eth.getChainId());
		}
		setup();
		if (typeof window.ethereum !== "undefined") {
			console.log("MetaMask is installed!");
			details.current.ethereum = window.ethereum;
			setMetaMask("Set");

			window.ethereum.on("chainChanged", handleChainChanged);
			window.ethereum.on("accountsChanged", handleAccountsChanged);
			window.ethereum.on("close", handleClose);
			window.ethereum.on("networkChanged", handleNetworkChanged);
		} else {
			console.log("Install Metamask");
		}
	}, [window.ethereum]);

	//TO DO: Handling the following
	function handleChainChanged() {}
	function handleAccountsChanged() {}
	function handleClose() {}
	function handleNetworkChanged() {}

	async function ConnectWallet() {
		try {
			details.current.ethereum
				.request({ method: "eth_requestAccounts" })
				.then(() => console.log("Success"))
				.catch((error) => console.log("Error"));
		} catch (error) {
			console.log(error);
		}
	}

	async function loadContract(chain, contractName) {
		// Load a deployed contract instance into a web3 contract object

		// Get the address of the most recent deployment from the deployment map
		let address;
		try {
			address = map[chain][contractName][0];
		} catch (e) {
			console.log(
				`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`
			);
			return undefined;
		}

		// Load the artifact with the specified address
		let contractArtifact;
		try {
			contractArtifact = await import(
				`./artifacts/deployments/${chain}/${address}.json`
			);
		} catch (e) {
			console.log(
				`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`
			);
			return undefined;
		}

		return new details.current.web3.eth.Contract(contractArtifact.abi, address);
	}

	async function GetBalance() {
		const advisory = await loadContract("dev", "AdvisoryToken");
		const val = await advisory.methods.totalSupply().call();
		console.log(val);
	}

	return (
		<div>
			Hello World!{" "}
			{metaMask === "" ? ( //TO DO: Handle the different cases for wallet load conditions
				"Loading"
			) : (
				<div>
					<button onClick={ConnectWallet}>Connect Wallet!</button>
					<button onClick={GetBalance}>Balance</button>
				</div>
			)}
		</div>
	);
}

export default App;
