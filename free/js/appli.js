/*
-----------------------------------------------------------------------

	* Google search script 1.9
	* Developed by Algoprog
	* Last edit: 6/28/2016
	
	[-- TERMS OF USE --]
	
	YOU CAN USE THIS SCRIPT WITHOUT ANY RESTRICTIONS, IT IS COMPLETELY
	LEGAL AS IT IS BASED ON APIS PROVIDED BY GOOGLE FOR FREE USE. BUT 
	IT IS RECOMMENDED THAT YOU DON'T HIDE GOOGLE BRANDING IN THE SEARCH
	RESULTS TO PREVENT ANY LEGAL ISSUES. ALSO YOU CAN INCLUDE ALGOPROG 
	IN YOUR CREDITS IF YOU WISH, I WOULD REALLY APPRECIATE IT, HOWEVER 
	THIS IS NOT NESECAIRY.
	
	[-- PLEASE DON'T STEAL! --]
	
	PLEASE DON'T DOWNLOAD OR REDISTRIBUTE THIS SCRIPT FOR FREE OR FOR
	YOUR OWN PROFIT, I AM AN INDEPENDENT DEVELOPER. BY GIVING A SMALL 
	AMOUNT TO BUY THIS SCRIPT YOU HELP ME CONTINUE AND IMPROVE IT.
	
	IF THIS IS AN ILLEGAL COPY, A "NULLED" SCRIPT PLEASE GO
	AND BUY THIS SCRIPT IN THE URL BELLOW:
	
	https://algoprog.com/google-search-script
	
	THANK YOU!
	
-----------------------------------------------------------------------
*/

$(document).ready(function(){
	
	app_name = "Free Yerli Arama Motoru"; //your search engine name
	loc = "tr"; //your language
	pubId = ""; //your AdSense Custom Search Ads pubId
	domain = "0.0.0.0:8000"; //your domain name
	
	query_prediction = "";
	query = "";
	yt_pageToken = "";
	page = 0;
	pstart = 0;
	fs = 0; //if current search query is final
	ps = setTimeout("",1); //timer to pre-load results for predicted query
	tab = "web"; //current tab
	cq = setInterval("",3600000); //to check if the results are for the current query
	lw = 0; //load wait > 0 to prevent multiple pages load while scrolling
	
	setInterval("responsive();",500);
	
	$("#q").googleSuggest({service: "web"});
	$("#q").on("autocompleteselect",function(){setTimeout("$('#q').blur(); if($('#q').val()!=query){ set_query($('#q').val()); $('#sug').html($('#q').val()); fs=1; search(0); page=0; }",10);});
	console.log(window.location.host);
	if(window.location.host==domain){
		$("#search_home").fadeIn(700);
		$("#qs").focus();
	}
	
	responsive();
	
	$("#qs").bind('keyup', function(e){
		$("#search_home").hide();
		$("#search").show();
		$("#q").focus();
		$("#q").val($("#qs").val());
		$("#qs").val("");
		responsive();
		predict();
		if($("#q").val()==""){
			clear();
		}
	});

	$("#unlucky").bind('click', function(e){
		e.preventDefault();
		$("#search_home").hide();
		$("#search").show();
		$("#q").focus();
		$("#q").val("2016 bütçe açığı");
		$("#qs").val("");
		responsive();
		predict();
		if($("#q").val()==""){
			clear();
		}
	});

	$("#letter").bind('click', function(e){
		e.preventDefault();
		$("#search_home").hide();
		$("#search").show();
		$("#q").focus();
		$("#q").val("gençliğe hitabe");
		$("#qs").val("");
		responsive();
		predict();
		if($("#q").val()==""){
			clear();
		}
	});
	
	$("#q").bind('keyup keypress cut copy paste', function(e){
		if(!startsWith(query_prediction,$("#q").val())){
			$("#sug").html($("#q").val());
		}
		if(e.keyCode==13){ //if enter pressed
			$("#sug").html($("#q").val());
			$(".ui-widget-content").hide();
			$("#q").blur();
			
			if($("#q").val()!=query){
				$("#results").css({"opacity":"0.3"});
				set_query($("#q").val());
				fs = 1;
				search(0);
			}
		}
		if($("#q").val()==""){
			clearTimeout(ps);
			clear();
		}
	});
	
	$("#sbtn").click(function(){ //#sbtn is the search button
		$("#sug").val($("#q").val()); //#sug is the prediction textbox
		$(".ui-widget-content").hide(); //hide autocomplete menu
		$("#q").blur();
		$("#results").css({"opacity":"0.3"}); //the results div
		set_query($("#q").val());
		lw = 0;
		fs = 1;
		search(0);
	});
	
	$("#web").click(function(){
		choose_tab("web");
	});
	
	$("#images").click(function(){
		choose_tab("images");
	});
	
	$("#videos").click(function(){
		choose_tab("videos");
	});
	
	$("#news").click(function(){
		choose_tab("news");
	});
	
	$("#logo_top").click(function(){
		reset();
	});
	
	$("#lucky").click(function(){
		lucky();
	});
	
	if(get_hash().indexOf("q=")>=0){ //if query is set in URL fragment
		$("#search_home").hide();
		$("#search").fadeIn("fast");
		$("#q").blur();
		$("#qs").blur();
		set_query(get_hash().replace("q=",""));
		$("#sug").html(query);
		$("#q").val(query)
		fs = 1;
		search(1);
		responsive();
	}
	
});

