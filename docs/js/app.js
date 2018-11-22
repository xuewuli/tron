App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (!window.tronWeb) {
      const HttpProvider = TronWeb.providers.HttpProvider;
      const fullNode = new HttpProvider('https://api.trongrid.io');
      const solidityNode = new HttpProvider('https://api.trongrid.io');
      const eventServer = 'https://api.trongrid.io/';
      
      const tronWeb = new TronWeb(
          fullNode,
          solidityNode,
          eventServer,
      );
  
      window.tronWeb = tronWeb;
    }

    return App.initContract();
  },

  initContract: function() {
    tronWeb.setDefaultBlock('latest');

    tronWeb.contract().at("TMWct7jPU5mSTHUcvVyPdXeE3HGfj1ochp").then(function(lottery) {
      App.contracts.Lottery = lottery;
      lottery.LotteryTicketPurchased().watch(function(error, result) {
        if (error) {
          return;
        }
        var id = result.result._ticketID;
        if (id) {
          $("#buyTicket" + id.toString()).prop('disabled', true);
        }
      });
      lottery.LotteryAmountPaid().watch(function(error, result) {
        if (error) {
          return;
        }
        App.getLastWinner();
      });

      App.getTicketPrice();
      App.getTicketMapping();
      App.getLastWinner();
      App.bindEvents();
    });
  },

  bindEvents: function() {
    for(var i = 1; i <= 25; i++) {
      $(document).on('click', '#buyTicket' + i, App.handleBuyTicket(i));
    }
  },

  handleBuyTicket: function(ticketNumber) {
    var handler = function() {
      var lottery = App.contracts.Lottery;
      lottery.ticketPrice().call().then(function(ticketPrice) {
        lottery.buyTicket(ticketNumber).send({
          //feeLimit:1000000,
          callValue:ticketPrice,
          shouldPollResponse:true
        });
      })
    }
    return handler;
  },

  getTicketPrice: function() {
    var lottery = App.contracts.Lottery;
    lottery.ticketPrice().call().then(function(result) {
      $('#ticketRawPrice').text(tronWeb.fromSun(result.toNumber()));
    });
  },

  getLastWinner: function() {
    var lottery = App.contracts.Lottery;
    lottery.lastWinner().call().then(function(result) {
      if (result === '410000000000000000000000000000000000000000' ) {
        $('#lastWinner').text('等待开奖');
      } else {
        $('#lastWinner').text('最后得奖者:'+tronWeb.address.fromHex(result));
      }
    });
  },

  getTicketMapping: function() {
    var lottery = App.contracts.Lottery;
    lottery.getTicketsPurchased().call().then(function(result){
      for(var i = 0; i < result.length; i++){
        // Check if a ticket has been purchased
        if(result[i] == "0x0000000000000000000000000000000000000000"){
          result[i] = 0;
        } else {
          result[i] = 1;
          $("#buyTicket" + String(i)).prop('disabled', true);
        }
      }
    })
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
