# Solidity API

## Family

_According to this contract one day equals one year, so each day each
contract will be a year older_

### GENDER

```solidity
enum GENDER {
  MAN,
  WOMEN,
  KID_BOY,
  KID_GIRL
}
```

### Human

```solidity
struct Human {
  uint256 id;
  enum Family.GENDER gender;
  string name;
  string lastname;
  uint256 actualAge;
  uint256 mintAge;
  uint256 mintTime;
  address owner;
}
```

### _mintPrice

```solidity
uint256 _mintPrice
```

### _totalSupply

```solidity
uint256 _totalSupply
```

### _maxSupply

```solidity
uint256 _maxSupply
```

### _maturityAge

```solidity
uint256 _maturityAge
```

### _peoples

```solidity
struct Family.Human[] _peoples
```

### _humanToOwner

```solidity
mapping(uint256 => address) _humanToOwner
```

### _ownerHumanCount

```solidity
mapping(address => uint256) _ownerHumanCount
```

### NewHuman

```solidity
event NewHuman(uint256 id, enum Family.GENDER gender, string name, string lastname, uint256 age, uint32 mintTime, address owner)
```

_Emitted when new token minted_

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | token Id |
| gender | enum Family.GENDER | GENDER type(MAN, WOMEN, KID_BOY or KID_GIRL) |
| name | string | given name of human |
| lastname | string | given lastname of human |
| age | uint256 | age of human at the moment of mint |
| mintTime | uint32 | block.timestamp of mint |
| owner | address | address of the owner of the tokens |

### AgeUpdated

```solidity
event AgeUpdated(uint256 id, enum Family.GENDER gender, string name, string lastname, uint256 actualAge, uint256 mintAge, uint256 mintTime, address owner)
```

_Emitted when checkAgeChanging called_

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | token Id |
| gender | enum Family.GENDER | GENDER type(MAN, WOMEN, KID_BOY or KID_GIRL) |
| name | string | given name of human |
| lastname | string | given lastname of human |
| actualAge | uint256 | age at the time the function was called |
| mintAge | uint256 | age of human at the moment of mint |
| mintTime | uint256 | block.timestamp of mint |
| owner | address | address of the owner of the tokens |

### WithdrawalOfOwner

```solidity
event WithdrawalOfOwner(address owner, uint256 amount)
```

_Emitted when the owner withdraw ether from the contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | owner address |
| amount | uint256 | amount of ether |

### MaxSupplyUpdated

```solidity
event MaxSupplyUpdated(uint256 newMaxSupply)
```

_Emitted when the owner updates max supply_

| Name | Type | Description |
| ---- | ---- | ----------- |
| newMaxSupply | uint256 | new _maxSupply |

### MaturityAgeUpdated

```solidity
event MaturityAgeUpdated(uint256 newMaturityAge)
```

_Emitted when the holder updates the maturity age for the tokens_

| Name | Type | Description |
| ---- | ---- | ----------- |
| newMaturityAge | uint256 | new _maturityAge |

### MintPriceUpdated

```solidity
event MintPriceUpdated(uint256 newMintPrice)
```

_Emitted when the owner updates the minted token price_

| Name | Type | Description |
| ---- | ---- | ----------- |
| newMintPrice | uint256 | new _maturityAge |

### constructor

```solidity
constructor(uint256 mintPrice_, uint256 maxSupply_, uint256 maturityAge_) public
```

_Contract inherited from ERC721 openZeppelin contract and contains
arguments for creating a collection of ERC721 tokens_

| Name | Type | Description |
| ---- | ---- | ----------- |
| mintPrice_ | uint256 | initial mint price for mintHuman() |
| maxSupply_ | uint256 | initial max Supply for tokens |
| maturityAge_ | uint256 | initial maturity age for tokens at which a breeding() function can be called |

### mintHuman

```solidity
function mintHuman(string manName_, string womanName_, string lastname_) external payable virtual
```

_This is a function to mint MAN or WOMAN tokens dependig on randomness
The mint costs ether and the price of the mint is set by the owner

Requirements:

- `msg.value` must be higher or equal to `_mintPrice`.
- Users can mint tokens until the `_maxSupply` value is reached._

| Name | Type | Description |
| ---- | ---- | ----------- |
| manName_ | string | The human token name if it will be randomly minted as a MAN token |
| womanName_ | string | The human token name if it will be randomly minted as a WOMAN token |
| lastname_ | string | The human token lastname Emits a {NewHuman} event. |

### breeding

```solidity
function breeding(uint256 _firstParentID, uint256 _secondParentID, string _boyName, string _girlName) external virtual
```

_This is a function to mint KID_BOY or KID_GIRL tokens depending on randomness
In order to call this function user required to have MAN and WOMAN types of token
New KID token will have lastname from the first parent and initial age is set to 0.
Mint does not require additional ether.

Requirements:

