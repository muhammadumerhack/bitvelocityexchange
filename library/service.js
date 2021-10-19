const chalk = require('chalk');
const axios = require('axios');
var {prompt} = require('inquirer');
const ui = require('cliui')()
let exchangeRate = 62500.2515500;
let adminBalance = 100;
let adminUSDBalance = 0;
let userBTCBlance = 0;
let userBalance = 5000000;
let isServerRestart  = true;
let history = [];
let buyers = []
let sellers = [];
let x,y = 1;

//Matching Service
let matchingServce = ()=> {
    let sample = .50*Math.round(exchangeRate);
    let minRange = exchangeRate-sample;
    let maxRange = exchangeRate+sample;
    let expectedBuyerPrice, expectedSellerPrice,tempSeller,tempBuyer,tempUSD,tempQuantity;
    for(let m in sellers){
        for(let n in buyers ){
            expectedSellerPrice = sellers[m].value;
            expectedBuyerPrice = buyers[n].value;
            if(expectedSellerPrice == expectedBuyerPrice && expectedSellerPrice >= minRange && expectedSellerPrice <= maxRange){
                console.log("Matched")
                tempSeller = sellers[m];
                tempBuyer = buyers[n];
                tempUSD = tempSeller.value;
                tempQuantity = tempSeller.quantity
                sellers.splice(m, 1);
                buyers.splice(n, 1);
                updateBalance(tempUSD);
                updateHistory("sell",true,tempUSD, tempQuantity)
                updateHistory("buy",true,tempUSD, tempQuantity)
                displaytable();
            }
        }
    }
}
// Get Exchange Rate from Api
let getExchangeRate = () => {
    let endPoint = 'https://api.binance.com/api/v3/avgPrice'
    axios({
        method: 'get',
        url: endPoint,
        params:{
            symbol : "BTCUSDT"
        },
        responseType: 'json'
      }).then(
        res => {
            exchangeRate = res.data.price;
            exchangeRate = Math.round(exchangeRate * 10000000) / 10000000
        }).catch(
            err => console.log(err)
        )
}

    
let usdToBtcConverter = (usd) =>{
    let usdValue = usd/exchangeRate;
    return usdValue
}
let updateBalance =(value) =>{
        let btc = usdToBtcConverter(value);
        adminBalance -= btc;
        adminUSDBalance += value;
        userBalance -= value;
        userBTCBlance += btc
}
let updateHistory = (role,matched,value,quantity)=>{
    let details,description = "";
    if(role=="buy"){
        details = 'Buy Price set for $'+ value;
        description = 'Buy order placed for '+ quantity + ' btc at $'+ value
    }if(role=="sell"){
        details = 'Sell Price set for $'+ value;
        description = 'Sell order placed for '+ quantity + ' btc at $'+ value;
    }
    if(matched===true){
        description += ' ( Order matched)';
    }
    history.push({details,description});
    
}

let sell = (quantity, value) =>{
    y++;
    sellers.push({y,quantity,value});
    updateHistory("sell",false,value, quantity);
    matchingServce();
}
let buy = (quantity, value) =>{
    buyers.push({x,quantity,value});
    x++;
    updateHistory("buy",false,value, quantity);
    matchingServce();
}  

let displaytable =()=>{
 ui.div({
    text: chalk.bold.yellow('BITCOIN EXCHANGE 2021'),
    align: "center",
    padding: [2, 0, 1, 0],
 })
 ui.div({
    text: 'Admin BTC Balance' ,
    align: "center",
    padding: [1, 0, 1, 0],
 },
 {
    text: chalk.bold.green('BTC '+adminBalance) ,
    align: "center",
    padding: [1, 0, 1, 0],
 },
 {
    text: 'User Balance',
    align: "center",
    padding: [1, 0, 1, 0],
 }, {
    text: chalk.bold.green('$ '+ userBalance),
    align: "center",
    padding: [1, 0, 1, 0],
 }
 )
 ui.div({
    text: 'Admin USD Balance' ,
    align: "center",
    padding: [1, 0, 1, 0],
 },
 {
    text: chalk.bold.greenBright('$ '+ adminUSDBalance) ,
    align: "center",
    padding: [1, 0, 1, 0],
 },
 {
    text: 'User BTC Balance',
    align: "center",
    padding: [1, 0, 1, 0],
 }, {
    text: chalk.bold.greenBright('BTC '+userBTCBlance),
    align: "center",
    padding: [1, 0, 1, 0],
 }
 )
 ui.div({
    text: chalk.italic.blueBright('BTC/USD: $ '+ exchangeRate),
    align: "center",
    padding: [2, 0, 2, 0],
    
 })

 
 if(history[0]===undefined) {
    ui.div({
        text: 'No Transactions Processed',
        padding: [1, 0, 2, 0],
        align: 'center',
        border: "__"
     })
 }
 else if(history!==[]){
    for(let i in history){
        ui.div(
            {
                text: i,
                padding: [1, 1, 1, 1],
                align: 'center'
            },
            {
                text:  history[i].details,
                padding: [1, 1, 1, 1],
                align: 'center'
            },
            {
                text:  history[i].description,
                padding: [1, 1, 1, 1],
                align: 'center'
            },
        )
         
    }
 }
 
 console.log(ui.toString())
 takeInput()
}
let takeInput = () => {
    prompt([
        {
        name : 'option',    
        type: 'number',
        message : "Want To Buy or Sell  -Enter 1 to buy and 2 to Sell or Enter any other number to refresh the screen or 0 to EXIT",
        }
      ])
      .then((answers) => {
        if(answers.option == 1){
            prompt([
                {
                name : 'val',    
                type: 'number',
                message : chalk.red("Enter the Price at which you want to Buy")
                },
                { 
                name : 'qua',    
                type: 'number',
                message : chalk.red("How many BTC you want to Buy")
                }
              ])
              .then((answers) => {
                buy(answers.qua,answers.val)
                displaytable()
              })
        }else if(answers.option == 2){
                prompt([
                    {
                    name : 'val',    
                    type: 'number',
                    message : chalk.red("Enter the Price at which you want to Sell")
                    },
                    { 
                    name : 'qua',    
                    type: 'number',
                    message : chalk.red("How many BTC you want to Sell")
                    }
                ])
                .then((answers) => {
                    sell(answers.qua,answers.val)
                    displaytable()
                })
        }else if(answers.option == 0){
            console.log(chalk.green.bold("Thanks for using our BTC Exchange"))
            setTimeout(()=>{process.exit()}, 2000);
            
        }else {
            displaytable();
        }
      })
 }
 displaytable();
// Refresh Every 5 sec
setInterval(() => {
    //On Server Restart
    if(isServerRestart == true){ 
        getExchangeRate();
        isServerRestart = false;  
        displaytable();
    }else{
        getExchangeRate();
      }
    }, 5000);
// Run Matching Service
setInterval(()=>{
    if(isServerRestart == false){
        matchingServce();
    }
},1000)



