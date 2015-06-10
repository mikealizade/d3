var calorieTracker = (function(d){

    var width = 400,
        height = 400,
        date = new Date(),
        month = date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1,
        today = String(parseDate(date.getFullYear() + '' + month + '' + date.getDate())).substr(4, 11),
        circ = 2 * Math.PI,
        centreX = width / 2,
        centreY = height / 2,
        svg = d3.select("#calories").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + centreX + "," + centreY + ")"),
        excessConsumed, caloriesBurned, currentConsumed, calsObj, dataTotalCals, dataCurrentConsumed,
        dataCaloriesBurned, dataExcessConsumed, dailyPermittedOffset, dailyCaloriesRemaining, caloriesRemaining;

    $.getJSON('weight-tracker.json', function (json) {
        calsObj = json;
        dataTotalCals = parseInt(calsObj['totalCalories']);
        dataCurrentConsumed = parseInt(calsObj['currentConsumed']);
        dataCaloriesBurned = parseInt(calsObj['caloriesBurned']);
        dataExcessConsumed = parseInt(calsObj['excessConsumed']);
        caloriesRemaining = (dataTotalCals + dataCaloriesBurned) - (dataCurrentConsumed + dataExcessConsumed);

        appendCaloriesText();
        instantiateChart();
    })

    function parseDate(date){
        return d3.time.format("%Y%m%d").parse(date);
    }

    function appendCaloriesText() {
        svg.append('text').attr('id', 'daily-permitted').attr('transform', 'translate(-10000,0)').text(dataTotalCals)
            .on('mouseover', function () {
                var offsetWidth = d.getElementById('daily-permitted-text').getBBox().width;
                d3.select('#daily-permitted-text').attr('transform', 'translate(' + (-offsetWidth/2) + ',-45)');
                d3.select('#daily-permitted-text').classed('visible', true);
            })
            .on('mouseout', function(){
                d3.select('#daily-permitted-text').classed('visible', false);
            });
        dailyPermittedOffset = d.getElementById('daily-permitted').getBBox();
        d3.select('#daily-permitted').attr('transform', 'translate(' + -(dailyPermittedOffset.width / 2) + ',0)');

        svg.append('text').attr('id', 'calories-remaining').attr('transform', 'translate(-10000,150)').text(caloriesRemaining)
            .on('mouseover', function () {
                var offsetWidth = d.getElementById('calories-remaining-text').getBBox().width;
                d3.select('#calories-remaining-text').attr('transform', 'translate(' + (-offsetWidth/2) + ',55)');
                d3.select('#calories-remaining-text').classed('visible', true);
            })
            .on('mouseout', function(){
                d3.select('#calories-remaining-text').classed('visible', false);
            });
        dailyCaloriesRemaining = d.getElementById('calories-remaining').getBBox();
        d3.select('#calories-remaining').attr('transform', 'translate(' + -(dailyCaloriesRemaining.width / 2) + ',35)');

        svg.append('text').attr('id', 'daily-permitted-text').attr('transform', 'translate(-10000,-45)').text('Daily calorie intake');
        svg.append('text').attr('id', 'calories-remaining-text').attr('transform', 'translate(-10000,60)').text('Remaining calories today');
        svg.append('text').attr('id', 'today').attr('class', 'info').attr('transform', 'translate(-10000,-135)').text(today);
        svg.append('text').attr('id', 'current-consumed').attr('class', 'info').attr('transform', 'translate(-10000,-120)').text('Calories consumed: ' + dataCurrentConsumed);
        svg.append('text').attr('id', 'calories-burned').attr('class', 'info').attr('transform', 'translate(-10000,-120)').text('Calories burned: ' + dataCaloriesBurned);
        svg.append('text').attr('id', 'excess-consumed').attr('class', 'info').attr('transform', 'translate(-10000,-120)').text('Excess calories: ' + dataExcessConsumed);
    }

    function CalorieTracker(id, totalCalories, consumed, innerRadius, outerRadius, bgColour, fgColour) {
        var instance = this;
        this.id = id;
        this.totalCalories = totalCalories;
        this.consumed = consumed;
        this.consumedAsPct = (this.consumed/this.totalCalories) * 100;
        this.ofCirc = (this.consumedAsPct/100) * circ;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.bgColour = bgColour;
        this.fgColour = fgColour;
        this.arc = d3.svg.arc().innerRadius(this.innerRadius).outerRadius(this.outerRadius).startAngle(0);

        this.bg = svg.append("path")
            .datum({endAngle: circ})
            .style("fill", this.bgColour)
            .attr("d", this.arc);

        this.fgColour = svg.append("path")
            .datum({endAngle: 0})
            .style("fill", this.fgColour)
            .attr("d", this.arc)
            .on('mouseover', function () {
                instance.offsetWidth = d.getElementById(instance.id).getBBox().width;
                d3.select('#' + instance.id).attr('transform', 'translate(' + ((width/2) - instance.offsetWidth - 20) + ',-160)');
                d3.select('#today').attr('transform', 'translate(' + ((width/2) - instance.offsetWidth - 20) + ',-175)');
                d3.select('#today').classed('visible', true);
                d3.select('#' + instance.id).classed('visible', true);
                d3.select('#more-data').remove();
            })
            .on('mouseout', function(){
                d3.selectAll('.info').classed('visible', false);
            });

        this.fgColour.transition()
            .duration(1300)
            .call(this.arcTween, this.ofCirc, instance);
    }

    CalorieTracker.prototype.arcTween = function(transition, newAngle, instance) {
        transition.attrTween("d", function (d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function (t) {
                d.endAngle = interpolate(t);
                return instance.arc(d);
            };
        });
    }

    function instantiateChart() {
        excessConsumed = new CalorieTracker('excess-consumed', dataTotalCals, dataExcessConsumed, 100, 115, '#fff', '#B5D498');
        caloriesBurned = new CalorieTracker('calories-burned', dataTotalCals, dataCaloriesBurned, 120, 135, '#fff', '#7FBB5B');
        currentConsumed = new CalorieTracker('current-consumed', dataTotalCals, dataCurrentConsumed, 140, 155, '#ddd', '#1E8F27');
    }

})(document)