'use strict';

const { Contract } = require('fabric-contract-api');
const uuidv4 = require('uuid/v4');
const uuidv5 = require('uuid/v5');
const namespace = uuidv4();
const shim = require('fabric-shim');
const logger = shim.newLogger("DataPrivacyContract").cli();
var HashMap = require('hashmap');

class DataPrivacyContract extends Contract {

    async instantiate(ctx) {
        console.info('Start contract ');``
    }

    async getContracts(ctx) {
        let existingContract = await ctx.stub.getState('contracts');
        return 'Existing contracts are ' + existingContract.toString();
    }


    async checkContractState(ctx, id) {
        console.info('Requested contract Id', id);
        let existingContract = await ctx.stub.getState(id);
        if (existingContract.length > 1 ) {
            return 'The contract is ' +existingContract.toString();
        } else { 
            return 'Contract not found ';
        }
    }

    async getSubscriptions(ctx, subscriberId) {
        let subscriptions = await ctx.stub.getState(subscriberId);
        if(subscriptions) {
            return ' found subscription: ' + subscriptions;
        }
        return 'No subscription found in: ' + subscriptions;        
    }

    async insertSubscription(ctx, subscriberId, contractId) {
        let existingContract = await ctx.stub.getState(contractId);
        if(!existingContract) {
            return 'no contract found with id '+contractId;
        }
        let subscriptions = await ctx.stub.getState(JSON.stringify(subscriberId));

        if (subscriptions.contracts) {            
            if (subscriptions.contracts.indexOf(contractId)) {
                return 'contract already subscribed' + subscriptions;
            }
            else {
                subscriptions.contracts.push(contractId);
                await ctx.stub.putState(subscriberId, JSON.stringify(subscriptions));
                return 'contract added to subscription' + subscriptions;
            }
        }
        else {
            let subscription = {contracts: [contractId]};
            await ctx.stub.putState(subscriberId, JSON.stringify(subscription));
            return 'new subscription contract created';
        }      
    }

    // trade function to trade commodities to new owner
    async insertContract(ctx, contractDetails) {
        try {
            let contractInfo = JSON.parse(contractDetails.trim());
            if(!contractInfo.name) {
                return 'Contract must have a name';
            }
            if(!contractInfo.owner) {
                return 'Contract must have an owner';
            }
            if(!contractInfo.contactInfo) {
                return 'Contract must have contact info';
            }
            if(!contractInfo.thirdpartyusage) {
                return 'Missing condition for third party usage';
            }
            if(!contractInfo.offerings) {
                return 'Missing offerings';
            }
            if(!contractInfo.requirements){
                return 'Missing requirements';
            }
            if(!contractInfo.dataSources) {
                return 'Contract must provide data sources';
            }
            if(!contractInfo.limit) {
                return 'Contract must have a limit';
            }
            if(!contractInfo.stage) {
                return 'Contract must have a stage';
            }
            if(!contractInfo.lifetime) {
                return 'Contract must have a lifetime';
            }
            if(!contractInfo.restrictions) {
                return 'Missing restrictions field';
            }
            let currentContracts = await ctx.stub.getState('contracts');            
            if(!currentContracts.length > 1) {
                currentContracts = new HashMap();
            }
            if (contractDetails.uuid) {  

                let existingContract = await ctx.stub.getState(contractDetails.uuid);
                await ctx.stub.putState(contractDetails.uuid, JSON.stringify(contractInfo));
                
                currentContracts.set(contractDetails.uuid, contractDetails);                    
                await ctx.stub.putState('contracts', currentContracts);
                if (existingContract.length > 0) {
                    return 'replaced existing contract with the new contract: ' +JSON.stringify(contractInfo) + ' at id '+contractId;            
                }
                else {
                    return 'Inserted new contract :' + contractInfo + ' with id '+contractId;
                } 
    
            } else {
                let uid = uuidv5(contractInfo.name, namespace);
                await ctx.stub.putState(uid, JSON.stringify(contractInfo));
                return 'contract with new id ' + uid + ' and details: ' + contractDetails + ' has been inserted';
            }   
        } catch (error) {
            return ' JSON parse failed on '+ contractDetails + ' with error ' +error;
        }        
    }
}

module.exports = DataPrivacyContract;