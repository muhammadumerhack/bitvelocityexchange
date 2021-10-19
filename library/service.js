const chalk = require('chalk');
const axios = require('axios');
const ui = require('cliui')()
var exchangeRate;
var adminBalance = 100;
var userBalance = 5000000;

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
        adminBalance - btc;
        userBalance + value;
}
let updateHistory = (role,matched,value,quantity)=>{
    let details,description = "";
    if(matched){
        description += ' ( Order matched)';
    }if(role=="buy"){
        details += 'Buy Price set for $'+ value;
        description += 'Buy order placed for'+ quantity + ' btc at $'+ value
    }if(role=="sell"){
        details += 'Sell Price set for $'+ value;
        description += 'Sell order placed for'+ quantity + ' btc at $'+ value
    }
    updateBalance(value);
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
            cb(true,value,quantity)
        }else {
            cb(false,null,null)
        }
    }
}
let sell = (quantity, value) =>{
    y++;
    sellers.push({y,quantity,value});
    match(value,buyers,(matched,value,quantity)=>{
        if(matched){
            updateHistory(sell,matched,value, quantity)
        }
        if(!matched){
            updateHistory(sell,matched,value, quantity) 
        }
    })
     
}
let buy = (quantity, value) =>{
    buyers +={x,quantity,value};
    x++;
    match(value,sellers,(matched,value,quantity)=>{
        if(matched){
            updateHistory(buy,matched,value, quantity)
        }
        if(!matched){
            updateHistory(buy,matched,value, quantity) 
        }
    })
}  

let displaytable =()=>{

}
// Refresh Every 5 min
setInterval(() => {
//On Server Restart
if(exchangeRate == null){ 
  getExchangeRate()
}else{
    getExchangeRate();
  }
}, 1000);
