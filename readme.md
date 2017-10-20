# **Assessment 3**

![][cover]

## **Github Page**
[Github Page](https://leonvanzijl.github.io/fe3-assessment-3/)

---

## **Background**
In this assignment I’ve created an interactive datavisualisation of the bombings on Amsterdam in World War II. I've used a map to present the geolocation of each bombing and a bar chart to show how many bombings each month occurred. Together with this you can click on each bombing to get some more information.

P.S. Some of the vocabulary could be quite sloppy at one point, my excuses in advance. Most of this is written after 1PM 🌚

---

**Steps**

1. "Searched the web" to find an interesting and fun dataset to play with.
2. After I found my dataset (WOII Bombings in Amsterdam). I sketched a couple of ideas on paper.
![][concept]
3. Then came the hard part. Because I knew I wanted to use longitude and latitude values I had to use an existing d3 visualisation. So I searched for a good one I could use. After a while I found: [`Invitations Links Map`](https://bl.ocks.org/curran/6567fb027971588bc779)
4. While this was a good start. I had to change the d3 version from 3 to 4 and I still wasn't happy with the map. It appeared to be stretched because it used an [`Equirectangular (Plate Carrée)`](https://bl.ocks.org/mbostock/3757119) map. So I found another one [`Patterson Cylindrical`](https://bl.ocks.org/mbostock/d4021aa4dccfd65edffd) and used that instead.
5. A bit later I also wasn't happy with the basic map I used. Since I wanted to show the bombings in Amsterdam, you had to see some details in the city. And this wasn't the case with the basic maps.
6. I decided to use Mapbox behind the `svg` object. Mapbox sits inside a HTML element and is easily configurable. I can even create my own visual style. And best of all, it stays high quality since it's all vector based. While Mapbox has some default styles, they have a lot of extra's stuff and I wanted something minimal. So I created a minimal dark style with a blueish tint and removed all the extra's (useless labels, etc..).
7. With the Mapbox behind the basic map I had to line the two up. Which was harder than I expected. The starting point of the d3 basic map wasn't equal to Mapbox, so I had to constantly increase and decrease the zoom level, x-axis and y-axis. In the end I also found out that the basic map was shorter than Mapbox. So I stretched the basic map, which meant the dots are also stretched, but I fixed that by using an ellipse instead of a circle. So I could make the ellipses flatter which appeared perfectly round because they get stretched.
```css
svg {
	transform-origin: 50% 50%;
	transform: scale(1,1.22);
}
```
8. Now I had the basics up and running. So I started to clean the code and place comments to fully understand everything that's happening.
9. Because I used a stretch css property on the svg, the strokes on all the ellipses were disconnected from the ellipse itself. So I needed to go a couple of steps back and remove the stretch property. So I had to find another map I could use. In the end I used [`Spherical Mercator`](https://bl.ocks.org/mbostock/3757132) from the [`list`](https://github.com/d3/d3-geo-projection) which was a perfect fit. This also meant I could use circles again instead of ellipses.
10. Until this point I still used just 5 data rows from the total dataset. Now was the moment to get the full dataset loaded into d3. For one I changed the filetype, because I'm using a .tsv instead of a .csv:
```javascript
	d3.tsv("data.tsv", type, function(data) {
```
11. I also needed to change the commas from the latitude and longitude values to dots:
```javascript
	//Calculating the longitude and latitude
	function type(d) {
	    d.LAT = d.LAT.replace(',', '.'); //Replace the comma with a dot
	    d.LNG = d.LNG.replace(',', '.'); //Replace the comma with a dot
	    d.projected = projection([d.LNG, d.LAT]);
	    return d;
	}
```
12. Then I decided to give all the different types of bombings a different color on the map. _This will be expanded later on (more types will be added and the colors will be changed)_
```javascript
	.attr("fill", function(d) {
		if (d.Soort.indexOf("granaat") >= 0) {
			return "blue";
		} else if (d.Soort.indexOf("Luchtaanval") >= 0) {
			return "red";
		} else {
			return dotColor;
		}
	}) //Dot color
```
13. I wanted to load in all the bombings one by one based on their date. Earliest to lastest. So I had to convert the date strings to real dates and sort them. BUT in The Netherlands we are using different date formats (dd/mm/yyyy) and javascript only recognises (mm/dd/yyyy). So I took the string apart and rebuild it the correct way.
```javascript
	//Chaning the date to a real date format
	data.forEach(function(d) {
		var dateString = d.Datum; //Date as dd/mm/yyyy
		var dateParts = dateString.split("/"); //Split the date into multiple parts
		var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); //Rebuild the date string to mm/dd/yyyy and convert it to a real date format
		d.Datum = dateObject; //Change the d.Datum to the real date format
	});

	//Sort the data by date (earliest to latest)
	data.sort(function(x, y){
		return d3.ascending(x.Datum, y.Datum);
	});
```
14. Alright. Now I need to load them in one by one. So I need a function with a delay.
```javascript
	var index = 1; //Index at 1 since you want to use the index in the selectAll section
	var totalCircles = svg.selectAll("circle").size() + 1; //Getting the total value of all the circles + 1 since the index is also 1 higher

	function loadingDots () { //Create a function
		setTimeout(function () { //Set a 1ms timeout after each loop
			svg.selectAll("circle:nth-child("+index+")") //Selecting the ..th number of circle based on the index number
				//Grow the dots
				.transition()
				.duration(200)
				.attr("r", "2") //Dot size
				//Expand the stroke to visualize an explosion
				.ease(d3.easeCircleIn)
				.attr("stroke-width", "50")
				.attr("stroke-opacity", "0.2");

			index++; //Add one to the index number
			if (index < totalCircles) { //If the index number is higher than the total number of the cirles, stop
				loadingDots(); //If not, run the loop again
			}
		}, 1); //The 1ms timeout
	}

	loadingDots();
```
15. Done that. Now I wanted to optimise the coloring so I could easily check out a couple of different variation. So I created an object with 6 colors connected to the different types of bombings.
```javascript
	var color = {
		bom: "#ff2e00",
		neergestort: "#051eff",
		overig: "#00ff0a",
		omgevingschade: "#ff00a1",
		mitrailleurvuur: "#ff8a00",
		luchtaanval: "#00f7ff"
	};
```
16. These were then used in the fill attr declarations for each circle
```javascript
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
		} else {
			return "white";
		}
	})
```
17. When you hover over a bombing I wanted to show just the bombings with the same type. And i thought it would be cool to animate them out (the non-matching bombings) one by one.
```javascript
	var i = 1; //  set your counter to 1

	function showType() { //  create a loop function

		check = 1;

		var currentType = this.getAttribute("type");
		var allCircles = document.querySelectorAll("circle");

		if (check == 1) {
			myLoop();
			check = 0;
		}

		function myLoop() {

			setTimeout(function() { //  call a 3s setTimeout when the loop is called

				console.log("yes");
				if (allCircles[i].getAttribute("type") !== currentType) {
					allCircles[i].classList.add("hide");
				}

				i++; //  increment the counter
				if (i < allCircles.length) { //  if the counter < 10, call the loop function
					myLoop(); //  ..  again which will trigger another
				} //  ..  setTimeout()
			}, 0.1);

		}

	}
```

18. In the end it worked but you can't get the timeout shorter than 1ms. So it took way too long for all the circles to be gone. So I went for a regular fade.
```javascript
	/* ==================== TRIGGER ==================== */

	d3.selectAll("circle").on('mouseover', showType); //Add an event trigger mouseover to all the created circles
	d3.selectAll("circle").on('mouseout', showAll); //Add an event trigger mouseover to all the created circles

	function showType() {
		var currentType = this.getAttribute("type");
		console.log(currentType);
		var allCircles = document.querySelectorAll("circle");

		for (var i = 0; i < allCircles.length; i++) {
			if (allCircles[i].getAttribute("type") !== currentType) {
				allCircles[i].classList.add("hide");
			}
		}
	}

	function showAll() {
		var allCircles = document.querySelectorAll("circle");
		for (var i = 0; i < allCircles.length; i++) {
			allCircles[i].classList.remove("hide");
		}
	}
```
19. Now I wanted to add a tooltip to the bombings so you can quickly check the address of the bombing. In my head the easiest way was to create a span, which would appear about the datapoint (when hovered) and show the address of the datapoint.
```html
	<div class="container">
		<span class="addressTooltip">Test</span>
		<svg class="svgMap" width="1100" height="960"></svg>
	</div>
```
20. Now I wanted to give the tooltip a nice transition when a datapoint gets hovered. But this meant when a datapoint wasn't hovered the tooltip had no opacity (0). But the tooltip would also float over the datapoints while being invisible. This meant the datapoints below the tooltip couldn't be interacted with. My solution was to give the tooltip a `display: none` when no datapoint gets hovered.
```css
	.addressTooltip {
		padding: 10px 20px;
		position: absolute;
		transform: translate(-50%, -130%);
		text-align: center;
		background: #21242a;
		color: #9aa6b1;
		border-radius: 5px;
		font-family: 'Open Sans', sans-serif;
		font-weight: 300;
		font-size: 14px;
		box-shadow: 0 10px 30px 0 rgba(0,0,0,0.4);
		display: none;
	}
```
21. Furthermore I changed the styling of the tooltip when a datapoint gets hovered. The `CSS tranform property` (see above) ensures that the tooltip gets positioned above the datapoint in the middle.
```javascript
	var addressTooltip = document.querySelector(".addressTooltip"); //Add the div to a variable
	addressTooltip.innerHTML = d.Adres; //Change the HTML to the address
	addressTooltip.style.top = this.getAttribute("cy") + "px"; //Set the y-axis value to the one the datapoint is using. With CSS the tooltip gets moved to the center / top.
	addressTooltip.style.left = this.getAttribute("cx") + "px"; //Set the x-axis value to the one the datapoint is using. With CSS the tooltip gets moved to the center / top.
	addressTooltip.style.display = "block"; //Instead of opacity, this object needs to be completely gone otherwise it will interfere with the mouseover events.
```

22. Alright. Now another big step. Creating a new bar chart from the same data. This meant I had to create a partially "new" dataset. Because the bar chart I wanted to make had to show all the months in between 1940 and 1945 showing the total amount of bombings each month. First I tried just creating a simple bar chart and editing the data in the dataset itself. This showed how I had to reorganise the data:

date | amount
--- | ---
January 1940 | 2
February 1940 | 5
March 1940 | 10
April 1940 | 3
May 1940 | 0
June 1940 | 7

23. Next I made one huge ass loop to loop through all the months in 6 years ( `6 * 12 = 72` )
```javascript
	for (var i = 0; i < 72; i++) {
	//All the code in here
	}
```

24. Before the loop I declared a couple of variable. One array to store all the date in called `dataMonthly`. I also copied this array to `dataMonthlyCopy` so I could use the values later on after the array `dataMonthly` itself is already changed. I also declared two other array with all the month names and the year number to properly name each array entry.
```javascript
	var years = ["1940", "1941", "1942", "1943", "1944", "1945"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dataMonthly = []; //Is used to store all the data from that month
    var dataMonthlyCopy = []; //Copy is later used to get the original dataMonthly values
    var monthNumber = 0;
    var yearNumber = 0;
```

25. In the loop I created one variable for the starting month and another variable going one month higher at each loop. There is also a variable `value` for the amount of bombings, which is set to 0 at the start.
```javascript
	var startDate = new Date("02/01/1940"); //The startDate holds the month where the loop starts filtering
	var nextMonth = new Date(startDate.setMonth(startDate.getMonth() + i)); //Each loop this variable goes to the next month
	var value = 0; //Set value to 0 as begin
```

26. Each loop a new array entry is created inside `dataMonthly` for each month in the 6 years. Obviously the same goes for the copied array. Which might make you wonder, why don't you just declare a new copy variable at the end and include the whole `dataMonthly` array in the new copy array. I couldn't. Because the changes to the `dataMonthly` array are happening before all of this. Kinda struggled with this, so this is what I came up with.
```javascript
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
```
27. Now I needed to check all the data if it falls between the currently active month. For some reason I couldn't just add multiple condition to an if statement (`if (d.Datum > currentMonth && d.Datum < nextMonth)`) So I add all the amounts of bombings BEFORE the `nextMonth` together. Which meant if `nextMonth` is `january 1941`, it would include all the amounts of all the months in 1940. We will sort this later on.
```javascript
	data.forEach(function(d) {
        if (d.Datum < nextMonth) {
            value++; //Add 1 to the amount each time a month meets the condition
            dataMonthly[i].amount = value; //Store the value inside the object
            dataMonthlyCopy[i].amount = value; //Same here
        }
    });
```

28. At the end of the loop we increase the `monthNumber` and `yearNumber` values if their conditions are met.
```javascript
	monthNumber++;
	if (monthNumber == 12) {
	    monthNumber = 0;
	    yearNumber++;
	}
```

29. Now we have a big ass array with all the months. But the amounts aren't correct yet. To fix this we need to subtract the previous months from the next month (if that makes any sense). So another loop which goes through all the months. In this month we are gonna use the `dataMonthlyCopy` variable. Because we need to get the value from the previous month to get the correct value of the current month. BUT we can't get the original value of the previous month if that months value is already changed. This is where we use `dataMonthlyCopy`.
```javascript
	for (i = 1; i < 72; i++) {
        var indexLower = i - 1; //Get a value 1 below the current index number
        dataMonthly[i].amount = dataMonthly[i].amount - dataMonthlyCopy[indexLower].amount; //This is where we need the copy of dataMonthly. Otherwise the previous months amount is already changed by this loop.
    }
```

30. Now it's just simply applying the new data to another svg bar chart and we got ourselves a second chart.
```javascript
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
```

31. Within this new bar chart I've also made a tooltip which appears when you hover the bars
```javascript
	svgBar.selectAll(".bar")
		//Create an event on mousemove show the tooltip
		.on("mousemove", function(d) {
			tooltip
				.style("top", d3.event.pageY + "px")
				.style("display", "inline-block")
				.html((d.date) + "<br>" + "Aantal inslagen: " + "<span style='font-weight: 600'>" + (d.amount) + "</span> 💥");
		})
		.on("mouseout", function(d) {
            tooltip.style("display", "none"); //Hide the tooltip
        })
```

32. And more importantly. I've managed to show just the bombings of the hovered bar. I added a mouseover event to all the bars. Then I stored the bar its date in `currentMonth` as a real date format. Except, like I said I couldn't add two conditions in an if statement with real data formats so I converted the real data format into seconds (amount of seconds from 1970) and stored it in `currentMonthSec`. I've also created a variable (`nextMonth`) which would store one month after `currentMonth`. This one also got converted to seconds and stored into `nextMonthSec`. I then made a loop to go through each circle and check the circles date to the two month variable `currentMonthSec` & `nextMonthSec`. If the condition is met, nothing happens. If not the circle will become hidden.
```javascript
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
```

33. Inside the mouseout event I added two lines to show each circle again when the mouse isn't hovering a bar
```javascript
	.on("mouseout", function(d) {
        tooltip.style("display", "none"); //Hide the tooltip
		var allCircles = document.querySelectorAll("circle"); //Select all the circles
		for (var i = 0; i < allCircles.length; i++) { //Loop as many times as there are circles
			allCircles[i].classList.remove("hide"); //Show all the circles again
		}
    })
```

34. The original dataset I got also included a description which I wanted to show. So I made a popup to show all the details of each bombing when the circle gets clicked. So I gave them a trigger.
```javascript
	d3.selectAll("circle").on('click', showDetails); //Add an event trigger click to all the created circles
```

35. This triggers an event which will change the inner HTML of all the elements to data taken from the dataset
```javascript
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
	}
```

36. I also thought it would be a nice detail to show the color of the type before the address. So within the event I'm checking the circle its type and based on that the color gets change accordingly.
```javascript
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
```

37. Lastly I gave the popup an fade-in and fade-out animation and gave the closing element a trigger so the popup can be closed again.
```javascript
	/* ==================== POPUP ANIMATION ==================== */

	d3.selectAll(".popup")
		.style("display", "block") //Style is set to 'display: none' originally so it wont interfere with the mouseover events.
		.transition()
		.duration(300)
		.style("opacity", "1");

	//Add an event trigger click to hide the popup again
	d3.selectAll(".popup i").on('click', hideDetails);
```

38. The closing element triggers a simple event which closes the popup with a fade-out animation and after 300ms changed the style to `display: none` so I wont interfere with other mouseover events.
```javascript
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
```

39. Alright, last thing I need is a legend. Quite easily I made a legend from HTML & CSS.
```html
	<div class="legenda">
		<h1>Legenda</h1>
		<i class="fa fa-chevron-down" aria-hidden="true"></i>
		<i class="fa fa-chevron-up chevronHide" aria-hidden="true"></i>
		<div class="bom typeLegenda">
			<div class="typeIndicatorLegenda"></div>
			<span>Bom, granaat, afweergeschut</span>
		</div>
		<div class="neergestort typeLegenda">
			<div class="typeIndicatorLegenda"></div>
			<span>Vliegtuig(onderdeel) neergestort</span>
		</div>
		<div class="omgevingschade typeLegenda">
			<div class="typeIndicatorLegenda"></div>
			<span>Omgevingsschade</span>
		</div>
		<div class="mitrailleurvuur typeLegenda">
			<div class="typeIndicatorLegenda"></div>
			<span>Mitrailleurvuur</span>
		</div>
		<div class="luchtaanval typeLegenda">
			<div class="typeIndicatorLegenda"></div>
			<span>Luchtaanval</span>
		</div>
		<div class="overig typeLegenda">
			<div class="typeIndicatorLegenda"></div>
			<span>Overig</span>
		</div>
		<label style="left: 16px; top: 16px;"><input type="checkbox"> Satellietbeelden</label>
	</div>
```
```css
	/* ==================== LEGENDA ==================== */

	.legenda {
		height: 230px;
		width: 250px;
	    padding: 40px;
	    position: absolute;
	    right: 20px;
	    bottom: 20px;
	    /* transform: translate(-50%, -50%); */
	    background: #2F343D;
	    color: #9aa6b1;
	    border-radius: 5px;
	    font-family: 'Open Sans', sans-serif;
	    font-weight: 300;
	    font-size: 14px;
	    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.4);
		overflow: hidden;
		transition: all 300ms;
	}

	.legendaClosed {
		height: 0;
	}

	.legenda h1 {
		color: #9aa6b1;
	    font-family: 'Open Sans', sans-serif;
	    font-weight: 600;
	    font-size: 16px;
	    margin: -9px 0 25px 0;
	}

	.legenda .typeLegenda {
		float: left;
		width: 100%;
		margin-bottom: 10px;
	}

	.typeIndicatorLegenda {
	    width: 5px;
	    height: 5px;
	    border-radius: 20px;
	    display: inline-block;
	    float: left;
	    -webkit-background-clip: padding-box;
	    background-clip: padding-box;
	    margin: 2px 10px 0 0;
	}

	.bom .typeIndicatorLegenda {
	    background-color: #ff2e00;
	    border: 5px solid rgba(255, 46, 0, 0.2);
	}

	.neergestort .typeIndicatorLegenda {
	    background-color: #051eff;
	    border: 5px solid rgba(5, 30, 255, 0.2);
	}

	.omgevingschade .typeIndicatorLegenda {
	    background-color: #ff00a1;
	    border: 5px solid rgba(255, 0, 161, 0.2);
	}

	.mitrailleurvuur .typeIndicatorLegenda {
	    background-color: #ff8a00;
	    border: 5px solid rgba(255, 138, 0, 0.2);
	}

	.luchtaanval .typeIndicatorLegenda {
	    background-color: #00f7ff;
	    border: 5px solid rgba(0, 247, 255, 0.2);
	}

	.overig .typeIndicatorLegenda {
	    background-color: #00ff0a;
	    border: 5px solid rgba(0, 255, 10, 0.2);
	}

	.lowerOpacity {
	    transition: opacity 300ms;
	    opacity: 0.5 !important;
	}

	.legenda i {
		position: absolute;
		top: 35px;
		right: 35px;
		cursor: pointer;
		color: #1B1D20;
		transition: all 300ms;
	}

	.legenda i:hover {
		color: #9AA6B0;
	}

	.chevronHide {
		display: none !important;
	}
```

40. With events I gave the legend and hidden en shown state. The event were connected to the chevrons.
```javascript
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
```

41. I thought it would be a nice extra touch to highlight the hovered type inside the legend itself. So when a circle is hovered, all the legend labels with not the same type will be faded out.
```javascript
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
```

42. At last, I made a checkbox inside the legend to change the maps style.
```javascript
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
```

43. And that's it!

---

## **Ideas (I would've included if I sold my soul and got a timemachine in return)**
1. Planes flying over for the 14 airstrikes, each plane representing an airstrike.
2. Being able to change the map style.
3. Legenda
4. Pie chart included in the details of each bombing (the pie chart would show which type of bombings are occurred the most)
5. General info popup about the dataset

---

## **Data**
The dataset is about the WOII bombings in Amsterdam. Each bombing is registered and categorised. In total there are 507 bombings inside the dataset. Interestingly enough the ID number goes from 368 directly to 384. Are 15 of them removed? So the Last ID would show 523 while there are just 504 bombings.

| ID | Adres | Soort | Datum | Omschrijving | Foto | COORDS | longitude | latitude |
|----|--------------------------------------------------|----------------------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|---------------------------|-----------|-----------|
| 1 | De Kempenaerstraat 3 | Bom, granaat, afweergeschut | 03/05/1943 | 1 niet-ontplofte bom. Op 7 mei opgeruimd |  | POINT(4.869362 52.382008) | 4,869362 | 52,382008 |
| 2 | Klaprozenweg 71 | Bom, granaat, afweergeschut | 03/05/1943 | 7 bommen. Wegdek beschadigd |  | POINT(4.900234 52.400869) | 4,900234 | 52,400869 |
| 3 | Nassaukade 72 | Bom, granaat, afweergeschut | 03/05/1943 | Getroffen door niet-ontplofte granaat van het afweergeschut |  | POINT(4.87647 52.376979) | 4,87647 | 52,376979 |
| 4 | Orteliusstraat 303/hs | Vliegtuig(onderdeel) neergestort | 04/05/1943 | Onderdelen van een Engels vliegtuig neergekomen |  | POINT(4.84747 52.37304) | 4,84747 | 52,37304 |
| 5 | Oostzanerdijk 180 | Bom, granaat, afweergeschut | 05/05/1943 | 2 cm granaat van het luchtdoelgeschut gevonden |  | POINT(4.86458 52.430169) | 4,86458 | 52,430169 |
| 6 | Archimedesweg 89 | Overig | 13/05/1943 | Lichtkogel door het dak geslagen. Gat in het dak.  Geen persoonlijke ongelukken |  | POINT(4.940452 52.355389) | 4,940452 | 52,355389 |
| 7 | Valentijnkade 31/III | Overig | 13/05/1943 | Vermoedelijk een onderdeel van een landingsgestel door het dak geslagen en op het portaal terechtgekomen. Plafond beschadigd. Geen persoonlijke ongelukken |  | POINT(4.940346 52.35866) | 4,940346 | 52,35866 |
| 8 | Eerste van Swindenstraat 1/hs | Bom, granaat, afweergeschut | 13/05/1943 | [Granaat?]scherf. Spiegelruit totaal vernield |  | POINT(4.924484 52.362212) | 4,924484 | 52,362212 |
| 9 | Durgerdammerdijk 30 | Vliegtuig(onderdeel) neergestort | 13/05/1943 | Stuk van een vliegtuig gevonden. meerdere stukken liggen nog in de omgeving |  | POINT(4.985874 52.375746) | 4,985874 | 52,375746 |
| 10 | Zuiderzeepark 100 | Bom, granaat, afweergeschut | 13/05/1943 | Enkele brandbommen en delen van een vliegtuig neergekomen. 4 lijken van Engelse vliegeniers |  | POINT(4.955362 52.387511) | 4,955362 | 52,387511 |
| 11 | Koenenkade 8 | Overig | 16/05/1943 | 2 tijdmijnen gevonden. `Tijdstip afwerpen niet bekend, direct gevaar niet aanwezig. De afzetting van de toegang tot het Boschplan is door de politie in overleg met de Duitsche Weermacht geregeld.` |  | POINT(4.852352 52.331009) | 4,852352 | 52,331009 |
| 12 | Trompenburgstraat 36/III | Bom, granaat, afweergeschut | 17/05/1943 | Bomsplinter. De heer Heiman Content door een bomsplinter in zijn woning gedood |  | POINT(4.905509 52.343981) | 4,905509 | 52,343981 |
| 13 | Orteliuskade 18 | Bom, granaat, afweergeschut | 12/06/1943 | Granaat van het luchtdoelgeschut door het dak geslagen en in het trappenhuis geëxplodeerd. Ernstige schade aan trappenhuis, meubilair en muren. Geen persoonlijke ongelukken en geen brand |  | POINT(4.8503 52.36606) | 4,8503 | 52,36606 |
| 14 | Meeuwenlaan 60 | Bom, granaat, afweergeschut | 12/06/1943 | Granaat van het afweergeschut neergekomen en ontploft. Schade aan verschillende gebouwen van de ADM. `in totaal zijn 230 ruiten gesprongen, 16 deuren en een groot aantal verduisteringsgordijnen vernield. De totale schade wordt op plm. f. 10.000,- geraamd.` |  | POINT(4.916883 52.384058) | 4,916883 | 52,384058 |
| 15 | Van Eeghenlaan 35 | Bom, granaat, afweergeschut | 16/06/1943 | Niet-ontplofte granaat van het luchtdoelgeschut ingeslagen. Aanzienlijke schade aan het dak, de tweede verdieping en het meubilair |  | POINT(4.874104 52.358023) | 4,874104 | 52,358023 |
| 16 | Prins hendrikkade 108 | Overig | 19/06/1943 | Glazen bolletje gevuld met fosfor (inhoud 200 ? 300 cm3) neergekomen. Kleine brand, direct geblust |  | POINT(4.903884 52.37464) | 4,903884 | 52,37464 |
| 17 | Geldersekade 19 | Overig | 19/06/1943 | Glazen bolletje gevuld met fosfor (inhoud 200 ? 300 cm3) neergekomen |  | POINT(4.902538 52.375534) | 4,902538 | 52,375534 |
| 18 | Van Oldenbarneveldtstraat 34/I | Overig | 19/06/1943 | Glazen bolletjes gevuld met fosfor (inhoud 200 ? 300 cm3) neergekomen? |  | POINT(4.87508 52.376524) | 4,87508 | 52,376524 |
| 19 | Jan van Galenstraat 4 | Overig | 19/06/1943 | 4 glazen bolletjes gevuld met fosfor (inhoud 200 ? 300 cm3) neergekomen |  | POINT(4.867491 52.376248) | 4,867491 | 52,376248 |
| 20 | Van der Pekstraat 47, 49, 51, 53, 55, 57, 42, 44 | Omgevingsschade | 17/07/1943 | Van der Pekstraat 47, 49, 51, 53, 55, 57, 42, 44 volkomen vernietigd, alle nummers (even en oneven) zware glas- en dakschade | 010003049123.jpg | POINT(4.909067 52.388403) | 4,909067 | 52,388403 |

---

## **Features**
1. `d3-Domain` - Setting the data
2. [`d3-Scale`](https://github.com/d3/d3-scale) - Position encodings
3. [`d3-Transition`](https://github.com/d3/d3-transition) - Animating elements
4. [`d3-Axis`](https://github.com/d3/d3-axis) - Axes
5. [`d3-Sort`](https://stackoverflow.com/questions/25168086/sorting-objects-based-on-property-value-in-d3) - Sorting the string
6. [`d3-Geo`](https://github.com/d3/d3/blob/master/API.md#geographies-d3-geo) - Used for map projections
7. [`Mapbox`](https://www.mapbox.com/api-documentation/?language=JavaScript#introduction)
8. [`Array-Slice`](https://www.w3schools.com/jsref/jsref_slice_array.asp) - Using parts of the array
9. [`Match()`](https://www.w3schools.com/jsref/jsref_match.asp) - Check if a string matches something
10. [`Reverse()`](https://www.w3schools.com/jsref/jsref_reverse.asp)

---

## **License**
MIT © Leon van Zijl

---

## **Sources**
1. [`Patterson Cylindrical`](https://bl.ocks.org/mbostock/d4021aa4dccfd65edffd) - A basic, non stretched map
2. [`Mapbox`](https://www.mapbox.com/mapbox-gl-js/examples/) - Displaying the Mapbox inside a HTML element
3. [`Invitations Links Map`](https://bl.ocks.org/curran/6567fb027971588bc779) - Getting dots to show from a .csv file
4. [`Dataset`](https://data.amsterdam.nl/#/?dte=catalogus%2Fapi%2F3%2Faction%2Fpackage_show%3Fid%3De2e2104c-788c-488d-b20d-ff4721d1724a&dtfs=T&mpb=topografie&mpz=11&mpv=52.3731081:4.8932945) - The dataset this visualisation is based on

[cover]: preview.png
[concept]: concept.jpp
