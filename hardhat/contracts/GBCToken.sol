 // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.10;

  import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
  import "./IBlueberry.sol";

  contract GBCToken is ERC20, Ownable {
      // Price of one GBCT
      uint256 public constant tokenPrice = 0.001 ether;
      uint256 public constant tokensPerNFT = 10 * 10**18;
      // the max total supply is 10000
      uint256 public constant maxTotalSupply = 10000 * 10**18;
      // Gbc contract instance
      IBlueberry GBC;
      // Mapping to keep track of which tokenIds have been claimed
      mapping(uint256 => bool) public tokenIdsClaimed;

      constructor(address _GbcContract) ERC20("GBC Token", "GBCT") {
          GBC = IBlueberry(_GbcContract);
      }

      /**
       * @dev Mints `amount` number of GBCT
       * Requirements:
       * - `msg.value` should be equal or greater than the tokenPrice * amount
       */
      function mint(uint256 amount) public payable {
          // the value of ether that should be equal or greater than tokenPrice * amount;
          uint256 _requiredAmount = tokenPrice * amount;
          require(msg.value >= _requiredAmount, "Ether sent is incorrect");
          // total tokens + amount <= 10000, otherwise revert the transaction
          uint256 amountWithDecimals = amount * 10**18;
          require(
              (totalSupply() + amountWithDecimals) <= maxTotalSupply,
              "Exceeds the max total supply available."
          );
          // call the internal function from Openzeppelin's ERC20 contract
          _mint(msg.sender, amountWithDecimals);
      }

      /**
       * @dev Mints tokens based on the number of NFT's held by the sender
       * Requirements:
       * balance of GBC NFT's owned by the sender should be greater than 0
       * Tokens should have not been claimed for all the NFTs owned by the sender
       */
      function claim() public {
          address sender = msg.sender;
          // Get the number of GBC NFT's held by a given sender address
          uint256 balance = GBC.balanceOf(sender);
          // If the balance is zero, revert the transaction
          require(balance > 0, "You dont own any GBC");
          // amount keeps track of number of unclaimed tokenIds
          uint256 amount = 0;
          // loop over the balance and get the token ID owned by `sender` at a given `index` of its token list.
          for (uint256 i = 0; i < balance; i++) {
              uint256 tokenId = GBC.tokenOfOwnerByIndex(sender, i);
              // if the tokenId has not been claimed, increase the amount
              if (!tokenIdsClaimed[tokenId]) {
                  amount += 1;
                  tokenIdsClaimed[tokenId] = true;
              }
          }
          // If all the token Ids have been claimed, revert the transaction;
          require(amount > 0, "You have already claimed all the tokens");
          // call the internal function from Openzeppelin's ERC20 contract
          // Mint (amount * 10) tokens for each NFT
          _mint(msg.sender, amount * tokensPerNFT);
      }

      /**
        * @dev withdraws all ETH and tokens sent to the contract
        * Requirements: 
        * wallet connected must be owner's address
        */
      function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
      }

      // Function to receive Ether. msg.data must be empty
      receive() external payable {}

      // Fallback function is called when msg.data is not empty
      fallback() external payable {}
  }