$(window).resize(function(){
	responsive();
});

$(window).scroll(function(){ //load on scroll
	if((tab=="images"||tab=="videos") && $(window).scrollTop() >= $(document).height() - $(window).height() - 300 && lw==0){
		search(1);
	}
});

function show_ads(){
	$("#results").prepend('<div id="ad_box"></div>');
	var pageOptions = {
		'pubId': pubId,
		'query': query,
		'hl': loc,
		'adPage': page+1
	};
	var adblock = { 
		'container': 'ad_box',
		'number': 2,
		'width': '570px',
		'lines': 1,
		'longerHeadlines': true,
		'detailedAttribution': false
	};
	_googCsa('ads', pageOptions, adblock);
}

function choose_tab(id){
	$(".tab").removeClass("tsel");
	$("#"+id).addClass("tsel");
	tab = id;
	fs = 1;
	page = 0;
	$("#results").css({"opacity":"0.3"});
	search(1);
}

function predict(){
	
	if(window.location.host!=domain) return;
	
	$.ajax({
      url: 'https://clients1.google.com/complete/search',
      dataType: 'jsonp',
      data: {
        q: $("#q").val(),
        nolabels: 't',
        client: 'psy',
        ds: ''
      },
      success: function(data) {
		uquery = data[1][0].toString();
		tquery = uquery.split(",0");
		query_prediction = tquery[0];
		query_prediction = query_prediction.replace('<b>','');
		query_prediction = query_prediction.replace('</b>','');
		query_prediction = query_prediction.replace('\u003cb\u003e','');
		if(query_prediction!="undefined" && query_prediction!=query){
			set_query(query_prediction);
			if(query_prediction.indexOf($("#q").val())>-1){
				$("#sug").html(query_prediction);
				if($("#q").val()!=""){
					ps = setTimeout("fs=0; set_query(query_prediction); get_page(1);",100);
				}
			}else{
				$("#sug").html("");
			}
		}
		else if(window.squery=="undefined"){
			set_query("");
		}
      }
    });
}

function get_page(p){
	pstart = p;
	$('html, body').animate({ scrollTop: 0 }, 0);
	$("#results").css({"opacity":"0.3"});
	search(1);
}

function get_hash(){ //get the current hash of the search page
	return decodeURIComponent(window.location.hash.substring(1));
}

function set_query(q){ //set the search query
	page = 0;
	yt_pageToken = "";
	query = decodeEntities(escapeHtml(q));
	if(query!=""){
		document.title = query + " - " + app_name;
		window.location.replace("#q=" + encodeURIComponent(query));
	}else{
		document.title = app_name;
		window.location.replace("#");
		$("#sug").val("");
	}
}

