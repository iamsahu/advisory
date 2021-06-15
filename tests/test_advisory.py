import pytest
from brownie import *
import scripts.deploy as deployer

def setup():
    global advisoryInstance
    deployer.main()
    advisoryInstance = AdvisoryToken[0]

def test_advisory_deploy():
    """
    Test if the contract is correctly deployed.
    """
    print(advisoryInstance.totalSupply())
    print(chain.time())
    assert advisoryInstance.totalSupply() == 100000000000000000000000

def test_initial_balance():
    '''should put 10000 MetaCoin in the first account'''
    balance = advisoryInstance.balanceOf(accounts[0])
    
    assert balance == 100000000000000000000000

def test_mint():
    lastClaim = advisoryInstance.lastClaimedAt()
    balance = advisoryInstance.totalSupply()
    chain.sleep(3600)
    advisoryInstance.mint()
    balanceAfter = advisoryInstance.totalSupply()
    latestClaim = advisoryInstance.lastClaimedAt()
    val =Wei(str((latestClaim-lastClaim)/3600)+" ether")
    assert (balanceAfter-balance) == val