- Users can breed tokens until the `_maxSupply` value is reached.
- `_firstParentID` and `_secondParentID` must be different values.
- `_humanToOwner[_firstParentID]` and `_humanToOwner[_secondParentID]` must be `msg.sender` address.
- `_firstParentID` and `_secondParentID` Humans `actualAge` must reach `_maturityAge`.
- `_peoples[_firstParentID].gender` and `_peoples[_secondParentID].gender` must be different values._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _firstParentID | uint256 | id of first parent token. |
| _secondParentID | uint256 | id of second parent token. |
| _boyName | string | The human token name if it will be randomly minted as a KID_BOY token. |
| _girlName | string | The human token name if it will be randomly minted as a KID_GIRL token. Emits a {NewHuman} event. |

### checkAgeChanging

```solidity
function checkAgeChanging(uint256 _id) public returns (uint256)
```

_This is a function to check and update the actual age of a human token.
Can only be called by the owner of the token
Function update KID tokens to MAN or WOMEN in case they reach maturity age_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | token id to check Emits a {AgeUpdated} event. |

### _mintHuman

```solidity
function _mintHuman(uint256 tokenId_, enum Family.GENDER gender_, string name_, string lastname_, uint256 age_) internal
```

_This function contains the common functionality of mintHuman() and breeding()
functions. Updates mappings, adds token data to _peoples[] array._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId_ | uint256 | id of new token |
| gender_ | enum Family.GENDER | randomly selected token gender |
| name_ | string | The human token name |
| lastname_ | string | The human token lastname |
| age_ | uint256 | actual and mint age of the token Emits a {NewHuman} event. |

### setMaxSupply

```solidity
function setMaxSupply(uint256 maxSupply_) external
```

_Set new _maxSupply. new max Supply required to be equal or higher
than _totalSupply. Can only be called by the owner of the contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxSupply_ | uint256 | new max Supply of tokens Emits a {MaxSupplyUpdated} event. |

### setMaturityAge

```solidity
function setMaturityAge(uint256 maturityAge_) external
```

_Set new _maturityAge. When the age of maturity reached by KID tokens, they
 becomes MAN or WOMAN tokens. Can only be called by the owner of the contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| maturityAge_ | uint256 | new age of maturity Emits a {MaturityAgeUpdated} event. |

### setMintPrice

```solidity
function setMintPrice(uint256 newMintPrice_) external
```

_Set new _mintPrice. Users are required to pay this price whenever they want
 call mintHuman() function. Can only be called by the owner of the contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| newMintPrice_ | uint256 | new mint human price Emits a {MintPriceUpdated} event |

### withdrawETH

```solidity
function withdrawETH(uint256 amount) external
```

_Owner can withdraw Ether from contract

Emits a {WithdrawalOfOwner} event_

### getDataAboutHuman

```solidity
function getDataAboutHuman(uint256 id_) public view returns (struct Family.Human)
```

_Returns the data of the given token by passing the token id as a parameter_

### getCountOfHumans

```solidity
function getCountOfHumans(address owner_) public view returns (uint256)
```

_Returns count of 'Family' tokens by passing the address as a parameter_

### getOwnerOfHuman

```solidity
function getOwnerOfHuman(uint256 id_) public view returns (address)
```

_Returns address of the token owner by passing the token id as a parameter_

### getMintPrice

```solidity
function getMintPrice() public view returns (uint256)
```

_Returns the mint price when users call the mintHuman() function_

### getTotalSupply

```solidity
function getTotalSupply() public view returns (uint256)
```

_Returns the actual total supply so far_

### getMaxSupply

```solidity
function getMaxSupply() public view returns (uint256)
```

_Returns max supply_

### getMaturityAge

```solidity
function getMaturityAge() public view returns (uint256)
```

_Returns maturity age_

## MockedFamily

_Contract override mintHuman() and breeding() functions and makes random
values more deterministic_

### constructor

```solidity
constructor(uint256 mintPrice_, uint256 maxSupply_, uint256 maturityAge_) public
```

_Constructor the same as in Family_

| Name | Type | Description |
| ---- | ---- | ----------- |
| mintPrice_ | uint256 | initial mint price for mintHuman() |
| maxSupply_ | uint256 | initial max Supply for tokens |
| maturityAge_ | uint256 | initial maturity age for tokens at which a breeding() function can be called |

### mintHuman

```solidity
function mintHuman(string manName_, string womanName_, string lastname_) external payable
```

_Overriden function from Family contract. In case user mint his first NFT
gender will be setted as a MAN type, in other cases gender will be setted as a WOMAN type_

| Name | Type | Description |
| ---- | ---- | ----------- |
| manName_ | string | The human token name if it will be randomly minted as a MAN token |
| womanName_ | string | The human token name if it will be randomly minted as a WOMAN token |
| lastname_ | string | The human token lastname |

### breeding

```solidity
function breeding(uint256 _firstParentID, uint256 _secondParentID, string _boyName, string _girlName) external
```

_Overriden function from Family contract. In case user has already 3 NFTs when he call
breeding function gender of a KID will be setted as a GIRL type, in other cases gender will
be setted as a BOY type_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _firstParentID | uint256 | id of first parent token |
| _secondParentID | uint256 | id of second parent token |
| _boyName | string | The human token name if it will be randomly minted as a KID_BOY token |
| _girlName | string | The human token name if it will be randomly minted as a KID_GIRL token |