function show_answer(){ //show special answer on top of results
	$("#results").prepend('<div id="answer"></div>');
	$("#results").css({"margin-top":"50px"});
}

function hide_answer(){ //hide special answer
	$("#answer").hide();
	$("#results").html($("#results").html().replace('<div id="answer"></div>',''));
	$("#results").css({"margin-top":"0px"});
}

function search(c){ //main search function

	if(window.location.host!=domain) return;

	if(c==0){
		if($("#results").html()!="" && $("#sug").val()==query){
			$("#results").css({"opacity":"1"});
			return;
		}
		$("#results").css({"opacity":"0.3"}); //fadeOut results
		lw = 0;
	}
	
	clearTimeout(ps);
	
	$("#pages").html("");
	
	if(tab=="web"){
		web_search(page);
		if(query.indexOf("weather")>-1){ //get weather answer
			show_answer();
			var wloc = query.replace("weather in","");
			wloc = wloc.replace("weather at","");
			wloc = wloc.replace("weather of","");
			wloc = wloc.replace("weather on","");
			wloc = wloc.replace("weather","");
			wloc = wloc.trim();
			$("#answer").load("apis/weather.php?c="+encodeURIComponent(wloc),function(d){
				if(d!="") $("#answer").show();
				else{
					hide_answer();
				}
			});
		}else{
			hide_answer();
		}
	}else if(tab=="images"){
		hide_answer();
		images_search(page);
	}else if(tab=="videos"){
		hide_answer();
		videos_search(page);
	}else if(tab=="news"){
		hide_answer();
		news_search(page);
	}
}

function web_search(start){ //google web search function

	if(window.location.host!=domain) return;

	if(tab!="web") return;
	lw++;
	var cw = lw; //current result page count (to prevent an issue when changing tab)
	clearInterval(cq);
	cq = setInterval("if($('#q').val()!='"+query+"' && fs){ set_query($('#q').val()); $('#results').html(''); search(0); }",700); //to check the current query
	$("#q").googleSuggest({service: "web"});
	gurl = "https://www.googleapis.com/customsearch/v1element?key=AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY&num=10&prettyPrint=false&source=gcsc&gss=.com&sig=ee93f9aae9c9e9dba5eea831d506e69a&cx=partner-pub-8993703457585266%3A4862972284&googlehost=www.google.com&hl="+loc+"&q="+query;
	if(start>0){
		gurl = gurl + "&start=" + start + 1;
	}
	$.ajax({
		type: "GET",
		url: gurl,
		dataType:"jsonp",
		success: function(response){
			if(response.results){
				$("#pages").html("");
				var cnt = 0;
				$.each(response.cursor.pages, function(index,pitem){
					cnt++;
					if(cnt<10){
						if(parseInt(pitem.label)==response.cursor.currentPageIndex+1)
							$("#pages").append("<span onclick='page = "+pitem.label+"-1; get_page("+parseInt(pitem.label)+");'><b>"+pitem.label+"</b></span> ");
						else
							$("#pages").append("<span onclick='page = "+pitem.label+"-1; get_page("+parseInt(pitem.label)+");'>"+pitem.label+"</span> ");
					}
				});
				if(page<8) $("#pages").append(' &nbsp;<span id="next" onclick="page++; get_page(page+1);">Next ></span>');
				if(page>0) $("#pages").prepend('<span id="previous" onclick="page--; get_page(page-1);">< Previous</span> &nbsp;');
				$("#results").html("");

				$.each(response.results, function(index, item){
					var r_url = decodeURIComponent(item.url);
					if(item.richSnippet && (r_url.indexOf("wikipedia.org")>-1||r_url.indexOf("youtube.com/watch?v=")>-1||r_url.indexOf("play.google.com/store/apps/details?id=")>-1)){
						if(item.richSnippet.cseThumbnail)
							var tb_img = "<img class='thumb' src='"+item.richSnippet.cseThumbnail.src+"'/>";
						else{
							var ytid = get_ytid(r_url);
							if(ytid!=""){
								var tb_img = "<img class='thumb' src='https://i.ytimg.com/vi/"+ytid+"/default.jpg'/>";
							}else{
								var tb_img = "";
							}
						}
					}else{
						var tb_img = "";
					}
					$("#results").append("<div class='rbox clearfix'><a class='rl' href='"+decodeURIComponent(item.url)+"' target='_blank'>"+item.title+"</a><br/>"+tb_img+"<div class='g'>"+decodeURIComponent(item.formattedUrl)+"</div><div class='snippet'>"+item.content+"</div></div><br/>");
				});
				if(start==0 && response.cursor.resultCount!='0' && cw==lw){
					$("#query").html(query);
					var rcount = parseInt(replaceAll(",","",response.cursor.resultCount));
					$("#count").html(number_format(rcount));
					$("#speed").html(response.cursor.searchResultTime);
					$("#results_wrap").show();
					$("#footer").css({"position":"absolute"});
				}
				show_ads();
				lw = 0;
			}else $("#next").hide();
			$("#results").css({"opacity":"1"});
		}
	});
}

