//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Family contract
 * NOTE: Contract allows users to mint standard ERC 721 tokens of type MAN or WOMAN,
 * after that, the user can create a KID token, when the KID token reaches maturity,
 * they become adults MAN or WOMAN
 * @dev According to this contract one day equals one year, so each day each
 * contract will be a year older
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
        string name;
        string lastname;
        uint256 actualAge;
        uint256 mintAge;
        uint256 mintTime;
        address owner;
    }

    uint256 internal _mintPrice;
    uint256 internal _totalSupply;
    uint256 internal _maxSupply;
    uint256 internal _maturityAge;

    Human[] internal _peoples;

    mapping(uint256 => address) internal _humanToOwner;
    mapping(address => uint256) internal _ownerHumanCount;

    /**
     * @dev Emitted when new token minted
     * @param id token Id
     * @param gender GENDER type(MAN, WOMEN, KID_BOY or KID_GIRL)
     * @param name given name of human
     * @param lastname given lastname of human
     * @param age age of human at the moment of mint
     * @param mintTime block.timestamp of mint
     * @param owner address of the owner of the tokens
     */
    event NewHuman(
        uint256 id,
        GENDER indexed gender,
        string name,
        string lastname,
        uint256 age,
        uint32 mintTime,
        address indexed owner
    );

    /**
     * @dev Emitted when checkAgeChanging called
     * @param id token Id
     * @param gender GENDER type(MAN, WOMEN, KID_BOY or KID_GIRL)
     * @param name given name of human
     * @param lastname given lastname of human
     * @param actualAge age at the time the function was called
     * @param mintAge age of human at the moment of mint
     * @param mintTime block.timestamp of mint
     * @param owner address of the owner of the tokens
     */
    event AgeUpdated(
        uint256 id,
        GENDER indexed gender,
        string name,
        string lastname,
        uint256 actualAge,
        uint256 mintAge,
        uint256 mintTime,
        address indexed owner
    );

    /**
     * @dev Emitted when the owner withdraw ether from the contract
     * @param owner owner address
     * @param amount amount of ether
     */
    event WithdrawalOfOwner(address owner, uint256 indexed amount);

    /**
     * @dev Emitted when the owner updates max supply
     * @param newMaxSupply new _maxSupply
     */
    event MaxSupplyUpdated(uint256 newMaxSupply);

    /**
     * @dev Emitted when the holder updates the maturity age for the tokens
     * @param newMaturityAger new _maturityAge
     */
    event MaturityAgeUpdated(uint256 newMaturityAger);

    /**
     * @dev Emitted when the owner updates the minted token price
     * @param newMintPrice new _maturityAge
     */
    event MintPriceUpdated(uint256 newMintPrice);

    /**
     * @dev Contract inherited from ERC721 openZeppelin contract and contains
     * arguments for creating a collection of ERC721 tokens
     * @param mintPrice_ initial mint price for mintHuman()
     * @param maxSupply_ initial max Supply for tokens
     * @param maturityAge_ initial maturity age for tokens at which a breeding()
     * function can be called
     */
    constructor(
        uint256 mintPrice_,
        uint256 maxSupply_,
        uint256 maturityAge_
    ) ERC721("Family", "FAM") {
        require(mintPrice_ != 0, "Mint price cannot be zero");
        require(maxSupply_ != 0, "Max supply cannot be zero");
        require(maturityAge_ > 16, "Maturity age must be higher than 16");
        _mintPrice = mintPrice_;
        _maxSupply = maxSupply_;
        _maturityAge = maturityAge_;
    }

    /**
     * @dev This is a function to mint MAN or WOMAN tokens dependig on randomness
     * Each user can mint as many tokens as they want until the maximum supply is reached
     * The mint costs ether and the price of the mint is set by the owner
     * _mintHuman() function emitted a newHuman event
     * @param manName_ The human token name if it will be randomly minted as a MAN token
     * @param womanName_ The human token name if it will be randomly minted as a WOMAN token
     * @param lastname_ The human token lastname
     */
    function mintHuman(
        string memory manName_,
        string memory womanName_,
        string memory lastname_
    ) external payable virtual {
        require(msg.value >= _mintPrice, "Not enough ether for a mint");
        require(_totalSupply < _maxSupply, "Collection sold out");
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 2;
        GENDER gender;
        string memory name_;
        if (random == 0) {
            gender = GENDER.MAN;
            name_ = manName_;
        } else if (random != 0) {
            gender = GENDER.WOMEN;
            name_ = womanName_;
        }
        _mintHuman(_totalSupply, gender, name_, lastname_, _maturityAge);
    }

    /**
     * @dev This is a function to mint KID_BOY or KID_GIRL tokens dependig on randomness
     * Each user can mint as many tokens as they want until the maximum supply is reached
     * In order to call this function user required to have MAN and WOMAN types of token
     * New KID token will have lastname from the first parent and initial age is set to 0.
     * Mint does not require additional ether. _mintHuman() function emitted a newHuman event
     * @param _firstParentID id of first parent token
     * @param _secondParentID id of second parent token
     * @param _boyName The human token name if it will be randomly minted as a KID_BOY token
     * @param _girlName The human token name if it will be randomly minted as a KID_GIRL token
     */
    function breeding(
        uint256 _firstParentID,
        uint256 _secondParentID,
        string memory _boyName,
        string memory _girlName
    ) external virtual {
        require(_totalSupply < _maxSupply, "Collection sold out");
        require(_firstParentID != _secondParentID, "One parent cannot reproduce alone");
        require(
            _humanToOwner[_firstParentID] == msg.sender && _humanToOwner[_secondParentID] == msg.sender,
            "You are not the owner of one or more NFTs"
        );
        require(
            checkAgeChanging(_firstParentID) >= _maturityAge && checkAgeChanging(_secondParentID) == _maturityAge,
            "One or more of your tokens are not mature enough"
        );
        require(
            (_peoples[_firstParentID].gender) != (_peoples[_secondParentID].gender),
            "Tokens share the same gender and cannot reproduce themselves"
        );
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.difficulty, block.timestamp, _boyName, _girlName, msg.sender))
        ) % 2;
        GENDER gender;
        string memory name_;
        if (random == 0) {
            gender = GENDER.KID_BOY;
            name_ = _boyName;
        } else {
            gender = GENDER.KID_GIRL;
            name_ = _girlName;
        }
        string memory lastname_ = _peoples[_firstParentID].lastname;
        _mintHuman(_totalSupply, gender, name_, lastname_, 0);
    }

    /**
     * @dev This is a function to check and update the actual age of a human token.
     * Can only be called by the owner of the token
     * Function update KID tokens to MAN or WOMEN in case they reach maturity age
     * @param _id token id to check
     */
    function checkAgeChanging(uint256 _id) public returns (uint256) {
        require(_humanToOwner[_id] == msg.sender, "You are not the owner of this NFT");
        _peoples[_id].actualAge = (block.timestamp - _peoples[_id].mintTime) / 86400 + _peoples[_id].mintAge;
        if (_peoples[_id].gender == GENDER.KID_BOY && _peoples[_id].actualAge >= _maturityAge) {
            _peoples[_id].gender = GENDER.MAN;
        } else if (_peoples[_id].gender == GENDER.KID_GIRL && _peoples[_id].actualAge >= _maturityAge) {
            _peoples[_id].gender = GENDER.WOMEN;
        }
        emit AgeUpdated(
            _id,
            _peoples[_id].gender,
            _peoples[_id].name,
            _peoples[_id].lastname,
            _peoples[_id].actualAge,
            _peoples[_id].mintAge,
            _peoples[_id].mintTime,
            msg.sender
        );
        return _peoples[_id].actualAge;
    }

    /**
     * @dev This function contains the common functionality of mintHuman() and breeding()
     * functions. Updates mappings, adds token data to _peoples[] array.
     * NewHuman event emitted
     * @param tokenId_ id of new token
     * @param gender_ randomly selected token gender
     * @param name_ The human token name
     * @param lastname_ The human token lastname
     * @param age_ actual and mint age of the token
     */
    function _mintHuman(
        uint256 tokenId_,
        GENDER gender_,
        string memory name_,
        string memory lastname_,
        uint256 age_
    ) internal {
        uint256 tokenId = _totalSupply;
        _ownerHumanCount[msg.sender]++;
        _totalSupply++;
        _humanToOwner[tokenId_] = msg.sender;
        uint32 mintTime_ = uint32(block.timestamp);
        Human memory human = Human({
            id: tokenId,
            gender: gender_,
            name: name_,
            lastname: lastname_,
            actualAge: age_,
            mintAge: age_,
            mintTime: mintTime_,
            owner: msg.sender
        });
        _peoples.push(human);
        _safeMint(msg.sender, tokenId_);
        emit NewHuman(tokenId, gender_, name_, lastname_, age_, mintTime_, msg.sender);
    }

    /**
     * @dev Set new _maxSupply. new max Supply required to be equal or higher
     * than _totalSupply. Can only be called by the owner of the contract
     * @param maxSupply_ new max Supply of tokens
     */
    function setMaxSupply(uint256 maxSupply_) external onlyOwner {
        require(maxSupply_ >= _totalSupply, "Max supply cannot be lower than total supply");
        _maxSupply = maxSupply_;
        emit MaxSupplyUpdated(maxSupply_);
    }

    /**
     * @dev Set new _maturityAge. When the age of maturity reached by KID tokens, they
     *  becomes MAN or WOMAN tokens. Can only be called by the owner of the contract
     * @param maturityAge_ new age of maturity
     */
    function setMaturityAge(uint256 maturityAge_) external onlyOwner {
        require(maturityAge_ >= 16, "Needs to be older");
        _maturityAge = maturityAge_;
        emit MaturityAgeUpdated(maturityAge_);
    }

    /**
     * @dev Set new _mintPrice. Users are required to pay this price whenever they want
     *  call mintHuman() function. Can only be called by the owner of the contract
     * @param newMintPrice_ new mint human price
     */
    function setMintPrice(uint256 newMintPrice_) external onlyOwner {
        _mintPrice = newMintPrice_;
        emit MintPriceUpdated(newMintPrice_);
    }

    /**
     * @dev Owner can withdraw Ether from contract
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Not enough ETH");
        payable(owner()).transfer(amount);
        emit WithdrawalOfOwner(msg.sender, amount);
    }

    /**
     * @dev Returns the data of the given token by passing the token id as a parameter
     */
    function getDataAboutHuman(uint256 id_) external view returns (Human memory) {
        return _peoples[id_];
    }

    /**
     * @dev Returns count of 'Family' tokens by passing the address as a parameter
     */
    function getCountOfHumans(address owner_) external view returns (uint256) {
        return _ownerHumanCount[owner_];
    }

    /**
     * @dev Returns address of the token owner by passing the token id as a parameter
     */
    function getOwnerOfHuman(uint256 id_) external view returns (address) {
        return _humanToOwner[id_];
    }

    /**
     * @dev Returns the mint price when users call the mintHuman() function
     */
    function getMintPrice() external view returns (uint256) {
        return _mintPrice;
    }

    /**
     * @dev Returns the actual total supply so far
     */
    function getTotalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns max supply
     */
    function getMaxSupply() external view returns (uint256) {
        return _maxSupply;
    }

    /**
     * @dev Returns maturity age
     */
    function getMaturityAge() external view returns (uint256) {
        return _maturityAge;
    }
}
