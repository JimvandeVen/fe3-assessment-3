/* =============== MAPBOX =============== */
mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vyc3RtYW4iLCJhIjoiY2o4dTQ5bWZtMGtyeDJ3cDJ3MHdrNDExZCJ9.keSrDMvzb2kZDa9Q-tTZ6w';
var map = new mapboxgl.Map({
    container: 'map', //Container ID
    style: 'mapbox://styles/kerstman/cj8wvl6ky001y2smzy61smebl', //Mapbox style
	// style: 'mapbox://styles/mapbox/satellite-v9', //Mapbox style
    center: [4.899431, 52.379189], //Starting point (long, lat)
    zoom: 11, //Zoom level for Mapbox
    interactive: false //Remove all the interaction (zooming and dragging)
});

/* =============== VARIABLES MAP=============== */
var svgMap = d3.select(".svgMap"),
    dotColor = "orange"; //Dot color

var projection = d3.geoMercator()
    .scale(166000) //Zoom level for the d3 data
    .center([4.875231, 52.4257]); //Starting point (long, lat)

var path = d3.geoPath()
    .projection(projection);

var graticule = d3.geoGraticule();

var color = {
    bom: "#ff2e00",
    neergestort: "#051eff",
    overig: "#00ff0a",
    omgevingschade: "#ff00a1",
    mitrailleurvuur: "#ff8a00",
    luchtaanval: "#00f7ff"
};