function images_search(start){ //google images search function

	if(window.location.host!=domain) return;

	if(tab!="images") return;
	lw++;
	var cw = lw;
	clearInterval(cq);
	cq = setInterval("if($('#q').val()!='"+query+"' && fs){ set_query($('#q').val()); $('#results').html(''); search(0); }",700);
	$("#q").googleSuggest({service: "images"});
	gurl = "https://www.googleapis.com/customsearch/v1element?key=AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY&num=10&prettyPrint=false&source=gcsc&gss=.com&sig=ee93f9aae9c9e9dba5eea831d506e69a&searchtype=image&cx=partner-pub-8993703457585266%3A4862972284&googlehost=www.google.com&hl="+loc+"&q="+query;
	if(start>0){
		gurl = gurl + "&start=" + start + 1;
	}
	$.ajax({
		type: "GET",
		url: gurl,
		dataType:"jsonp",
		success: function(response){
			if(response.results){
				if(start==0){
					cnt = 0;
					$("#results").html("");
				}
				$.each(response.results, function(index, item){
					cnt++;
					$("#results").append("<div class='image'><a href='"+item.unescapedUrl+"' class='image-popup-vertical-fit' title='"+item.titleNoFormatting+" - "+item.contentNoFormatting+"'><img src='"+item.tbUrl+"'></a></div>");
				});
				if(start==0 && response.cursor.resultCount!='0' && cw==lw){
					$("#query").html(query);
					var rcount = replaceAll(",",".",response.cursor.resultCount);
					$("#count").html(rcount);
					$("#speed").html(response.cursor.searchResultTime);
					$("#results_wrap").show();
					$("#footer").css({"position":"absolute"});
				}
				lw = 0;
				if(cnt<100){ //load at least 100 images
					images_search(start+1);
				}
			}
			$('.image-popup-vertical-fit').magnificPopup({
				type: 'image',
				closeOnContentClick: true,
				mainClass: 'mfp-img-mobile',
				image: {
					verticalFit: true
				},
				gallery: {
					enabled: true
				},
				zoom: {
					enabled: true,
					duration: 300,
					easing: 'ease-in-out'
				}
			});
			$("#results").css({"opacity":"1"});
			lw = 0;
			page++;
		}
	});
}

