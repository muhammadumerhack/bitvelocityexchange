const chalk = require('chalk');
const axios = require('axios');
var {prompt} = require('inquirer');
const ui = require('cliui')()
var exchangeRate = 65015;
let adminBalance = 100;
let adminUSDBalance = 0;
let userBTCBlance = 0;
let userBalance = 5000000;

let history = [];
let buyers ={}
let sellers =[];
let x,y = 1;

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
            return exchangeRate = res.data.price;
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
let match = (price,array,cb)=>{
    let temp = {}
    for(let item in array){
        if(price==JSON.stringify(array[item].value)){
            temp = array[item];
            array.splice(item, 1);
            let value = temp.value;
            let quantity = temp.quantity;
            
            updateBalance(value);
            cb(true,value,quantity)
        }else {
            cb(false,null,null)
        }
    }
}
let sell = (quantity, value) =>{
    y++;
    sellers.push({y,quantity,value});
    updateHistory("sell",false,value, quantity) 
    match(value,buyers,(matched,value,quantity)=>{
        if(matched){
            updateHistory("sell",true,value, quantity)
        }
    })
     
}
let buy = (quantity, value) =>{
    buyers +={x,quantity,value};
    x++;
    updateHistory("buy",false,value, quantity) 
    match(value,sellers,(matched,value,quantity)=>{
        if(matched){
            updateHistory("buy",true,value, quantity)
        }
    })
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
        message : "Want To Buy or Sell  -Enter 1 to buy and 2 to Sell",
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
        }else {
            takeInput();
        }
      })
 }
displaytable()




// Refresh Every 5 min
setInterval(() => {
//On Server Restart
if(exchangeRate == null){ 
  getExchangeRate();
}else{
    getExchangeRate();
  }
}, 10000);
