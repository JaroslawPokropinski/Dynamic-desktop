$('img').on('dragstart', function(event) {
  event.preventDefault();
});
$(document).ready(function() {
  var currentMoon = null;
  var oldEarth = null;

  var markets = [new Bitstamp()];
  var selectedMarketIndex = 0;
  var selectedMarket = markets[selectedMarketIndex];

  function fetchMooningPrices() {
    selectedMarket.fetchPrices(mooningFunction);
  }
  //boostrap to display current mooning prices and daily change
  fetchMooningPrices();
  setInterval(fetchMooningPrices, 5 * 60 * 1000);

  //web sockets running to not lose the mooning prices
  for (i = 0; i < markets.length; i++) {
    markets[i].runWebsocketTicker(() => {});
  }

  function moonTicker() {
    mooningFunction(
      selectedMarket.getOpenPrice(),
      selectedMarket.getLatestPrice(),
      selectedMarketIndex
    );
  }

  function mooningFunction(open, close, id) {
    updateStatus(open, close);
  }

  function updateStatus(open, close) {
    var angle = (Math.atan2(close - open, 20) * 180) / Math.PI;
    var changeAbs = Math.abs(currentMoon / oldEarth - 1).toFixed(3);
    var changeTreshold = 0.008;

    if (changeAbs >= changeTreshold) {
      $('#roller-coaster-guy').attr('src', 'roller-coaster-guy.gif');
      rotateTheGuy(90 - angle); //  +90 degrees 'cause de upwards gif
    } else {
      $('#roller-coaster-guy').attr('src', 'no-fun-roller-coaster-guy.gif');
      rotateTheGuy(-angle);
    }
  }

  function rotateTheGuy(angle) {
    $('#roller-coaster-guy').css({
      transform: 'rotate(' + angle + 'deg)',
      '-moz-transform': 'rotate(' + angle + 'deg)',
      'o-transform': 'rotate(' + angle + 'deg)',
      'webkit-transform': 'rotate(' + angle + 'deg)'
    });
  }
  moonTicker();
  setInterval(moonTicker, 6 * 1000);
});