/* =============== LOADING DATA =============== */
//Used a worldmap as reference to place data points on the map. The map itself is removed (wasn't needed)
d3.json("https://unpkg.com/world-atlas@1/world/50m.json", function(error, world) {
    if (error) throw error;

    //Load the data from data.csv
    d3.tsv("data.tsv", type, function(data) {

        /* =============== SORTING BY DATE =============== */
        //Chaning the date to a real date format
        data.forEach(function(d) {
            var dateString = d.Datum; //Date as dd/mm/yyyy
            var dateParts = dateString.split("/"); //Split the date into multiple parts
            var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); //Rebuild the date string to mm/dd/yyyy and convert it to a real date format
            d.Datum = dateObject; //Change the d.Datum to the real date format
        });

        //Sort the data by date (earliest to latest)
        data.sort(function(x, y) {
            return d3.ascending(x.Datum, y.Datum);
        });

        /* =============== CREATING NEW DATA VARIABLE FOR BAR CHART =============== */
        var years = ["1940", "1941", "1942", "1943", "1944", "1945"];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var dataMonthly = []; //Is used to store all the data from that month
        var dataMonthlyCopy = []; //Copy is later used to get the original dataMonthly values
        var monthNumber = 0;
        var yearNumber = 0;

        for (var i = 0; i < 72; i++) {
            var startDate = new Date("02/01/1940"); //The startDate holds the month where the loop starts filtering
            var nextMonth = new Date(startDate.setMonth(startDate.getMonth() + i)); //Each loop this variable goes to the next month
            var value = 0; //Set value to 0 as begin

            //Create an object in the array to store the monthy bombings under 'amount' with the month name included
            dataMonthly[i] = {
                date: months[monthNumber] + " " + years[yearNumber],
                amount: value
            };
            //Same here
            dataMonthlyCopy[i] = {
                date: months[monthNumber] + years[yearNumber],
                amount: value
            };

            data.forEach(function(d) {
                if (d.Datum < nextMonth) {
                    value++; //Add 1 to the amount each time a month meets the condition
                    dataMonthly[i].amount = value; //Store the value inside the object
                    dataMonthlyCopy[i].amount = value; //Same here
                }
            });

            monthNumber++;
            if (monthNumber == 12) {
                monthNumber = 0;
                yearNumber++;
            }
        }

        //Now we need to subtract the previous months amount from the current months amout so we get just the amout for that particular month, otherwise the amount is from the current month AND all previous months. Which is incorrect.
        for (i = 1; i < 72; i++) {
            var indexLower = i - 1; //Get a value 1 below the current index number
            dataMonthly[i].amount = dataMonthly[i].amount - dataMonthlyCopy[indexLower].amount; //This is where we need the copy of dataMonthly. Otherwise the previous months amount is already changed by this loop.
        }

        /* =============== CREATING SVG ELEMENTS MAP =============== */
        //Create a circle for each data point
        svgMap.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return d.projected[0]; //Use latitude as X-axis
            })
            .attr("cy", function(d) {
                return d.projected[1]; //Use longitude as Y-axis
            })
            .attr("type", function(d) { //Define type
                if (d.Soort.indexOf("Bom") >= 0) {
                    return "bom";
                } else if (d.Soort.indexOf("Luchtaanval") >= 0) {
                    return "luchtaanval";
                } else if (d.Soort.indexOf("Vliegtuig") >= 0) {
                    return "neergestort";
                } else if (d.Soort.indexOf("Mitrailleurvuur") >= 0) {
                    return "mitrailleurvuur";
                } else if (d.Soort.indexOf("Omgevingsschade") >= 0) {
                    return "omgevingschade";
                } else if (d.Soort.indexOf("Overig") >= 0) {
                    return "overig";
                } else { //In case some circles aren't categorised.
                    return "NON EXISTEND (I HOPE)";
                }
            })
			.attr("date", function(d) {return d.Datum;}) //Add date to circle
            .attr("r", "0") //Dot size
            .attr("opacity", "1") //Dot opacity
            .attr("fill", function(d) { //Dot color
                if (d.Soort.indexOf("Bom") >= 0) {
                    return color.bom;
                } else if (d.Soort.indexOf("Luchtaanval") >= 0) {
                    return color.luchtaanval;
                } else if (d.Soort.indexOf("Vliegtuig") >= 0) {
                    return color.neergestort;
                } else if (d.Soort.indexOf("Mitrailleurvuur") >= 0) {
                    return color.mitrailleurvuur;
                } else if (d.Soort.indexOf("Omgevingsschade") >= 0) {
                    return color.omgevingschade;
                } else if (d.Soort.indexOf("Overig") >= 0) {
                    return color.overig;
                } else { //In case some circles aren't categorised.
                    return "white";
                }
            })
            .attr("stroke-width", "0") //Stroke size
            .attr("stroke-opacity", "1") //Stroke opacity
            .attr("stroke", function(d) { //Stroke color
                if (d.Soort.indexOf("Bom") >= 0) {
                    return color.bom;
                } else if (d.Soort.indexOf("Luchtaanval") >= 0) {
                    return color.luchtaanval;
                } else if (d.Soort.indexOf("Vliegtuig") >= 0) {
                    return color.neergestort;
                } else if (d.Soort.indexOf("Mitrailleurvuur") >= 0) {
                    return color.mitrailleurvuur;
                } else if (d.Soort.indexOf("Omgevingsschade") >= 0) {
                    return color.omgevingschade;
                } else if (d.Soort.indexOf("Overig") >= 0) {
                    return color.overig;
                } else { //In case some circles aren't categorised.
                    return "white";
                }
            });

        /* =============== CREATING SVG ELEMENTS BAR CHART =============== */

        dataMonthly = dataMonthly.reverse(); //Reverse the order so 1940 is on top and 1945 at the bottom.

        var margin = {
                top: 0,
                right: 20,
                bottom: 0,
                left: 0
            },
            width = 200 - margin.left - margin.right,
            height = 960 - margin.top - margin.bottom;

		//Defining the tooltip
        var tooltip = d3.select(".left").append("div").attr("class", "monthlyValueTooltip");

        //Define how the scales will be visually used in the chart
        var y = d3.scaleBand()
            .range([height, 0]);

        var x = d3.scaleLinear()
            .range([0, width]);

		//Select the svg and add all the groups to it
        var svgBar = d3.select(".svgBar")
            .append("g");

        // Scale the range of the data in the domains
        x.domain([0, d3.max(dataMonthly, function(d) {
            return d.amount;
        })]);
        y.domain(dataMonthly.map(function(d) {
            return d.date;
        }));

        //Create all the bars used in the chart
        svgBar.selectAll(".bar")
            .data(dataMonthly)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("width", 0)
            .attr("y", function(d) {
                return y(d.date);
            })
            .attr("height", y.bandwidth())
			//Create an event on mousemove show the tooltip
            .on("mousemove", function(d) {
                tooltip
                    .style("top", d3.event.pageY + "px")
                    .style("display", "inline-block")
                    .html((d.date) + "<br>" + "Aantal inslagen: " + "<span style='font-weight: 600'>" + (d.amount) + "</span> 💥");
            })
			//Create an event, on hover show just the bombings from that month
			.on("mouseover", function(d) {
				var currentMonth = new Date(d.date); //Store the current date as a real date format in a variable
				var currentMonthSec = currentMonth.getTime(); //Covert the real data format to sec and store those in another variable (didn't work if I did it all in one go)

				var nextMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)); //Get the real data format of the currentMonth and add one month to it. Store this in a variable
				var nextMonthSec = nextMonth.getTime(); //Same here, convert the real data into seconds and store it again.

				var allCircles = document.querySelectorAll("circle"); //Select all the circles

				for (var i = 0; i < allCircles.length; i++) { //Loop as many times as there are circles
					var circleDate = allCircles[i].getAttribute("date"); //Store the attribute value inside a variable
					var circleRealDate = new Date(circleDate); //Convert the value to a real data format
					var circleRealDateSec = circleRealDate.getTime(); //Covert the real data format again to seconds.
	                if (circleRealDateSec > currentMonthSec && circleRealDateSec < nextMonthSec) { //Check for each circle if its date is inbetween the two dates of the bar
						//If it is, nothing will happen because we want to show those circles
	                }
					else {
						//If the circle doesn't match the condition (date within the month) than it gets hidden
						allCircles[i].classList.add("hide");
					}
	            }
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none"); //Hide the tooltip
				var allCircles = document.querySelectorAll("circle"); //Select all the circles
				for (var i = 0; i < allCircles.length; i++) { //Loop as many times as there are circles
					allCircles[i].classList.remove("hide"); //Show all the circles again
				}
            })
            .transition() //Animate the bars in
            .delay(5000) //The delay is so the circle animations can finish first (otherwise it's a bit chaostic)
            .duration(200)
            .ease(d3.easeCircleIn)
            .attr("width", function(d) {
                return x(d.amount);
            });

        /* ==================== BEGIN ANIMATION ==================== */
        var index = 1; //Index at 1 since you want to use the index in the selectAll section
        var totalCircles = svgMap.selectAll("circle").size() + 1; //Getting the total value of all the circles + 1 since the index is also 1 higher

        function loadingDots() { //Create a function
            setTimeout(function() { //Set a 1ms timeout after each loop
                svgMap.selectAll("circle:nth-child(" + index + ")") //Selecting the ..th number of circle based on the index number
                    //Grow the dots
                    .transition()
					.delay(1000)
                    .duration(200)
                    .attr("r", "2") //Dot size
                    //Expand the stroke to visualize an explosion
                    .ease(d3.easeCircleIn)
                    .attr("stroke-width", "50")
                    .attr("stroke-opacity", "0.2");

                index++; //Add one to the index number
                if (index < totalCircles) { //If the index number is higher than the total number of the cirles, stop
                    loadingDots(); //If not, run the loop again
                } else { //When all the circles are animated in, shrink them.
                    shrinkDot(); //Trigger the function
                }
            }, 1); //The 1ms timeout
        }

        loadingDots();

        //Shrinking all the dots after they are animated in so the map is clearer
        function shrinkDot() {
            svgMap.selectAll("circle")
                .transition()
                .delay(1500)
                .ease(d3.easeCircleOut)
                .duration(1000)
                .attr("stroke-width", "10");
        }

        /* ==================== TRIGGERS ==================== */
        d3.selectAll("circle").on('mouseover', showType); //Add an event trigger mouseover to all the created circles
        d3.selectAll("circle").on('mouseout', showAll); //Add an event trigger mouseover to all the created circles
		d3.selectAll("circle").on('click', showDetails); //Add an event trigger click to all the created circles
  		d3.select('input').on('change', showSatellite); //Add an event trigger to the checkbox
		d3.select('.fa-chevron-down').on('click', hideLegenda); //Add an event trigger to the chevron
		d3.select('.fa-chevron-up').on('click', showLegenda); //Add an event trigger to the chevron

        /* ==================== MOUSEOVER ==================== */
        function showType(d) {

            /* ==================== SHOW JUST THAT TYPE ==================== */
            var currentType = this.getAttribute("type");
            console.log(currentType);
            var allCircles = document.querySelectorAll("circle");

            for (var i = 0; i < allCircles.length; i++) {
                if (allCircles[i].getAttribute("type") !== currentType) {
                    allCircles[i].classList.add("hide");
                }
            }

            /* ==================== ADDRESS TOOLTIP ==================== */
            var addressTooltip = document.querySelector(".addressTooltip"); //Add the div to a variable
            addressTooltip.innerHTML = d.Adres; //Change the HTML to the address
            addressTooltip.style.top = this.getAttribute("cy") + "px"; //Set the y-axis value to the one the datapoint is using. With CSS the tooltip gets moved to the center / top.
            addressTooltip.style.left = this.getAttribute("cx") + "px"; //Set the x-axis value to the one the datapoint is using. With CSS the tooltip gets moved to the center / top.
            addressTooltip.style.display = "block"; //Instead of opacity, this object needs to be completely gone otherwise it will interfere with the mouseover events.

			/* ==================== HIDE LEGENDA POINTS ==================== */
			var bomLegenda = document.querySelector(".bom");
			var neergestortLegenda = document.querySelector(".neergestort");
			var omgevingschadeLegenda = document.querySelector(".omgevingschade");
			var mitrailleurvuurLegenda = document.querySelector(".mitrailleurvuur");
			var luchtaanvalLegenda = document.querySelector(".luchtaanval");
			var overigLegenda = document.querySelector(".overig");

			if (currentType == "bom") {
				neergestortLegenda.classList.add("lowerOpacity");
				omgevingschadeLegenda.classList.add("lowerOpacity");
				mitrailleurvuurLegenda.classList.add("lowerOpacity");
				luchtaanvalLegenda.classList.add("lowerOpacity");
				overigLegenda.classList.add("lowerOpacity");
			}
			else if (currentType == "neergestort") {
				bomLegenda.classList.add("lowerOpacity");
				omgevingschadeLegenda.classList.add("lowerOpacity");
				mitrailleurvuurLegenda.classList.add("lowerOpacity");
				luchtaanvalLegenda.classList.add("lowerOpacity");
				overigLegenda.classList.add("lowerOpacity");
			}
			else if (currentType == "omgevingschade") {
				bomLegenda.classList.add("lowerOpacity");
				neergestortLegenda.classList.add("lowerOpacity");
				mitrailleurvuurLegenda.classList.add("lowerOpacity");
				luchtaanvalLegenda.classList.add("lowerOpacity");
				overigLegenda.classList.add("lowerOpacity");
			}
			else if (currentType == "mitrailleurvuur") {
				bomLegenda.classList.add("lowerOpacity");
				neergestortLegenda.classList.add("lowerOpacity");
				omgevingschadeLegenda.classList.add("lowerOpacity");
				luchtaanvalLegenda.classList.add("lowerOpacity");
				overigLegenda.classList.add("lowerOpacity");
			}
			else if (currentType == "luchtaanval") {
				bomLegenda.classList.add("lowerOpacity");
				neergestortLegenda.classList.add("lowerOpacity");
				omgevingschadeLegenda.classList.add("lowerOpacity");
				mitrailleurvuurLegenda.classList.add("lowerOpacity");
				overigLegenda.classList.add("lowerOpacity");
			}
			else if (currentType == "overig") {
				bomLegenda.classList.add("lowerOpacity");
				neergestortLegenda.classList.add("lowerOpacity");
				omgevingschadeLegenda.classList.add("lowerOpacity");
				mitrailleurvuurLegenda.classList.add("lowerOpacity");
				luchtaanvalLegenda.classList.add("lowerOpacity");
			}

        }

        /* ==================== MOUSEOUT ==================== */
        function showAll() {

            /* ==================== SHOW JUST THAT TYPE ==================== */
            var allCircles = document.querySelectorAll("circle");
            for (var i = 0; i < allCircles.length; i++) {
                allCircles[i].classList.remove("hide");
            }

            /* ==================== ADDRESS TOOLTIP ==================== */
            var addressTooltip = document.querySelector(".addressTooltip"); //Add the div to a variable
            addressTooltip.style.display = "none"; //Instead of opacity, this object needs to be completely gone otherwise it will interfere with the mouseover events.

			/* ==================== SHOW LEGENDA POINTS ==================== */
			var bomLegenda = document.querySelector(".bom");
			var neergestortLegenda = document.querySelector(".neergestort");
			var omgevingschadeLegenda = document.querySelector(".omgevingschade");
			var mitrailleurvuurLegenda = document.querySelector(".mitrailleurvuur");
			var luchtaanvalLegenda = document.querySelector(".luchtaanval");
			var overigLegenda = document.querySelector(".overig");

			bomLegenda.classList.remove("lowerOpacity");
			neergestortLegenda.classList.remove("lowerOpacity");
			omgevingschadeLegenda.classList.remove("lowerOpacity");
			mitrailleurvuurLegenda.classList.remove("lowerOpacity");
			luchtaanvalLegenda.classList.remove("lowerOpacity");
			overigLegenda.classList.remove("lowerOpacity");

        }

		/* ==================== CLICK ==================== */
        function showDetails(d) {
			var popup = document.querySelector(".popup");
			var address = document.querySelector(".address");
			var typeAnswer = document.querySelector(".typeAnswer");
			var dateAnswer = document.querySelector(".dateAnswer");
			var descriptionAnswer = document.querySelector(".descriptionAnswer");
			var dateNormal = d.Datum; //Store the date into a variable
			var formatTime = d3.timeFormat("%A - %d %B %Y"); //Reformat the date so it looks cleaner (Monday - 28 03 1940)
			var formattedDate = formatTime(dateNormal); //Store the reformatted date into another varible

            address.innerHTML = d.Adres; //Change the HTML to the address
			typeAnswer.innerHTML = d.Soort; //Change the HTML to the date
			dateAnswer.innerHTML = formattedDate; //Change the HTML to the reformatted date
			descriptionAnswer.innerHTML = d.Omschrijving; //Change the HTML to the description

			/* ==================== CHANGE THE COLOR OF THE CIRCLE BEFORE THE LOCATION ==================== */

			var currentType = this.getAttribute("type"); //Get the circles type attribute value and compare it against 6 strings
			if (currentType == "bom") {
				d3.selectAll(".typeIndicator")
					.style("background-color", "#ff2e00")
					.style("border", "10px solid rgba(255, 46, 0, 0.2)");
			} else if (currentType == "luchtaanval") {
				d3.selectAll(".typeIndicator")
					.style("background-color", "#00f7ff")
					.style("border", "10px solid rgba(0, 247, 255, 0.2)");
			} else if (currentType == "neergestort") {
				d3.selectAll(".typeIndicator")
					.style("background-color", "#051eff")
					.style("border", "10px solid rgba(5, 30, 255, 0.2)");
			} else if (currentType == "mitrailleurvuur") {
				d3.selectAll(".typeIndicator")
					.style("background-color", "#ff8a00")
					.style("border", "10px solid rgba(255, 138, 0, 0.2)");
			} else if (currentType == "omgevingschade") {
				d3.selectAll(".typeIndicator")
					.style("background-color", "#ff00a1")
					.style("border", "10px solid rgba(255, 0, 161, 0.2)");
			} else if (currentType == "overig") {
				d3.selectAll(".typeIndicator")
					.style("background-color", "#00ff0a")
					.style("border", "10px solid rgba(0, 255, 10, 0.2)");
			}

			/* ==================== POPUP ANIMATION ==================== */

			d3.selectAll(".popup")
				.style("display", "block") //Style is set to 'display: none' originally so it wont interfere with the mouseover events.
				.transition()
				.duration(300)
				.style("opacity", "1");

			//Add an event trigger click to hide the popup again
			d3.selectAll(".popup i").on('click', hideDetails);
        }

		function hideDetails() {
			var popup = document.querySelector(".popup"); //Add the div to a variable

			d3.selectAll(".popup")
				.transition()
				.duration(300)
				.style("opacity", "0")
				.transition()
				.delay(300)
				.style("display", "none"); //Instead of just opacity, this object needs to be completely gone otherwise it will interfere with the mouseover events.
        }

		function showSatellite() {
			var labelStatus = document.querySelector("input");
			if (labelStatus.checked == true) {
				map.remove();
				map = new mapboxgl.Map({
				    container: 'map', //Container ID
				    // style: 'mapbox://styles/kerstman/cj8wvl6ky001y2smzy61smebl', //Mapbox style
					style: 'mapbox://styles/mapbox/satellite-v9', //Mapbox style
				    center: [4.899431, 52.379189], //Starting point (long, lat)
				    zoom: 11, //Zoom level for Mapbox
				    interactive: false //Remove all the interaction (zooming and dragging)
				});

			}
			else {
				map.remove();
				map = new mapboxgl.Map({
				    container: 'map', //Container ID
				    style: 'mapbox://styles/kerstman/cj8wvl6ky001y2smzy61smebl', //Mapbox style
					// style: 'mapbox://styles/mapbox/satellite-v9', //Mapbox style
				    center: [4.899431, 52.379189], //Starting point (long, lat)
				    zoom: 11, //Zoom level for Mapbox
				    interactive: false //Remove all the interaction (zooming and dragging)
				});
			}
		}

		function hideLegenda() {
			var legendaChevronDown = document.querySelector(".fa-chevron-down");
			var legendaChevronUp = document.querySelector(".fa-chevron-up");
			var legenda = document.querySelector(".legenda");
			legendaChevronDown.classList.add("chevronHide");
			legendaChevronUp.classList.remove("chevronHide");
			legenda.classList.add("legendaClosed");
		}

		function showLegenda() {
			var legendaChevronDown = document.querySelector(".fa-chevron-down");
			var legendaChevronUp = document.querySelector(".fa-chevron-up");
			var legenda = document.querySelector(".legenda");
			legendaChevronDown.classList.remove("chevronHide");
			legendaChevronUp.classList.add("chevronHide");
			legenda.classList.remove("legendaClosed");
		}

    });
});

/* =============== END LOADING DATA =============== */
//Calculating the longitude and latitude
function type(d) {
    d.latitude = d.latitude.replace(',', '.'); //Replace the comma with a dot
    d.longitude = d.longitude.replace(',', '.'); //Replace the comma with a dot
    d.projected = projection([d.longitude, d.latitude]);
    return d;
}
