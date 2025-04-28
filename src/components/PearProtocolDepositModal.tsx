import { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { ARBITRUM_RPC_URL, multiAccountAbi, PEAR_SYMMIO_ACCOUNT_ADDRESS, PEAR_SYMMIO_DIAMOND_ADDRESS, SupportedChainId } from '../constants';
import { ARB_CHAIN_ID } from '../chain';
import { Navbar } from './Navbar';
import StyledConnectButton from './StyledConnectButton';

interface SubAccount {
    accountAddress: string;
    name: string;
}

export const PearProtocolDepositModal = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
    const [amount, setAmount] = useState('20');
    const [isProcessing, setIsProcessing] = useState(false);
    const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<SubAccount | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [isWrongNetwork, setIsWrongNetwork] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [isCreatingNewAccount, setIsCreatingNewAccount] = useState(false);
    const { disconnect } = useDisconnect();

    const { address, chain } = useAccount();

    const handleDisconnect = () => {
        // Reset all state values
        setAmount('20');
        setIsProcessing(false);
        setSubAccounts([]);
        setSelectedAccount(null);
        setIsDropdownOpen(false);
        setIsCreatingAccount(false);
        setIsWrongNetwork(false);
        setNewAccountName('');
        setIsCreatingNewAccount(false);

        // Disconnect wallet
        disconnect();

        // Clear any local storage
        localStorage.removeItem('selectedAccount');
    };

    // Create provider instance
    const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC_URL);

    useEffect(() => {
        if (chain) {
            setIsWrongNetwork(chain.id !== ARB_CHAIN_ID);
        }
    }, [chain]);

    useEffect(() => {
        if (address) {
            fetchSubAccounts();
        }
    }, [address]);

    const fetchSubAccounts = async () => {
        if (!address) return;

        try {
            const multiAccountContract = new ethers.Contract(
                PEAR_SYMMIO_ACCOUNT_ADDRESS[SupportedChainId.ARBITRUM],
                multiAccountAbi,
                provider
            );

            const accountsLength = await multiAccountContract.getAccountsLength(address);

            if (Number(accountsLength) > 0) {
                // Get all accounts
                const accounts = await multiAccountContract.getAccounts(address, 0, accountsLength);
                setSubAccounts(accounts);
                if (accounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(accounts[0]);
                }
                return accounts;
            }
            return [];
        } catch (error) {
            console.error("Error fetching sub accounts:", error);
            return [];
        }
    };

    const { writeContract: addAccount } = useWriteContract();

    const handleCreateSubAccount = async () => {
        if (!address || !newAccountName || isCreatingAccount) return;

        try {
            setIsCreatingAccount(true);
            await addAccount({
                address: PEAR_SYMMIO_ACCOUNT_ADDRESS[SupportedChainId.ARBITRUM] as `0x${string}`,
                abi: multiAccountAbi,
                functionName: 'addAccount',
                args: [newAccountName],
            });

            // Add a small delay to ensure the transaction is processed
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Fetch updated accounts
            const updatedAccounts = await fetchSubAccounts();

            // Reset states
            setNewAccountName('');
            setIsCreatingNewAccount(false);

            // Select the newly created account (last in the list)
            if (updatedAccounts && updatedAccounts.length > 0) {
                const newAccount = updatedAccounts[updatedAccounts.length - 1];
                setSelectedAccount(newAccount);
            }
        } catch (error) {
            console.error("Error creating account:", error);
        } finally {
            setIsCreatingAccount(false);
        }
    };

    const handleDeposit = async () => {
        if (!address || !selectedAccount) return;

        try {
            setIsProcessing(true);

            // Generate calldata for depositFor function on Diamond contract
            const pearSymmioInterface = new ethers.Interface([
                "function depositFor(address user, uint256 amount) external",
            ]);

            const amountInWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals

            const contractPayload = pearSymmioInterface.encodeFunctionData("depositFor", [
                selectedAccount.accountAddress, // Use the selected subaccount address
                amountInWei,
            ]);

            aarcModal.updateRequestedAmount(Number(amount));

            // Update Aarc's destination contract configuration
            aarcModal.updateDestinationContract({
                contractAddress: PEAR_SYMMIO_DIAMOND_ADDRESS[SupportedChainId.ARBITRUM],
                contractName: "Pear Protocol Deposit",
                contractGasLimit: "800000",
                contractPayload: contractPayload
            });

            // Open the Aarc modal
            aarcModal.openModal();
            setAmount('');
            setIsProcessing(false);
        } catch (error) {
            console.error("Error preparing deposit:", error);
            setIsProcessing(false);
            aarcModal.close();
        }
    };

    const shouldDisableInteraction = isWrongNetwork || (!subAccounts.length && !isCreatingNewAccount);

    return (
        <div className="min-h-screen bg-aarc-bg grid-background">
            <Navbar handleDisconnect={handleDisconnect} />
            <main className="mt-24 gradient-border flex items-center justify-center mx-auto max-w-md shadow-[4px_8px_8px_4px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col items-center w-[440px] bg-[#2D2D2D] rounded-[24px]  p-8 pb-[22px] gap-3">
                    {isWrongNetwork && (
                        <div className="w-full p-4 bg-[rgba(255,77,77,0.05)] border border-[rgba(255,77,77,0.2)] rounded-2xl mb-4">
                            <div className="flex items-start gap-2">
                                <img src="/warning-icon.svg" alt="Warning" className="w-4 h-4 mt-[2px]" />
                                <p className="text-xs font-bold text-[#FF4D4D] leading-5">
                                    Please switch to Arbitrum network to continue
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Account Selection or Create First Account */}
                    <div className="w-full relative">
                        <h3 className="text-[14px] font-semibold text-[#F6F6F6] mb-4">Account to Deposit in</h3>
                        {subAccounts.length > 0 ? (
                            <button
                                onClick={() => !shouldDisableInteraction && setIsDropdownOpen(!isDropdownOpen)}
                                disabled={shouldDisableInteraction}
                                className="flex items-center justify-between w-full p-3 bg-[#2A2A2A] border border-[#424242] rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-base text-[#F6F6F6] font-normal">
                                    {selectedAccount?.accountAddress ?
                                        `${selectedAccount.name} (${selectedAccount.accountAddress.slice(0, 6)}...${selectedAccount.accountAddress.slice(-4)})` :
                                        'Select Account'
                                    }
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M4 6L8 10L12 6" stroke="#F6F6F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        ) : !address ? (
                            <StyledConnectButton />
                        ) : (
                            <button
                                onClick={() => !isWrongNetwork && setIsCreatingNewAccount(true)}
                                disabled={isWrongNetwork}
                                className="flex items-center justify-center w-full p-3 bg-[#A5E547] text-[#003300] font-semibold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                            >
                                Create your first account
                            </button>
                        )}


                        {/* Dropdown Menu */}
                        {isDropdownOpen && subAccounts.length > 0 && (
                            <div className="absolute w-full mt-2 bg-[#2A2A2A] border border-[#424242] rounded-2xl overflow-hidden z-50">
                                {subAccounts.map((account) => (
                                    <button
                                        key={account.accountAddress}
                                        onClick={() => {
                                            setSelectedAccount(account);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full p-3 text-left text-[#F6F6F6] hover:bg-[#424242] transition-colors"
                                    >
                                        {account.name} ({account.accountAddress.slice(0, 6)}...{account.accountAddress.slice(-4)})
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setIsCreatingNewAccount(true);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full p-3 text-left text-[#A5E547] hover:bg-[#424242] transition-colors border-t border-[#424242]"
                                >
                                    + Create a new account
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Create New Account Form */}
                    {isCreatingNewAccount && (
                        <div className="w-full p-4 bg-[#2A2A2A] border border-[#424242] rounded-2xl">
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                    placeholder="Enter account name"
                                    className="w-full p-2 bg-transparent border border-[#424242] rounded-lg text-[#F6F6F6] placeholder-[#6B7280] focus:outline-none focus:border-[#A5E547]"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsCreatingNewAccount(false)}
                                        className="flex-1 p-2 text-[#F6F6F6] hover:bg-[#424242] rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateSubAccount}
                                        disabled={!newAccountName || isCreatingAccount}
                                        className="flex-1 p-2 bg-[#A5E547] text-[#003300] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreatingAccount ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="w-full">
                        <div className="flex items-center p-3 bg-[#2A2A2A] border border-[#424242] rounded-2xl">
                            <div className="flex items-center gap-3">
                                <img src="/usdc-icon.svg" alt="USDC" className="w-6 h-6" />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="^[0-9]*[.,]?[0-9]*$"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="w-full bg-transparent text-[18px] font-semibold text-[#F6F6F6] outline-none"
                                    placeholder="Enter amount"
                                    disabled={shouldDisableInteraction}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex gap-[14px] w-full">
                        {['1', '5', '10', '20'].map((value) => (
                            <button
                                key={value}
                                onClick={() => setAmount(value)}
                                disabled={shouldDisableInteraction}
                                className="flex items-center justify-center px-2 py-2 bg-[rgba(83,83,83,0.2)] border border-[#424242] rounded-lg h-[34px] flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-[14px] font-semibold text-[#F6F6F6]">{value} USDC</span>
                            </button>
                        ))}
                    </div>

                    {/* Deposit Info */}
                    <div className="w-full flex gap-x-2 items-start p-4 bg-[rgba(165,229,71,0.05)] border border-[rgba(165,229,71,0.2)] rounded-2xl">
                        <img src="/info-icon.svg" alt="Info" className="w-4 h-4 mt-[2px]" />
                        <div className="text-xs text-[#F6F6F6] leading-5">
                            <p className="font-bold mb-1">After your deposit is completed:</p>
                            <p>Check your deposit balance on{' '}
                                <a
                                    href="https://intent.pear.garden/trade/BTC-ETH"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#A5E547] hover:underline"
                                >
                                    Pear protocol
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleDeposit}
                        disabled={isProcessing || !selectedAccount || shouldDisableInteraction}
                        className="w-full h-11 mt-2 bg-[#A5E547] hover:opacity-90 text-[#003300] font-semibold rounded-2xl border border-[rgba(0,51,0,0.05)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Continue'}
                    </button>

                    {/* Powered by Footer */}
                    <div className="flex flex-col items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-[#F6F6F6]">Powered by</span>
                            <img src="/aarc-logo-small.svg" alt="Aarc" />
                        </div>
                        <p className="text-[10px] text-[#C3C3C3]">
                            By using this service, you agree to Aarc <span className="underline cursor-pointer">terms</span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PearProtocolDepositModal;