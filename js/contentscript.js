/*!
 * Contact: E-mail:  marshall _AT extension _DOT fm
 *          Twitter: majman
 *          Website: http://extension.fm
 */

$(function(){
	
	// ==================================================
	// Functions & initial properties
	// ==================================================
	var initHTLDone = false;
	function initHTL(){
		if(initHTLDone == false){

			// make artist thumbnail clickable
			$('.htlResultThumb').live('click', function(){
				var i = $('.htlResultThumb').index(this);
				var targetArtist = $('.htlInnerResults').eq(i)
				var aOffset = $(this).position().top - 5;				
				var nOffset = -i*65;
		
				$('#htlResultActive').attr('id', '');
				$(this).attr('id', 'htlResultActive');

				$('#htlActiveArtist').attr('id', '');
				targetArtist.attr('id', 'htlActiveArtist');
		
				var h = ($('#htlActiveArtist').height() + 70) * -i;
		
				$('#htlResultsWrapper').css('-webkit-transform', 'translateY('+h+'px)');
				$('#htlArtistNamesWrapper').css('-webkit-transform', 'translateY('+nOffset+'px)');
				$('#htlArrow').css('-webkit-transform', 'translateY('+aOffset+'px)');
				
				passEvent('Click Artist', $(this).attr('name'));
				if(aboutPage == true){
					turnOffAbout();
				}
			});
			
			// close btn
			$('#htlClose').live('click', function(){
				htlKiller();
			});
			// close on esc key
			$(document).bind('keyup', function(e){
				if(e.which == '27'){
					htlKiller();
				}
			})

			// play / pause logic
			$('.htlAudio').live("click", playPause);
			
			// about page
			var aboutPage = false;
			$('#htlAboutLink').live('click', function(){
				if(!aboutPage){
					$('#htlResultMenu, #htlResultsWrapper').addClass('htlSlideRight');
					setTimeout(function(){
						$('#htlAbout').removeClass('htlAboutOff');
					}, 200);
					aboutPage = true;
				}else{
					turnOffAbout();
				}
				
			});
			
			function turnOffAbout(){
				$('#htlResultMenu, #htlResultsWrapper').removeClass('htlSlideRight');
				$('#htlAbout').addClass('htlAboutOff');
				aboutPage = false;
			}

		}
		initHTLDone = true;
	}	
	
	// remove all htl stuff
	function htlKiller(){
		removeEvents();
		var htlText = $('#htlSelectedText');
		htlText.removeClass('htlOn');
		htlText.attr('id', '');
		$('#htlResults').remove();
		$('#htlBlock').remove();
		$('#htlLoader').remove();
	}
	
	
	// ==================================================
	// Main Play / Puase 
	// ==================================================
	var audio;
	var t, duration, tp;
	var tw = $('.htlAudioBlock').width();
	
	function playPause(){
		t = $(this);
		//console.log(t)
		
		var elem = t.find('audio');
		var i = $('.htlAudios audio').index(elem);
		
		// if audio has already been loaded
		if(audio != undefined){

			// if it's not the same song
			if($(elem).attr('src') != $(audio).attr('src')){
				
				// deactivate previous song
				var prev = $('.htlCurrent');
				prev.find('.htlProgress').css('width', 0);
				prev.removeClass('htlActive htlCurrent htlLoading');
				prev.css('background-image', 'url('+chrome.extension.getURL("images/play-pause.png")+') !important');
				audio.pause();
				removeEvents();
								
				// load & play new song
				audio = document.getElementsByTagName('audio')[i];
				playAudio();
				
				//console.log('play new song')
			}else{					
				// pause / unpause
				if(audio.paused){
					audio.play();
					t.addClass('htlActive htlCurrent');
					//console.log('unpause song')							
				}else{
					t.removeClass('htlActive')
					audio.pause();
					//console.log('pause song');
				}
			}
		}else{
			// load & play first song
			audio = document.getElementsByTagName('audio')[i];
			playAudio();
			//console.log('play first song')

		}
		passEvent('playAudio', t.find('.htlTrackTitle').text());
	}
	
	// ==================================================
	// Play Audio
	// ==================================================
	var aState, aStateCheck;
	function playAudio(){
		aState = '';
		aStateCheck = 0;
		try{
			//console.log('readystate = ', audio.readyState, audio)
			audio.play();
			if(audio.readyState == 0){
				audio.addEventListener('canplay', aCanPlay, false);
				audio.addEventListener('loadeddata', aLoadedData, false);
				audio.addEventListener('waiting', aWaiting, false);
				audio.addEventListener('stalled', aStalled, false);
				audio.addEventListener('progress', aProgress, false);
				audio.addEventListener('suspend', aSuspend, false);
				t.addClass('htlCurrent htlLoading');
				t.css('background-image', 'url('+chrome.extension.getURL("images/loadingAudio.gif")+') !important');
				setTimeout(checkAudioState, 500);
			}else{
				audio.currentTime = 0;
				duration = audio.duration;
				addEvents();
				t.removeClass('htlLoading');
				t.css('background-image', 'url('+chrome.extension.getURL("images/play-pause.png")+') !important');
				t.addClass('htlActive htlCurrent ');
				tp = t.find('.htlProgress');
			}
		}catch(e){
			// //console.log('error - '+e, e.description);
			t.removeClass('htlLoading');
			t.addClass('htlBroken');
			t.css('background-image', 'url('+chrome.extension.getURL("images/play-pause.png")+') !important');
			t.next().click();
		}
	}

	// ==================================================
	// Check for stalled / waiting audio
	// ==================================================
	var checkto;
	function checkAudioState(){
		if(aState != ''){
			//console.log(audio.readyState, audio.networkState, aState, aStateCheck);
			aStateCheck++;
			if(aStateCheck%5 == 0){
				// try to playing again every 5 secs
				audio.play();
				//console.log(' - retry play');
			}
			if(aStateCheck <= 19){
				checkto = setTimeout(checkAudioState, 1000);
			}else{
				removeChecks();
				t.removeClass('htlLoading');
				t.addClass('htlBroken');
				t.css('background-image', 'url('+chrome.extension.getURL("images/play-pause.png")+') !important');
				t.next().click();
			}
		}else{
			playAudio();
		}
	}
	
	function removeChecks(){
		try{
			clearTimeout(checkto);
			audio.removeEventListener('canplay', aCanPlay, false);
			audio.removeEventListener('loadeddata', aLoadedData, false);
			audio.removeEventListener('waiting', aWaiting, false);
			audio.removeEventListener('stalled', aStalled, false);
			audio.removeEventListener('progress', aProgress, false);
			audio.removeEventListener('suspend', aSuspend, false);
		}catch(e){
			//console.log('audio didnt have checks');
		}
	}

	// ==================================================
	// Audio Events
	// ==================================================
	function aCanPlay(){
		console.log('canPlay');
		aState = '';
	}
	function aLoadedData(){
		//console.log('loaded data');
		removeChecks();
		playAudio();
	}
	function aWaiting(){
		aState = 'waiting';
		//console.log('waiting');
	}
	function aStalled(){
		aState = 'stalled';
		//console.log('stalled');
	}
	function aProgress(){
		console.log('progress');
		aState = '';
	}
	function aSuspend(){
		//console.log('suspend');
		aState = 'suspend';
	}

	function addEvents(){
		audio.addEventListener('timeupdate', updateTime, false)
		audio.addEventListener('duration', updateDuration, false)
		audio.addEventListener('error', logError, false)
	}
	function removeEvents(){
		if(audio != undefined){
			audio.removeEventListener('timeupdate', updateTime, false)
			audio.removeEventListener('duration', updateDuration, false)
			audio.removeEventListener('error', logError, false)
			
			removeChecks();
		}
		//console.log('removed events')
	}

	// ==================================================
	// playback bar
	// ==================================================
	var ct = 0;
	function updateTime(){
		ct = audio.currentTime;
		if(duration != NaN && duration < 100000){
			var p = (ct / duration);
			var w = Math.round(p*tw);
			tp.css('width', w+'px');
		}
	}
	function updateDuration(){
		duration = audio.duration;
	}
	function logError(e){
		//console.log('e = '+e)
	}
	
	function passEvent(e, v){
		chrome.extension.sendRequest({gEvent: e, gValue: v}, function(response) {
		  //console.log(response);
		});
	}
	
	// ==================================================
	// Handle response from background
	// ==================================================
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

		// no results on search
		if(request.noData){
			$('#htlLoader').css('background-image', 'none !important').addClass('htlNoResults');
			$('#htlLoader').text(':(');
			setTimeout(function(){
				$('#htlLoader').addClass('htlPostZoom');
			}, 1000)
			var so = setTimeout(htlKiller, 1500);
			return false;
		}
				
		// display results 
		if (request.data){
			$('#htlLoader').addClass('htlPostZoom');
			
			// put any flash in bg
			var o = $('object');
			o.addClass('htlDisplayNone');
			$('object embed').attr('wmode', 'opaque');
			$('object').prepend('<param name="wmode" value="opaque">');
			o.removeClass('htlDisplayNone');
			
			// add results to body
			$('body').prepend('<div id="htlResults" class="htlPreZoom" style="left:'+Number($(window).width()/2-325)+'px; top:'+Number($(window).height()/2-260)+'px">'+request.data+'</div><div id="htlBlock"></div>').delay(250).fadeIn();
			
			setTimeout(function(){
				$('#htlResults').removeClass('htlPreZoom');
			}, 250)
			
			tw = $('.htlAudioBlock').width();
			
			initHTL();
			sendtoExfm();
		}

		if(request.preload){
			var preloader = $('body').prepend('<div class="htlPreZoom" id="htlLoader" style="background-image:url('+chrome.extension.getURL("images/loading.gif")+') !important; left:'+Number($(window).width()/2-20)+'px; top:'+Number($(window).height()/2-40)+'px"></div>');
			setTimeout(function(){
				$('#htlLoader').removeClass('htlPreZoom');
			}, 20);

				var selection = getSelectedText();
				var elmt = $(selection.e.focusNode.parentNode);

				var elmtText = $(elmt).html();
				$(elmt).html(elmtText.replace(selection.t, '<span id="htlSelectedText">'+selection.t+'</span>'));
				
				$('#htlSelectedText').addClass('htlOn');
		}
		
		sendResponse({})
	});

	function getSelectedText(){ 
		var t, e;
	    if(window.getSelection){ 
			e = window.getSelection();
			t = window.getSelection().toString(); 
	    }else if(document.getSelection){
	 		e = document.getSelection(); 
			t = document.getSelection().toString(); 
	    }else if(document.selection){ 
			e = document.selection.createRange(); 
			t = document.selection.createRange().text; 
		}
		return {'t':t, 'e':e};
	}
	
	function sendtoExfm(){
		var event = document.createEvent('Event');
		event.initEvent('exfmSongsAsyncEvent', true, true);
		document.dispatchEvent(event);
		//console.log('hello ?')
	}
});