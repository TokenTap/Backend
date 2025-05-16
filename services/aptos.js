const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const jwt = require('jsonwebtoken');

// You can use AptosConfig to choose which network to connect to
const config = new AptosConfig({ network: Network.TESTNET });
// Aptos is the main entrypoint for all functions
const aptos = new Aptos(config);

async function initUsers() {
    try {
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const payload = {
            function: `${process.env.CONTRACT_ADDRESS}::recipes::create_user_list`,
            functionArguments: []
        }
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

        console.log(`Transaction committed for creating user list: ${committedTxn.hash}`);
    }
    catch (error) {
        console.error("Error initializing users; maybe the users table is already created:", error);
    }
}

async function loginUser(req, res) {
    const { email, name } = req.body;
    try {
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const result = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${process.env.CONTRACT_ADDRESS}::recipes::login_user`,
                functionArguments: [email, name]
            }
        });
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: account, transaction: result });
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        res.status(200).json({
            message: "User logged in successfully",
            token: jwt.sign({ email, name }, process.env.USR_PASSPHRASE)
        });
        return result;
    }
    catch (error) {
        let vmstatus = error.transaction.vm_status;
        if(vmstatus.endsWith("0x28"))
            return res.status(200).json({
                message: "User logged in successfully",
                token: jwt.sign({ email, name }, process.env.USR_PASSPHRASE)
            });
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "An unknown error occurred." });
    }
}

async function initRecipes() {
    try {
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const payload = {
            function: `${process.env.CONTRACT_ADDRESS}::recipes::create_list`,
            functionArguments: []
        }
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

        console.log(`Transaction committed for creating recipe list: ${committedTxn.hash}`);
    }
    catch (error) {
        console.error("Error initializing recipes; maybe the table is already created:", error);
    }

}

async function getAllRecipes(req, res) {
    try {
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const result = await aptos.view({
            payload: {
                function: `${process.env.CONTRACT_ADDRESS}::recipes::get_all_recipes`,
                functionArguments: [account.accountAddress]
            }
        });
        res.status(200).json({result: result[0]});
        return result;
    }
    catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ message: "An unknown error occurred." });
    }
}

async function addRecipe(req, res) {
    try {
        const { email } = req.options;
        const { title, description, images } = req.body;
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const payload = {
            function: `${process.env.CONTRACT_ADDRESS}::recipes::add_recipe`,
            functionArguments: [title, description, images, email],
        }
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

        console.log(`Transaction committed: ${committedTxn.hash}`);
        res.status(200).json({ message: "Recipe added successfully" });
    }
    catch (error) {
        console.error("Error adding recipe:", error);
        res.status(500).json({ message: "An unknown error occurred." });
    }
}

async function getRecipeById(req, res) {
    try {
        const { recipeId } = req.query;
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const result = await aptos.view({
            payload: {
                function: `${process.env.CONTRACT_ADDRESS}::recipes::get_recipe_by_id`,
                functionArguments: [account.accountAddress, recipeId]
            }
        });
        let vec = result[0].vec;
        res.status(200).json({recipe: vec.length ? vec[0] : {}});
        return result;
    }
    catch (error) {
        console.error("Error fetching recipe by ID:", error);
        res.status(500).json({ message: "An unknown error occurred." });
    }
}

async function initAppreciations() {
    try {
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const payload = {
            function: `${process.env.CONTRACT_ADDRESS}::recipes::create_appreciation_list`,
            functionArguments: []
        }
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        console.log(`Transaction committed for creating appreciation list: ${committedTxn.hash}`);
    }
    catch(err) {
        console.log("maybe the appreciations list is already created:", err);
    }
}

async function getAllAppreciations(req, res) {
    try {
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const result = await aptos.view({
            payload: {
                function: `${process.env.CONTRACT_ADDRESS}::recipes::get_all_appreciations`,
                functionArguments: [account.accountAddress]
            }
        });
        res.status(200).json({result});
        return result;
    }
    catch (error) {
        console.error("Error fetching appreciations:", error);
        res.status(500).json({ message: "An unknown error occurred." });
    }
}

async function upvoteRecipe(req, res) {
    try {
        const { email } = req.options;
        const { recipeId } = req.body;
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const payload = {
            function: `${process.env.CONTRACT_ADDRESS}::recipes::appreciate_and_mint`,
            functionArguments: [recipeId, email],
        }
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

        console.log(`Transaction committed for upvoting recipe: ${committedTxn.hash}`);
        res.status(200).json({ message: "Recipe upvoted successfully" });
    }
    catch (error) {
        let vmstatus = error.transaction.vm_status;
        console.log(vmstatus.slice(-10))
        if(vmstatus.endsWith("0x28"))
            return res.status(400).json({
                message: "You cannot upvote your own recipe"
            });
        if(vmstatus.endsWith("0x29"))
            return res.status(400).json({
                message: "You have already upvoted this recipe"
            });
        console.error("Error upvoting recipe:", error);
        res.status(500).json({ message: "An unknown error occurred." });
    }
}

async function mintCoin() {
    try {
        const privateKey = new Ed25519PrivateKey(process.env.ACCOUNT_PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        const payload = {
            function: `${process.env.CONTRACT_ADDRESS}::recipes::mint_coin`,
            functionArguments: []
        }
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        const committedTxn = await aptos.signAndSubmitTransaction({ signer: account, transaction: txn });
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

        console.log(`Transaction committed for minting coin: ${committedTxn.hash}`);
    }
    catch (error) {
        console.error("Error minting coin:", error);
    }
}

mintCoin();

initUsers()
initRecipes();
initAppreciations();

module.exports = { getAllRecipes, addRecipe, getRecipeById, getAllAppreciations, upvoteRecipe, loginUser };