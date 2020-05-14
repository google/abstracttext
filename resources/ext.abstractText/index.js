const addTestResults = (element, results) => {
  let testid = element.attr('data-testid');
  let testResults = results[testid];
  element.append($('<strong>').html('Test results by implementation:'));
  let outer = $('<table>');
  for (let [impl, implInfo] of Object.entries(testResults)) {
    let row = $('<tr>');
    row.append($('<td>').html(impl));
    let inner = $('<td>');
    run_count = implInfo['runs'];
    errors = implInfo['errors'];
    time = implInfo['average_ms'];
    inner.html('Average ' + time + 'ms in ' + run_count + ' runs (' + errors + ' errors)');
    row.append(inner)
    outer.append(row);
  }
  element.append(outer);
};

$( function() {
  const zidArray = document.URL.match(/\/M:(Z\d+)/);
  const zid = zidArray[1];
  $.get("/api.php?action=abstracttext&function=" + zid + "&getResults=1&format=json",
    function( data ) {
      const results = data.abstracttext;
      $( '.test_result' ).each(function() {
	addTestResults($( this ), results);
     });
      
    });
});
