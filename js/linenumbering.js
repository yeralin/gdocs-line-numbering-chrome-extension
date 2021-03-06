// Check document code is compatible with way linenumbering works
if ( $( 'body' ).find( ".kix-lineview" ).length == 0 ) {
	// pop-up that let's use know that extension won't work with this document and let user know of possible reasons
	// ask user if he wishes to send data to the developer to see if he can build in a fix for his document

	// Temporary alert till popup is designed
	alert("The Line Numbers for Google Docs extension will not work with this document");

	var popupHTML = '<a href="mailto:pablogamito@gmail.com?subject=&body=' + $("body") + '</a>'

	// TODO: Make this work
	// $( 'body' )

}

//**********//
//INITIALIZE//
//**********//

// Default Values
var everyXLine = 1;
var numberHeaderFooter = false;
var numberBlankLines = false;
var numberParagraphsOnly = true;
var newPageCountReset = false;
var lineBorder = false;

chrome.runtime.sendMessage( {
	for: 'storage',
	action: 'getSettings'
} );

//
// CHECKS IF EXTENSION IS ENABLED TO RUN ALL NECESSARY COMMAND //
//
chrome.storage.local.get( [ "enabled" ], function( result ) {
	if ( result[ "enabled" ] == true ) {
		// Update times used number
		chrome.storage.local.get( [ "timesUsed" ], function( result ) {
			var timesUsed;
			if (parseInt(result["timesUsed"]) != result["timesUsed"] || result["timesUsed"] == null) {
				timesUsed = 1;
			} else {
				timesUsed = parseInt(result["timesUsed"]) + 1;
			}
			chrome.storage.local.set( {
				"timesUsed": timesUsed
			}, function() {
				console.log( 'timesUsed value updated to ' + timesUsed );
				refresh();
			} );
			if (timesUsed == 88) {
				// TODO: Run popup asking to rate the extension
				var popupHTML =
				$('body').append(popupHTML);
			}
		} );

		updateEveryXLine();
		updateNumberBlankLines();
		updateNumberHeaderFooter();
		updateNumberParagraphsOnly();
		updateLineBorder();
		// Number lines
		numberLines();
	}
} );

// alert( "RUNNING" );

function updateEveryXLine() {
	chrome.storage.local.get( [ "everyXLine" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "everyXLine" ] > 0 && result[ "everyXLine" ] <= 100 ) {
			everyXLine = result[ "everyXLine" ];
		} else {
			everyXLine = 1;
		}
		console.log( "Updated everyXLine to " + everyXLine );
	} );
}

function updateNumberBlankLines() {
	chrome.storage.local.get( [ "numberBlankLines" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "numberBlankLines" ] ) {
			numberBlankLines = result[ "numberBlankLines" ];
		} else {
			numberBlankLines = false;
		}
		console.log( "Updated numberHeaderFooter to " + numberHeaderFooter );
	} );
}

function updateNumberHeaderFooter() {
	chrome.storage.local.get( [ "numberHeaderFooter" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "numberHeaderFooter" ] ) {
			numberHeaderFooter = result[ "numberHeaderFooter" ];
		} else {
			numberHeaderFooter = false;
		}
		console.log( "Updated numberHeaderFooter to " + numberHeaderFooter );
	} );
}

function updateNumberParagraphsOnly() {
	chrome.storage.local.get( [ "numberParagraphsOnly" ], function( result ) {
		//update everyXLine value if change
		if ( result[ "numberParagraphsOnly" ] ) {
			numberParagraphsOnly = result[ "numberParagraphsOnly" ];
		} else {
			numberParagraphsOnly = false;
		}
		console.log( "Updated numberParagraphsOnly to " + numberParagraphsOnly );
	} );
}

