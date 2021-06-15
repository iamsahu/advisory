import React, { Component, useState, useEffect, useRef } from "react";
import "./App.css";
import { getWeb3 } from "./getWeb3";
import map from "./artifacts/deployments/map.json";
import { getEthereum } from "./getEthereum";
import { Button, ButtonGroup, Container } from "@chakra-ui/react";

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
			setMetaMask("GotWeb3");
			await web3.eth.getAccounts((error, accounts) => {
				details.current.accounts = accounts;
				console.log(accounts);
				if (accounts.length > 0) {
					setMetaMask("Set");
					console.log("Set in accounts");
				}
			});
		}
		setup();
		if (typeof window.ethereum !== "undefined") {
			console.log("MetaMask is installed!");
			details.current.ethereum = window.ethereum;
			if (details.current.web3 !== null)
				details.current.web3.eth.getAccounts((error, accounts) => {
					details.current.accounts = accounts;
					console.log(accounts);
					if (accounts.length > 0) {
						setMetaMask("Set");
						console.log("Set in accounts2");
					}
				});
			console.log("Set in ethereum");
			window.ethereum.on("chainChanged", handleChainChanged);
			window.ethereum.on("accountsChanged", handleAccountsChanged);
			window.ethereum.on("close", handleClose);
			window.ethereum.on("networkChanged", handleNetworkChanged);
			console.log(window.ethereum);
		} else {
			console.log("Install Metamask");
		}
	}, [window.ethereum]);

	//TO DO: Handling the following
	function handleChainChanged(chainId) {
		details.current.chainid = chainId;
		window.location.reload();
	}
	function handleAccountsChanged(accounts) {
		details.current.accounts = accounts;
	}
	function handleClose() {}
	function handleNetworkChanged() {}

	async function ConnectWallet() {
		try {
			details.current.ethereum
				.request({ method: "eth_requestAccounts" })
				.then((accounts) => {
					details.current.accounts = accounts;
					setMetaMask("Set");
				})
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

	async function MintExtra() {
		const advisory = await loadContract("dev", "AdvisoryToken");
		await advisory.methods.mint().send({ from: details.current.accounts[0] });
	}

	return (
		<Container centerContent justifyItems>
			Hello World! <br />
			{metaMask === "" ? ( //TO DO: Handle the different cases for wallet load conditions
				"Loading"
			) : (
				<div>
					{metaMask !== "Set" && (
						<Button colorScheme="blackAlpha" onClick={ConnectWallet}>
							Connect Wallet!
						</Button>
					)}
					{metaMask === "Set" && (
						<div>
							<br />
							<Button colorScheme="facebook" onClick={GetBalance}>
								Balance
							</Button>
							<br />
							<Button colorScheme="whatsapp" onClick={MintExtra}>
								Mint
							</Button>
						</div>
					)}
				</div>
			)}
		</Container>
	);
}

export default App;
