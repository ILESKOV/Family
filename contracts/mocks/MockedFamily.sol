//SPDX-License-Identifier: Unlicense
// mocked version of Family contract - *only* used in tests
pragma solidity 0.8.15;

import "../Family.sol";

/**
 * @title MockedFamily contract
 * NOTE: This contract is Mock of Family contract and only for testing purposes
 * @dev Contract override mintHuman() and breeding() functions and makes random
 * values more deterministic
 */
contract MockedFamily is Family {
    /**
     * @dev Constructor the same as in Family
     * @param mintPrice_ initial mint price for mintHuman()
     * @param maxSupply_ initial max Supply for tokens
     * @param maturityAge_ initial maturity age for tokens at which a breeding()
     * function can be called
     */
    constructor(
        uint256 mintPrice_,
        uint256 maxSupply_,
        uint256 maturityAge_
    ) Family(mintPrice_, maxSupply_, maturityAge_) {}

    /**
     * @dev Overriden function from Family contract. In case user mint his first NFT
     * gender will be setted as a MAN type, in other cases gender will be setted as a WOMAN type
     * @param manName_ The human token name if it will be randomly minted as a MAN token
     * @param womanName_ The human token name if it will be randomly minted as a WOMAN token
     * @param lastname_ The human token lastname
     */
    function mintHuman(
        string memory manName_,
        string memory womanName_,
        string memory lastname_
    ) external payable override {
        require(msg.value >= getMintPrice(), "Not enough ether for a mint");
        require(getTotalSupply() < getMaxSupply(), "Collection sold out");
        uint256 random;
        if (getCountOfHumans(msg.sender) == 0) {
            random = 0;
        } else random = 1;
        GENDER gender;
        string memory name_;
        if (random == 0) {
            gender = GENDER.MAN;
            name_ = manName_;
        } else if (random != 0) {
            gender = GENDER.WOMEN;
            name_ = womanName_;
        }

        _mintHuman(getTotalSupply(), gender, name_, lastname_, getMaturityAge());
    }

    /**
     * @dev Overriden function from Family contract. In case user has already 3 NFTs when he call
     * breeding function gender of a KID will be setted as a GIRL type, in other cases gender will
     * be setted as a BOY type
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
    ) external override {
        require(getTotalSupply() < getMaxSupply(), "Collection sold out");
        require(_firstParentID != _secondParentID, "One parent cannot reproduce alone");
        require(
            getOwnerOfHuman(_firstParentID) == msg.sender && getOwnerOfHuman(_secondParentID) == msg.sender,
            "You are not the owner of one or more humans"
        );
        require(
            checkAgeChanging(_firstParentID) >= 18 && checkAgeChanging(_secondParentID) == 18,
            "One or more of your tokens are not mature enough"
        );
        require(
            (getDataAboutHuman(_firstParentID).gender) != (getDataAboutHuman(_secondParentID).gender),
            "Tokens share the same gender and cannot reproduce themselves"
        );
        uint256 random;
        if (getCountOfHumans(msg.sender) != 3) {
            random = 0;
        } else random = 1;
        GENDER gender;
        string memory name_;
        if (random == 0) {
            gender = GENDER.KID_BOY;
            name_ = _boyName;
        } else {
            gender = GENDER.KID_GIRL;
            name_ = _girlName;
        }
        string memory lastname_ = getDataAboutHuman(_firstParentID).lastname;
        _mintHuman(getTotalSupply(), gender, name_, lastname_, 0);
    }
}
