var weightTracker = {} || weightTracker;

weightTracker = (function(){

    var data = [],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        trackerObj,
        margin = {top : 20, bottom : 20, left : 40, right: 40},
        w = 800,
        h = 450,
        svg, yScale, xScale, xAxis, yAxis, text, name, dates = [], kgs = [], lbs = [], line;

    function parseDate(date){
        return d3.time.format("%Y%m%d").parse(date);
    }

    function initialise(){

        $.getJSON('weight-tracker.json', function (json) {

            trackerObj = json;
            name = trackerObj['name'];
            data = trackerObj['data'];

            for(var i = 0, j = data.length; i < j; i++){
              dates.push(parseDate(data[i].date));
               kgs.push(data[i].kg);
               lbs.push(data[i].lb);
            }

            console.log(kgs)

            initChart();
        })
    }

    function xGridLine() {
        return d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(data.length)
    }

    function yGridLine() {
        return d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(data.length)
    }

    function initChart(){

        svg = d3.select('#chart').append('svg').attr('width', w + margin.left + margin.right).attr('height', h + margin.top + margin.bottom)
        path = svg.append('g').attr('transform', 'translate(40, 0)').append('path');

        xScale = d3.time.scale()
            .domain(d3.extent(dates))
            .range([0, w]);

        yScale = d3.scale.linear()
            .domain(d3.extent(kgs))
            .range([h, 0]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(12)
            .innerTickSize(6)
            .outerTickSize(0)
            .tickPadding(4);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(40," + h + ")")
            .call(xGridLine()
                .tickSize(-h, 0, 0)
                .tickFormat("")
        )

        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(40," + 0 + ")")
            .call(yGridLine()
                .tickSize(-w, 0, 0)
                .tickFormat("")
        )

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(40, '+ (h) + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(40, 0)')
            .call(yAxis);

        line = d3.svg.line()
            .x(function(d, i) {
                return xScale(dates[i]);
            })
            .y(function(d, i) {
                return yScale(kgs[i]);
            })
            .interpolate('linear');

        path
            .datum(data)
            .transition()
            .duration(450)
            .attr('d', line)
            .attr('stroke', '#1E8F27')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

    }

    /*function update(type){

        var newtext;
        data = [];

        $.getJSON('dangers.json', function (json) {
            trackerObj = json;
        });

        for(var country in trackerObj){
            data.push(trackerObj[country][type]);
        }

        yScale = d3.scale.linear().domain([0, d3.max(data)]).range([0, h]);

        svg.selectAll('rect')
            .data(data)
            .transition()
            .duration(500)
            .attr('y', function(d){
                return 300 - yScale(d);
            })
            .attr('height', function(d){
                return yScale(d);
            })

        newtext = svg.selectAll("text")
            .data(data)
            .transition()
            .duration(500)

        newtext.attr('y', function(d){
            return 370 - yScale(d);
        })
            .text( function (d) { return d; })

        threat.text(type)
    }*/

    initialise();

})();