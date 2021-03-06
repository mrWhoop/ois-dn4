var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function parseDateFunction(input) {
  var parts = input.split('T');
  var datum = parts[0].split('-');
  //var cas = parts[1].split(':');
  //return new Date(datum[0], datum[1]-1, datum[2]); // Note: months are 0-based
  return parts[0];
}

function preberiEHRodBolnika(EHR) {
	$("#graf").remove();

	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();
	var selectEH = $("#preberiObstojeciEHR").val();
	
	if (!ehrId || ehrId.trim().length == 0) {
		if (!selectEH || selectEH.trim().length == 0){
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
		}
		ehrId = selectEH;	
	}
	
	if (!ehrId || ehrId.trim().length == 0){
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
		/*		var spol = "moški";
				if(party.gender = "FEMALE"){
					spol="ženski";
				}*/
				$("#preberiSporocilo").html("<div class='text-left'>" +
											"<table class='table table-striped table-hover'>" +
											"<tr><td><b>Ime: </b></td>" + "<td>" + party.firstNames + "</td></tr>" + 
											"<tr><td><b>Priimek: </b></td>" + "<td>" + party.lastNames + "</td></tr>" + 
									/*		"<tr><td><b>Spol: </b></td>" + "<td>" + spol + "</td></tr>" + */
											"<tr><td><b>Datum rojstva: </b></td>" + "<td>" + parseDateFunction(party.dateOfBirth) + "</td></tr>" +
											
											"</table></div>");
				$("#meritveVitalnihZnakovEHRid").val(ehrId.toString());
				$("#preberiObstojeciEHR").val("");
				$("#preberiEHRid").val("");
				$("#rezultatMeritveVitalnihZnakov").html("");

			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}

function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();	

	$("#graf").remove();
	

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#preberiTipZaVitalneZnake").val();

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				if (tip == "visina") {
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "height",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum</th><th class='text-right'>Višina</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + parseDateFunction(res[i].time) + "</td><td class='text-right'>" + res[i].height + " " 	+ res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				} else if (tip == "telesna teža") {
					$("#preberiMeritveVitalnihZnakovSporocilo").html("");
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});					
				} else if (tip == "telesna teza AQL") {
					console.log(ehrId);
					var AQL="select t/data[at0002]/events[at0003]/time/value as time, t/data[at0002]/events[at0003]/data[at0001]/items[at0004, 'Body weight']/value as Body_weight, t/data[at0002]/events[at0003]/data[at0001]/items[at0004, 'Body weight']/value/units as Body_weight_units from EHR e[e/ehr_id/value='" + ehrId + "'] contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_weight.v1] order by t/data[at0002]/events[at0003]/time/value desc limit 10"
					$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	var results = "<table class='table table-striped table-hover'><tr><th>Datum</th><th class='text-right'>Telesna teža</th></tr>";
					    	if (res) {
					    		var rows = res.resultSet;
						        for (var i in rows) {
						            results += "<tr><td>" + parseDateFunction(rows[i].time) + "</td><td class='text-right'>" + rows[i].Body_weight.magnitude + " " 	+ rows[i].Body_weight_units + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}
				else if (tip == "ITM") {
					$("#preberiMeritveVitalnihZnakovSporocilo").html("");
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (resW) {
					    	/*-----*/
					    	$.ajax({
					    		url: baseUrl + "/view/" + ehrId + "/" + "height",
								type: 'GET',
					    		headers: {"Ehr-Session": sessionId},
					    		success: function(resH) {
					    			
					    			if (resW.length > 0 && resH.length > 0) {
								    	var results = "<table class='table table-striped table-hover'><tr><th>Datum</th><th class='text-right'>višina</th><th class='text-right'>teža</th><th class='text-right'>ITM</th><th class='text-right'>interpretacija</th></tr>";
								        
								        var rawData = new Array();

								        $.getJSON("ITM.json", function(ITMss) {
										
								        for (var i = 0; i < resW.length; i++) {
								        	var ITM = (resW[i].weight/(resH[i].height*resH[i].height/10000)).toFixed(1);
								        	
								        	var datum = parseDateFunction(resW[i].time);
								        	var detail = {"date":datum, 
								        				  "pct05": 17,
										   			      "pct25": 18.5,
													      "pct50": ITM,
													      "pct75": 30,
													      "pct95": 36};
													      
											rawData.push(detail);

								        	var ITMmsg = " ";
								        	for(var j = 0; j < 8; j++){
												if(ITM >= ITMss.ITMss[j].ITMs && ITM <= ITMss.ITMss[j].ITMz){
													ITMmsg ="<font style='font-size:15px'><span class='" + ITMss.ITMss[j].label + "'>" + ITMss.ITMss[j].msg + "</span>";
												}
											}
								        	
								            results += "<tr><td>" + parseDateFunction(resW[i].time) + "</td><td class='text-right'>" + resH[i].height +  " " + resH[i].unit + "</td><td class='text-right'>" + resW[i].weight + " " + resW[i].unit +"</td><td class='text-right'>" + ITM +"</td><td class='text-right'>" + ITMmsg +"</td>";
								        }
								        rawData.reverse();
								        console.log(data);
								        results += "</table>";
								        $("#rezultatMeritveVitalnihZnakov").append(results);
								        
								        var wdth = $("#rezultatMeritveVitalnihZnakov").width();
								      
							        	var parseDate  = d3.time.format('%Y-%m-%d').parse;
											
											  var data = rawData.map(function (d) {
											    return {
											      date:  parseDate(d.date),
											      pct05: d.pct05,
											      pct25: d.pct25,
											      pct50: d.pct50,
											      pct75: d.pct75,
											      pct95: d.pct95
											    };
											    
											  });
								
												makeChart(data,/* markers,*/ wdth, "#graph123");
								        	
								        });
								        
							    	} else {
							    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
							    	}
					    			
					    		}
					    	});
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				} 
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
}