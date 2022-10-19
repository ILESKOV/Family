//SPDX-License-Identifier: Unlicense

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Family contract.
 * NOTE: Contract allows users to mint standard ERC 721 tokens of type MAN or WOMAN,
 * after that, the user can create a KID token, when the KID token reaches maturity,
 * they become adults MAN or WOMAN.
 * @dev According to this contract one day equals one year, so each day each
 * contract will be a year older.
 */
contract Family is ERC721, Ownable {
    enum GENDER {
        MAN,
        WOMEN,
        KID_BOY,
        KID_GIRL
    }

    struct Human {
        uint256 id;
        GENDER gender;
        bytes32 name;
        bytes32 lastname;
        uint256 actualAge;
        uint256 mintAge;
        uint256 mintTime;
        address owner;
    }

    uint256 private _mintPrice;
    uint256 private _totalSupply;
    uint256 private _maxSupply;
    uint256 private _maturityAge;

    Human[] private _peoples;

    // Mapping from token ID to owner address.
    mapping(uint256 => address) private _humanToOwner;
    // Mapping from owner address to count of owner tokens.
    mapping(address => uint256) private _ownerHumanCount;

    /**
     * @dev Emitted when new token minted.
     * @param id token Id.
     * @param gender GENDER type(MAN, WOMEN, KID_BOY or KID_GIRL).
     * @param name given name of human.
     * @param lastname given lastname of human.
     * @param age age of human at the moment of mint.
     * @param mintTime block.timestamp of mint.
     * @param owner address of the owner of the tokens.
     */
    event NewHuman(
        uint256 id,
        GENDER indexed gender,
        bytes32 name,
        bytes32 lastname,
        uint256 age,
        uint32 mintTime,
        address indexed owner
    );

    /**
     * @dev Emitted when checkAgeChanging called.
     * @param id token Id.
     * @param gender GENDER type(MAN, WOMEN, KID_BOY or KID_GIRL).
     * @param name given name of human.
     * @param lastname given lastname of human.
     * @param actualAge age at the time the function was called.
     * @param mintAge age of human at the moment of mint.
     * @param mintTime block.timestamp of mint.
     * @param owner address of the owner of the tokens.
     */
    event AgeUpdated(
        uint256 id,
        GENDER indexed gender,
        bytes32 name,
        bytes32 lastname,
        uint256 actualAge,
        uint256 mintAge,
        uint256 mintTime,
        address indexed owner
    );

    /**
     * @dev Emitted when the owner withdraw ether from the contract.
     * @param owner owner address.
     * @param amount amount of ether.
     */
    event WithdrawalOfOwner(address owner, uint256 indexed amount);

    /**
     * @dev Emitted when the owner updates max supply.
     * @param newMaxSupply new _maxSupply.
     */
    event MaxSupplyUpdated(uint256 newMaxSupply);

    /**
     * @dev Emitted when the holder updates the maturity age for the tokens.
     * @param newMaturityAge new _maturityAge.
     */
    event MaturityAgeUpdated(uint256 newMaturityAge);

    /**
     * @dev Emitted when the owner updates the minted token price.
     * @param newMintPrice new price for mint humans.
     */
    event MintPriceUpdated(uint256 newMintPrice);

    /**
     * @dev Contract inherited from ERC721 openZeppelin contract and contains
     * arguments for creating a collection of ERC721 tokens.
     * @param mintPrice_ initial mint price for mintHuman().
     * @param maxSupply_ initial max Supply for tokens.
     * @param maturityAge_ initial maturity age for tokens at which a breeding()
     * function can be called.
     */
    constructor(uint256 mintPrice_, uint256 maxSupply_, uint256 maturityAge_) ERC721("Family", "FAM") {
        require(mintPrice_ > 0, "Mint price cannot be zero");
        require(maxSupply_ > 0, "Max supply cannot be zero");
        require(maturityAge_ > 16, "Maturity age must be higher than 16");
        _mintPrice = mintPrice_;
        _maxSupply = maxSupply_;
        _maturityAge = maturityAge_;
    }

    /**
     * @dev This is a function to mint MAN or WOMAN tokens dependig on pseudo randomness.
     * The mint costs ether and the price of the mint is set by the owner.
     *
     * Requirements:
     *
     * - `msg.value` must be higher or equal to `_mintPrice`.
     * - Users can mint tokens until the `_maxSupply` value is reached.
     *
     * @param manName_ The human token name if it will be pseudo randomly minted as a MAN token.
     * @param womanName_ The human token name if it will be pseudo randomly minted as a WOMAN token.
     * @param lastname_ The human token lastname.
     *
     * Emits a {NewHuman} event.
     */
    function mintHuman(bytes32 manName_, bytes32 womanName_, bytes32 lastname_) external payable virtual {
        require(msg.value >= _mintPrice, "Not enough ether for a mint");
        require(_totalSupply <= _maxSupply, "Collection sold out");
        uint256 pseudoRandom = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 2;
        GENDER gender;
        bytes32 name_;
        if (pseudoRandom == 0) {
            gender = GENDER.MAN;
            name_ = manName_;
        } else {
            gender = GENDER.WOMEN;
            name_ = womanName_;
        }
        _mintHuman(_totalSupply, gender, name_, lastname_, _maturityAge);
    }

    /**
     * @dev This is a function to mint KID_BOY or KID_GIRL tokens depending on pseudo randomness.
     * In order to call this function user required to have MAN and WOMAN types of token.
     * New KID token will have lastname from the first parent and initial age is set to 0.
     * Mint does not require additional ether.
     *
     * Requirements:
     *
     * - Users can breed tokens until the `_maxSupply` value is reached.
     * - `firstParentID_` and `secondParentID_` must be different values.
     * - `_humanToOwner[firstParentID_]` and `_humanToOwner[secondParentID_]` must be `msg.sender` address.
     * - `firstParentID_` and `secondParentID_` Humans `actualAge` must reach `_maturityAge`.
     * - `_peoples[firstParentID_].gender` and `_peoples[secondParentID_].gender` must be different values.
     *
     * @param firstParentID_ id of first parent token.
     * @param secondParentID_ id of second parent token.
     * @param boyName_ The human token name if it will be pseudo randomly minted as a KID_BOY token.
     * @param girlName_ The human token name if it will be pseudo randomly minted as a KID_GIRL token.
     *
     * Emits a {NewHuman} event.
     */
    function breeding(uint256 firstParentID_, uint256 secondParentID_, bytes32 boyName_, bytes32 girlName_)
        external
        virtual
    {
        require(_totalSupply <= _maxSupply, "Collection sold out");
        require(firstParentID_ != secondParentID_, "One parent cannot reproduce alone");
        require(
            _humanToOwner[firstParentID_] == msg.sender && _humanToOwner[secondParentID_] == msg.sender,
            "You are not the owner of one or more NFTs"
        );
        require(
            checkAgeChanging(firstParentID_) >= _maturityAge && checkAgeChanging(secondParentID_) == _maturityAge,
            "One or more of your tokens are not mature enough"
        );
        Human memory firstParent = _peoples[firstParentID_];
        require(
            (firstParent.gender) != (_peoples[secondParentID_].gender),
            "Tokens share the same gender and cannot reproduce themselves"
        );
        uint256 pseudoRandom = uint256(
            keccak256(abi.encodePacked(block.difficulty, block.timestamp, boyName_, girlName_, msg.sender))
        ) % 2;
        GENDER gender;
        bytes32 name_;
        if (pseudoRandom == 0) {
            gender = GENDER.KID_BOY;
            name_ = boyName_;
        } else {
            gender = GENDER.KID_GIRL;
            name_ = girlName_;
        }
        bytes32 lastname_ = firstParent.lastname;
        _mintHuman(_totalSupply, gender, name_, lastname_, 0);
    }

    /**
     * @dev This is a function to check and update the actual age of a human token.
     * Can only be called by the owner of the token.
     * Function update KID tokens to MAN or WOMEN in case they reach maturity age.
     * @param id_ token id to check.
     *
     * Emits a {AgeUpdated} event.
     */
    function checkAgeChanging(uint256 id_) public returns (uint256) {
        require(_humanToOwner[id_] == msg.sender, "You are not the owner of this NFT");
        Human memory human = _peoples[id_];
        _peoples[id_].actualAge = (block.timestamp - human.mintTime) / 86400 + human.mintAge;
        uint256 actualAge = _peoples[id_].actualAge;
        if (human.gender == GENDER.KID_BOY && actualAge >= _maturityAge) {
            _peoples[id_].gender = GENDER.MAN;
        } else if (human.gender == GENDER.KID_GIRL && actualAge >= _maturityAge) {
            _peoples[id_].gender = GENDER.WOMEN;
        }
        emit AgeUpdated(
            id_,
            human.gender,
            human.name,
            human.lastname,
            actualAge,
            human.mintAge,
            human.mintTime,
            msg.sender
        );
        return actualAge;
    }

    /**
     * @dev This function contains the common functionality of mintHuman() and breeding()
     * functions. Updates mappings, adds token data to _peoples[] array.
     * @param tokenId_ id of new token.
     * @param gender_ pseudo randomly selected token gender.
     * @param name_ The human token name.
     * @param lastname_ The human token lastname.
     * @param age_ actual and mint age of the token.
     *
     * Emits a {NewHuman} event.
     */
    function _mintHuman(uint256 tokenId_, GENDER gender_, bytes32 name_, bytes32 lastname_, uint256 age_) internal {
        address caller = msg.sender;
        uint256 tokenId = _totalSupply;
        _ownerHumanCount[caller]++;
        _totalSupply++;
        _humanToOwner[tokenId_] = caller;
        uint32 mintTime_ = uint32(block.timestamp);
        Human memory human = Human({
            id: tokenId,
            gender: gender_,
            name: name_,
            lastname: lastname_,
            actualAge: age_,
            mintAge: age_,
            mintTime: mintTime_,
            owner: caller
        });
        _peoples.push(human);
        _safeMint(caller, tokenId_);
        emit NewHuman(tokenId, gender_, name_, lastname_, age_, mintTime_, caller);
    }

    /**
     * @dev Set new _maxSupply. new max Supply required to be equal or higher
     * than _totalSupply. Can only be called by the owner of the contract.
     * @param maxSupply_ new max Supply of tokens.
     *
     * Emits a {MaxSupplyUpdated} event.
     */
    function setMaxSupply(uint256 maxSupply_) external onlyOwner {
        require(maxSupply_ >= _totalSupply, "Max supply cannot be lower than total supply");
        _maxSupply = maxSupply_;
        emit MaxSupplyUpdated(maxSupply_);
    }

    /**
     * @dev Set new _maturityAge. When the age of maturity reached by KID tokens, they
     *  becomes MAN or WOMAN tokens. Can only be called by the owner of the contract.
     * @param maturityAge_ new age of maturity.
     *
     * Emits a {MaturityAgeUpdated} event.
     */
    function setMaturityAge(uint256 maturityAge_) external onlyOwner {
        require(maturityAge_ >= 16, "Needs to be older");
        _maturityAge = maturityAge_;
        emit MaturityAgeUpdated(maturityAge_);
    }

    /**
     * @dev Set new _mintPrice. Users are required to pay this price whenever they want
     *  call mintHuman() function. Can only be called by the owner of the contract.
     * @param newMintPrice_ new mint human price.
     *
     * Emits a {MintPriceUpdated} event.
     */
    function setMintPrice(uint256 newMintPrice_) external onlyOwner {
        _mintPrice = newMintPrice_;
        emit MintPriceUpdated(newMintPrice_);
    }

    /**
     * @dev Owner can withdraw Ether from contract.
     *
     * Emits a {WithdrawalOfOwner} event.
     */
    function withdrawETH(uint256 amount_) external onlyOwner {
        require(amount_ <= address(this).balance, "Not enough ETH");
        payable(owner()).transfer(amount_);
        emit WithdrawalOfOwner(msg.sender, amount_);
    }

    /**
     * @dev Returns the data of the given token by passing the token id as a parameter.
     */
    function getDataAboutHuman(uint256 id_) public view returns (Human memory) {
        return _peoples[id_];
    }

    /**
     * @dev Returns count of 'Family' tokens by passing the address as a parameter.
     */
    function getCountOfHumans(address owner_) public view returns (uint256) {
        return _ownerHumanCount[owner_];
    }

    /**
     * @dev Returns address of the token owner by passing the token id as a parameter.
     */
    function getOwnerOfHuman(uint256 id_) public view returns (address) {
        return _humanToOwner[id_];
    }

    /**
     * @dev Returns the mint price when users call the mintHuman() function.
     */
    function getMintPrice() public view returns (uint256) {
        return _mintPrice;
    }

    /**
     * @dev Returns the actual total supply so far.
     */
    function getTotalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns max supply.
     */
    function getMaxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    /**
     * @dev Returns maturity age.
     */
    function getMaturityAge() public view returns (uint256) {
        return _maturityAge;
    }
}
