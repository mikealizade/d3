var weightTracker = {} || weightTracker;

weightTracker = (function(){

    var data = [],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        trackerObj,
        margin = {top : 20, bottom : 20, left : 40, right: 40},
        w = 800,
        h = areaHeight = 450,
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

        svg = d3.select('#chart')
            .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)

        path = svg.append('g')
            .attr('transform', 'translate(40, 0)')
            .append('path');

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

        /*svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(40," + h + ")")
            .call(xGridLine()
                .tickSize(-h, 0, 0)
                .tickFormat("")
        )*/

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

        /*line = d3.svg.line()
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
            .attr('fill', 'none');*/

        area = d3.svg.area()
            .interpolate('cardinal')
            .x(function(d, i) {
                return xScale(dates[i]);
            })
            .y0(function (d) {
                return areaHeight;
            })
            .y1(function(d, i) {
                return yScale(kgs[i]);
            });

        path
            .datum(data)
            .transition()
            .duration(450)
            .attr('d', area)
            .attr('stroke', '#1E8F27')
            //.attr('stroke-dasharray', '5, .5')
            .attr('stroke-width', 1)
            .attr('fill', 'rgba(30, 143, 39, .1)');

        /*xScale = d3.time.scale()
            .domain(d3.extent(dates))
            .range([0, w]);

        yScale = d3.scale.linear()
            .domain(d3.extent(kgs))
            .range([h, 0]);*//*

        var xCircleScale = d3.time.scale()
            .domain(d3.extent(dates))
            .range([0, w]);

        var yCircleScale = d3.scale.linear()
            .domain(d3.extent(kgs))
            .range([h, 0]);*/

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('transform', 'translate(40, 0)')
            .attr('class', 'bubble')
            .attr('cx', function (d, i) {
                return xScale(dates[i]);
            })
            .attr('cy', function (d, i) {
                return yScale(kgs[i]);
            })
            .attr('r', function (d) {
                return 4;
            })
            .on('mouseover', function (d, i) {
                d3.select(this).attr('r', 6);
                toggleToolTip(true, xScale(dates[i]), yScale(kgs[i]), dates[i], kgs[i])
                d3.select(this).classed('active', true);
            })
            .on('mouseout', function (d) {
                d3.select(this).attr('r', 4);
                toggleToolTip(false);
                d3.select(this).classed('active', false);
            })

        function toggleToolTip(b, x, y, date, weight){
            date = String(date).substr(4, 11);
            if(b){
                d3.select('#tooltip')
                    .attr('transform', 'translate(' + (x + 2) + ',' + (y - 60) + ')')
                    .classed('active', true);
                d3.select('.content text').remove();
                d3.select('.content text').remove();
                d3.select('.content').append('text').attr('class', 'date').text(date);
                d3.select('.content').append('text').attr('class', 'weight').attr('transform', 'translate(2,15)').text(weight + 'kg');
            } else {
                d3.select('#tooltip')
                    .classed('active', false);
            }
        }

        svg.append('g').attr('id', 'tooltip')
            .attr('transform', 'translate(-100,-100)')
            .attr('class', 'tip')
            //.append('rect')
            .append('path')
            .attr('d', 'm0.599,7.63212l0,0c0,-3.88229 3.68366,-7.03111 8.2341,-7.03111l3.74737,0l0,0l17.96502,0l33.68664,0c2.18143,0 4.27912,0.74442 5.8214,2.06035c1.54776,1.3196 2.41447,3.10877 2.41447,4.97076l0,17.57507l0,0l0,10.55119l0,0c0,3.88242 -3.68909,7.02756 -8.23587,7.02756l-20.84926,0.25302l-6.0818,8.34341l-5.68127,-8.48532l-22.7867,-0.11111c-4.55044,0 -8.2341,-3.14513 -8.2341,-7.02756l0,0l0,-10.55119l0,0c0,-5.85895 0,-11.71612 0,-17.57507z')
            /*.attr('filter', 'url(#dropshadow')*/

        d3.select('#tooltip')
            .append('g')
            .attr('class', 'content')
            .attr('transform', 'translate(36, 18)')


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