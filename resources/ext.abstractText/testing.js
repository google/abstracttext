const runATest = (event) => {
  let target = $( event.target );
  let zid = event.data.zid;
  let testid = event.data.testid;
  let impl = event.data.impl;
  let parent = target.parent();
  let reportArea = parent.find( "span" );
  if ( reportArea.length === 0 ) {
    reportArea = $('<span>');
    parent.append(reportArea);
  }
  reportArea.html("... waiting for results ...");

  $.get("/api.php?action=abstracttext&function=" + zid + "&runATest=1&testId=" + testid + "&implementationId=" + impl + "&format=json",
    function( data ) {
      const results = data.testResults;
      reportArea.html("Result: " + results.result + " (expected " + results.expected + ") " + results.ms + "ms");
    });
}

const runButton = (zid, testid, impl) => {
  let buttonElement = $('<button>');
  buttonElement.attr('type', 'button');
  buttonElement.click({zid: zid, testid: testid, impl: impl}, runATest);
  buttonElement.html('Test Now');
  return buttonElement;
}

const addTestResults = (element, results, zid) => {
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
    row.append(inner);
    row.append($('<td>').append(runButton(zid, testid, impl)));
    outer.append(row);
  }
  element.append(outer);
};

$( function() {
  const zidArray = document.URL.match(/\/M:(Z\d+)/);
  if (zidArray !== null) {
    const zid = zidArray[1];
    $.get("/api.php?action=abstracttext&function=" + zid + "&getResults=1&format=json",
      function( data ) {
        const results = data.abstracttext;
        if (results !== null) {
          $( '.test_result' ).each(function() {
             addTestResults($( this ), results, zid);
         });
        }
      });
  }
});