function updateNewPageCountReset() {
	chrome.storage.local.get( ["newPageCountReset"], function( result) {
		// update newPageCountReset value if change
		if (result[ "newPageCountReset" ] ) {
			newPageCountReset = result[ "newPageCountReset" ];
		} else {
			newPageCountReset = false;
		}
		console.log( "Updated updateNewPageCountReset to " + numberParagraphsOnly );
	});
}

function updateLineBorder() {
	chrome.storage.local.get( ["lineBorder"], function( result) {
		// update newPageCountReset value if change
		if (result[ "lineBorder" ] ) {
			lineBorder = result[ "lineBorder" ];
		} else {
			lineBorder = false;
		}
		console.log( "Updated lineBorder to " + lineBorder );
		// Add or remove line border
		if (lineBorder) {
			$('body').addClass("text-border");
		} else {
			$('body').removeClass("text-border");
		}
	});
}

// var lineCount = $(".kix-lineview").length;
var ln = 0;

function numberLine( $lineview ) {
	console.log('Parents', );
	if ( !numberHeaderFooter && ( $lineview.closest( ".kix-page-header" ).length > 0 || $lineview.closest( ".kix-page-bottom" ).length > 0 ) ) {
		// Header/Footer?
		return false;
	} else if ( !numberBlankLines && $lineview.find( "span.kix-wordhtmlgenerator-word-node" ).text().replace( /\s/g, "" ) === "" ) {
		// Blank line?
		return true;
	} else if ( numberParagraphsOnly && $lineview.parent().attr( "id" ) ) {
		if ( $lineview.parent().attr( "id" ).replace( /\.[^]*/, "" ) === "h" ) {
			// Not pragraph?
			return false;
		}
	} else if ($lineview.parents('.kix-tablerenderer').length) {
		// Part of table
		return false;
	}

	return true;
}

function numberLines() {
	console.log( "Numbering lines every " + everyXLine + " line(s)." );
	if (newPageCountReset) {
		$( 'body' ).find( ".kix-page" ).each( function() {
			var lines = $(this).find( ".kix-lineview" )
			numberSelectedLines(lines);
		});
	} else {
		var lines = $( 'body' ).find( ".kix-lineview" )//.filter(':parents(.kix-tablerenderer)');
		console.log("Lines", lines)
		numberSelectedLines(lines);
	}
}

function numberSelectedLines(lines) { // lines should be an array of found elements to number
	ln = 0;
	// TODO: This should allow easy implementation of selection of were to start and stop line numbering
	lines.each( function() {
		var numberThisLine = numberLine( $( this ) );
		if ( numberThisLine ) ln++;
		if ( ln % everyXLine === 0 && numberThisLine ) {
			$( this ).addClass( "numbered" ).attr( "ln-number", ln );
		} else {
			$( this ).removeClass( "numbered" );
		}
	} );
}

//*****************//
//REFRESH or UPDATE//
//*****************//

function refresh() {
	$( ".numbered" ).removeClass( "numbered" );
	chrome.storage.local.get( [ "enabled" ], function( result ) {
		if ( result[ "enabled" ] == true ) {
			//If extension still enabled
			updateEveryXLine();
			updateNumberHeaderFooter();
			updateNumberBlankLines();
			updateNumberParagraphsOnly();
			updateNewPageCountReset();
			updateLineBorder();

			numberLines();
		}
	} );
}

//Refresh on load to show pages
refresh();

function autorefresh() {
	chrome.storage.local.get( [ "enabled" ], function( result ) {
		if ( result[ "enabled" ] == true ) {
			numberLines();
		}
	} );
}

setInterval( function() {
	autorefresh();
}, 1000 );

// Listen for messages from the popup
chrome.runtime.onMessage.addListener( function( msg, sender, response ) {
	// Validate the message's structure
	if ( ( msg.from === 'popup' ) && ( msg.subject === 'refresh' ) ) {
		//Run when popup notifies of a refresh
		console.log( "Force refresh requested" );
		refresh();
	}
} );


//************************//
//SELECTION LINE NUMBERING//
//************************//

//TODO: Allow numbering lines from selection
