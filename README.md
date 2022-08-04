# 'Family' NFT collection
> There is one contract Family.sol with ERC721 standard implementation. Collection has 4 types of tokens: MAN,WOMAN, KID_BOY and KID_GIRL
## Table of Contents
* [General Info](#general-information)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Requirements For Initial Setup](#requirements)
* [Setup](#setup)
* [Contact](#contact)



## General Information
- Contract allows users to mint standard ERC721 tokens of type MAN or WOMAN with mintHuman() function
- If the user has both MAN and WOMAN tokens he can create a KID token with breeding() function
- In the contract each real day is equal to one year and the owner can set the maturity age
- When the KID token reaches maturity age and its checked via checkAgeChanging() function this token become adult MAN or WOMAN token

 
## Technologies Used
- hh coverage
- slither
- docgen
- solhint

## Features
- Users could create 'Family'
- Owner set all variables: mint price, maturity age etc.
- 100% coverage of tests

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/), should work with any node version below 16.16.0
- Install [Hardhat](https://hardhat.org/)

## 📟 Setup
### 1. Clone/Download the Repository
### 2. Install Dependencies:
```
$ cd repository_file
$ npm install
```
### 3. 🔍  .env environment variables required to set up

### 4. ⚠️  Run Tests
```
$ npm run test
```

```
$ npm run coverage
```

### 5. 🚀 Deploy to Rinkeby or Mainnet
```
$ npm run deployRinkeby
``` 
```
$ npm run deployMainnet 
``` 

### 6. ✏️ Insert current contract addresses into package.json
![Example screenshot](./helpers/Screenshot7.png)

### 7. 📜 Verify contracts
```
$ npm run verifyRinkeby
```

or for mainnet

```
 $ npm run verifyMainnet
```


## 💬 Contact
Created by [@LESKOV](https://www.linkedin.com/in/ivan-lieskov-4b5664189/) - feel free to contact me!
