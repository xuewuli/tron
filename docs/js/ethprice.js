
$.getJSON(
  "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=CNY",
  function(json) {
    $('#poolPrice').text((12500*json['CNY']).toFixed(2));
    $('#ticketPrice').text((500*json['CNY']).toFixed(2));
  }
);