function videos_search(start){
	
	if(window.location.host!=domain) return;
	
	if(tab!="videos") return;
	lw++;
	var cw = lw;
	clearInterval(cq);
	cq = setInterval("if($('#q').val()!='"+query+"' && fs){ set_query($('#q').val()); $('#results').html(''); search(0); }",700);
	$("#q").googleSuggest({service: "youtube"});
	gurl = "https://content.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&lr=en&orderby=viewCount&maxResults=20&hl=en&key=AIzaSyB0Jm1M4z4ffP3yFdEPFk-sd9XU5JabZLM&q="+query;
	gurl = gurl + "&pageToken=" + yt_pageToken;
	$.ajax({
		type: "GET",
		url: gurl,
		dataType:"jsonp",
		success: function(response){
			ready = 1;
			if(response.items){
				yt_pageToken = response.nextPageToken;
				page++;
				if(start==0){
					cnt = 0;
					$("#results").html("");
				}
				$.each(response.items, function(index, item){
					var cdate = new Date().getTime()/1000;
					pdate = toTimestamp(item.snippet.publishedAt);
					var diff = cdate-pdate;
					if(diff<0){
						diff = -diff;
					}
					date = timeago(diff);
					$("#results").append("<div class='video'><a href='http://www.youtube.com/watch?v="+item.id.videoId+"' target='_blank'><img src='"+item.snippet.thumbnails.default.url+"'/></a><a href='http://www.youtube.com/watch?v="+item.id.videoId+"' target='_blank' class='rl'>"+item.snippet.title+"</a><br/><a href='http://youtube.com/user/"+item.snippet.channelTitle+"'>"+item.snippet.channelTitle+"</a> - "+date+"</div>");
				});
				if(start==0 && response.pageInfo.totalResults!='0'){
					$("#query").html(query);
					$("#count").html(number_format(response.pageInfo.totalResults));
					$("#speed").html('~0.2');
					$("#results_wrap").show();
				}
				lw = 0;
			}
			$("#results").css({"opacity":"1"});
			lw = 0;
			page++;
		}
	});
}

function news_search(start){
	
	if(window.location.host!=domain) return;
	
	if(tab!="news") return;
	lw++;
	var cw = lw;
	clearInterval(cq);
	cq = setInterval("if($('#q').val()!='"+query+"' && fs){ set_query($('#q').val()); $('#results').html(''); search(0); }",700);
	$("#q").googleSuggest({service: "news"});
	gurl = "https://ajax.googleapis.com/ajax/services/search/news?v=1.0&q="+query+"&hl="+loc;
	if(start>0){
		gurl = gurl + "&start=" + pstart;
	}
	$.ajax({
		type: "GET",
		url: gurl,
		dataType:"jsonp",
		success: function(response){
			ready = 1;
			if(response.responseData.results){
				var cdate = new Date().getTime()/1000;
				
				$("#pages").html("");
				cnt = 0;
				$.each(response.responseData.cursor.pages, function(index,pitem){
					cnt++;
					if(cnt<10){
						if(parseInt(pitem.label)==response.responseData.cursor.currentPageIndex+1){
							$("#pages").append("<span onclick='page = "+pitem.label+"-1; get_page("+pitem.start+");'><b>"+pitem.label+"</b></span> ");
							pstart = parseInt(pitem.start);
						}else
							$("#pages").append("<span onclick='page = "+pitem.label+"-1; get_page("+pitem.start+");'>"+pitem.label+"</span> ");
					}
				});
				if(page<parseInt(response.responseData.cursor.pages[response.responseData.cursor.pages.length-1].label)-1) $("#pages").append(' &nbsp;<span id="next" onclick="page++; get_page(pstart+4);">Next ></span>');
				if(start>0) $("#pages").prepend('<span id="previous" onclick="page--; get_page(pstart-4);">< Previous</span> &nbsp;');
				cnt = 0;
				$("#results").html("");
				
				$.each(response.responseData.results, function(index, item){
					cnt++;
					var pdate = toTimestamp(item.publishedDate);
					var diff = cdate-pdate;
					if(diff<0){
						diff = -diff;
					}
					var date = timeago(diff);
					if(item.image){
						if(item.image.tbUrl)
							var tb_img = "<img class='thumb' src='"+item.image.tbUrl+"'/>";
						else
							var tb_img = "";
					}else{
						var tb_img = "";
					}
					$("#results").append("<div class='rbox clearfix'>"+tb_img+"<a href='"+decodeURIComponent(item.unescapedUrl)+"' target='_blank' class='rl_sm'>"+item.title+"</a><br/><span class='g'>"+item.publisher+"</span> - <span class='gray'>"+date+"</span><br/>"+item.content+"<br/></div><br/>");
				});
				if(start==0 && response.responseData.cursor.estimatedResultCount!='0'){
					$("#query").html(query);
					var rcount = number_format(response.responseData.cursor.estimatedResultCount);
					$("#count").html(rcount);
					$("#speed").html('~0.2');
					$("#results_wrap").show();
				}
			}
			$("#results").css({"opacity":"1"});
			lw = 0;
		}
	});
}

