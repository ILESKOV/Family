# πͺ 'Family' NFT collection π«
> There is one contract Family.sol with ERC721 standard implementation. Collection has 4 types of tokens: MAN, WOMAN, KID_BOY and KID_GIRL


## π Table of Contents
* [General Info](#-general-information)
* [Technologies Used](#-technologies-used)
* [Features](#-features)
* [Requirements For Initial Setup](#-requirements-for-initial-setup)
* [Setup](#-setup)
* [Contact](#-contact)



## π© General Information
- Contract allows users to mint standard ERC721 tokens of type MAN or WOMAN with mintHuman() function
- If the user has both MAN and WOMAN tokens he can create a KID token with breeding() function
- In the contract each real day is equal to one year and the owner can set the maturity age
- When the KID token reaches maturity age and its checked via checkAgeChanging() function this token become adult MAN or WOMAN token

 
## π» Technologies Used
- hh coverage
- slither
- docgen
- solhint

## π Features
- Users could create 'Family'
- Owner set all variables: mint price, maturity age etc.
- 100% coverage of tests

## π Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/), should work with any node version below 16.16.0
- Install [Hardhat](https://hardhat.org/)

## π Setup
### 1. πΎ Clone/Download the Repository
### 2. π¦ Install Dependencies:
```
$ cd repository_file
$ npm install
```
### 3. π  .env environment variables required to set up
Create .env file inside project folder
- You can get your ethereum or testnet API key [here](https://infura.io/dashboard/ethereum),[here](https://www.alchemy.com) or any other service that allow you to connect to the nodes
- You can get your private key from your wallet(β οΈDon't share your private key with untrusted parties) 
- You can get your etherscan API -key [here](https://etherscan.io/myapikey).
```
GOERLI_API = <goerli API key>
MAINNET_API = <Ethereum mainnet API key>
PRIVATE_KEY = <Private key of your wallet u want to deploy contracts from>
ETHERSCAN_KEY = <Etherscan API key in order to verify your contracts>
MINT_PRICE = <Constructor parameter mint price in ETH in wei(example: 0.05 ETH = 50000000000000000 wei)>
MAX_SUPPLY = <Constructor parameter max limit of tokens to be minted>
MATURITY_AGE = <Constructor parameter age when token will change from KID type to ADULT type>
```

<!--![Example screenshot](./helpers/Screenshot8.png)-->

### 4. β οΈ  Run Tests
```
$ npm run test
```

```
$ npm run coverage
```

### 5. π Deploy and verify on Goerli, Polygon or Mainnet

```
$ npm run goerli
``` 
```
$ npm run polygon
``` 
```
$ npm run mainnet
``` 

### Note: 

deploy.ts implements the verification script and you don't need to complete any additional steps in order to verify the contract.


## π¬ Contact
Created by [@LESKOV](https://www.linkedin.com/in/ivan-leskov-4b5664189/) - feel free to contact me!