function lucky(){
	window.location = "http://www.google.com/search?hl=en&source=hp&btnI&q="+$("#q").val();
}

function responsive(){
	$("#sug").css($("#q").offset());
	$("#sug").css({"height":$("#q").height()+"px"});
	if($(window).width()<810){
		$("#branding").hide();
		$("#qs").addClass("q_mobile");
		$("#logo_top").hide();
		$("#q").css({"width":$(window).width()-$("#sbtn").width()-45+"px"});
		$("#sug").css({"width":$(window).width()-$("#sbtn").width()-45+"px"});
	}else{
		$("#branding").show();
		$("#qs").removeClass("q_mobile");
		$("#logo_top").show();
		$("#q").css({"width":"550px"});
		$("#sug").css({"width":"550px"});
	}
	$("#results_wrap").css({"margin-left":$("#q").offset().left+"px"});
	if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
		$("#sbtn").css({"height":"40px"});
	}
}

function clear(){
	query_prediction = "";
	set_query("");
	$("#q").val("");
	page = 0;
	fs = 0;
	lw = 0;
	tab = "web";
	$(".tab").removeClass("tsel");
	$("#web").addClass("tsel");
	window.location.replace("#");
	document.title = app_name;
	$("#sug").html("");
	$("#results").html("");
	$("#results_wrap").hide();
	$("#footer").css({"position":"fixed"});
}

function reset(){
	clear();
	$("#search").hide();
	$("#search_home").fadeIn("fast");
	$("#qs").focus();
}

function startsWith(string, prefix){
    return string.slice(0, prefix.length) == prefix;
}

function get_ytid(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
        return match[7];
    }else{
        return "";
    }
}

function replaceAll(find, replace, str){
	return str.replace(new RegExp(find, 'g'), replace);
}

function number_format(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function escapeHtml(text){ //to prevent XSS attacks
  return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
}

var decodeEntities = (function(){ //to decode html special chars
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string'){
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }
  return decodeHTMLEntities;
})();

function mround(num, dec){
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function get_duration(duration){
	var dur1 = mround((duration/60), 0);
	if((duration % 60)<10){
		var dur = '0'+(duration % 60);
	}else{
		var dur = duration % 60;
	}
	return dur1+':'+dur;
}

function toTimestamp(strDate){
	var datum = Date.parse(strDate);
	return datum/1000;
}
	
function timeago(time_difference){
	var seconds = time_difference; 
	var minutes = Math.round(time_difference/60);
	var hours = Math.round(time_difference/3600); 
	var days = Math.round(time_difference/86400); 
	var weeks = Math.round(time_difference/604800); 
	var months = Math.round(time_difference/2419200); 
	var years = Math.round(time_difference/29030400); 
		
	if(seconds <= 60){
		return seconds + " seconds ago"; 
	}
	else if(minutes <=60){
		if(minutes==1){
			return "1 minute ago"; 
		}
		else{
			return minutes + " minutes ago"; 
		}
	}
	else if(hours <=24){
		if(hours==1){
			return "1 hour ago";
		}
		else{
			return hours + " hours ago";
		}
	}
	else if(days <=7){
		if(days==1){
			return "1 day ago";
		}
		else{
			return days + " days ago";
		} 
	}
	else if(weeks <=4){
		if(weeks==1){
			return "1 week ago";
		}
		else{
			return weeks + " weeks ago";
		}
	}
	else if(months <=12){
		if(months==1){
			return "1 month ago";
		}
		else{
			return months + " months ago";
		} 
	}
	else{
		if(years==1){
			return "1 year ago";
		}
		else{
			return years + " years ago";
		}
	}
}