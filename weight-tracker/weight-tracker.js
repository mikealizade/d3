var weightTracker = {} || weightTracker;

// daily calorie dial

weightTracker = (function(){

    var data = [],
        trackerObj,
        margin = {top : 90, bottom : 20, left : 40, right: 40},
        w = 600,
        h = 400,
        areaHeight = 400,
        svg,
        yScale, xScale, xAxis, yAxis, text, name, dates = [], kgs = [], lbs = [], line,
        weight, units, selectedUnit = 'kg', selectedYear;

    function initialise(selectedYear, b){
        dates = [];
        kgs = [];
        lbs = [];

        $.getJSON('weight-tracker.json', function (json) {

            trackerObj = json;
            name = trackerObj['name'];
            data = trackerObj[selectedYear];

            for(var i = 0, j = data.length; i < j; i++){
                if(data[i].date.substr(0, 4) === selectedYear) {
                    dates.push(parseDate(data[i].date));
                    kgs.push(data[i].kg);
                    //lbs.push((data[i].lb).toFixed(1));
                    lbs.push(data[i].lb);
                }
            }

            setUnit();
            initChart(b);
            toggleYAxes();
        })

    }

    function setUnit(){
        units = selectedUnit === 'kg' ? kgs : lbs;
    }

    function initChart(b){
        xScale = d3.time.scale()
            .domain(d3.extent(dates))
            .range([0, w]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(12)
            .innerTickSize(6)
            .outerTickSize(0)
            .tickPadding(4)
            .tickFormat(function(d) { return d3.time.format('%b')(new Date(d)); });

        yScale = d3.scale.linear()
            .domain(d3.extent(units))
            .range([h, 0]);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        if(!b){
            appendElements();
            setChart();
        }
        movePlots();
        tweenChart();
    }

    function appendElements(){
        svg = d3.select('#chart')
            .append('svg')
            .attr('id', '#svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)

        path = svg.append('g')
            .attr('id', 'path')
            .attr('transform', 'translate(40, 70)')
            .append('path')

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(40, '+ (h+70) + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis currentY')
            .attr('transform', 'translate(40, 70)')
            .call(yAxis);

        svg.append("g")
            .attr("class", "grid currentY")
            .attr("transform", "translate(40," + 70 + ")")
            .call(yGridLine()
                .tickSize(-w, 0, 0)
                .tickFormat("")
        );

        svg.append('g').attr('id', 'tooltip')
            .attr('transform', 'translate(-100,-100)')
            .attr('class', 'tip')
            .append('path')
            .attr('d', 'm1.74999,8.00043l0,0c0,-3.42177 3.56758,-6.19543 7.96823,-6.19543l3.62185,0l0,0l17.38534,0l32.59726,0c2.11353,0 4.14029,0.65274 5.63466,1.81467c1.49402,1.16192 2.33368,2.73772 2.33368,4.38076l0,15.4886l0,0l0,9.29327l0,0c0,3.42158 -3.56772,6.19535 -7.96834,6.19535l-32.59726,0l33.65634,-0.0432l-51.04168,0.0432l-3.62185,0c-4.40065,0 -7.96823,-2.77377 -7.96823,-6.19535l0,0l0,-9.29327l0,0l0,-15.4886z')
        /*.attr('filter', 'url(#dropshadow')*/

        d3.select('#tooltip')
            .append('g')
            .attr('class', 'content')
            .attr('transform', 'translate(36, 17)');

       d3.selectAll('.x .tick text').attr('transform', 'translate(25, 0)')

    }

    function setChart(){
        area = d3.svg.area()
            .interpolate('cardinal')
            .x(function(d, i) {
                return xScale(dates[i]);
            })
            .y0(function (d) {
                return areaHeight;
            })
            .y1(function(d, i) {
                return areaHeight;
            });

        path
            .datum(data)
            .attr('d', area)
            .attr('stroke', '#1E8F27')
            .attr('stroke-width', 1)
            .attr('fill', 'rgba(30, 143, 39, .1)');

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('transform', 'translate(40, 70)')
            .attr('class', 'bubble')
            .attr('cx', function (d, i) {
                return xScale(dates[i]);
            })
            .attr('cy', function (d, i) {
                return areaHeight;
            })
            .attr('r', function (d) {
                return 4;
            })
            .on('mouseover', function (d, i) {
                d3.select(this).attr('r', 6);
                d3.select(this).classed('active', true);
                yScale = d3.scale.linear()
                    .domain(d3.extent(units))
                    .range([h, 0]);
                toggleToolTip(true, xScale(dates[i]), yScale(units[i]), dates[i], units[i])
            })
            .on('mouseout', function (d) {
                d3.select(this).attr('r', 4);
                d3.select(this).classed('active', false);
                toggleToolTip(false);
            })
    }

    function tweenChart(){
        area = d3.svg.area()
            .interpolate('cardinal')
            .x(function(d, i) {
                return xScale(dates[i]);
            })
            .y0(function (d) {
                return areaHeight;
            })
            .y1(function(d, i) {
                return yScale(units[i]);
            });

        path
            .datum(data)
            .transition()
            .duration(400)
            .ease('exp')
            .attr('d', area)
            .attr('stroke', '#1E8F27')
            .attr('stroke-width', 1)
            .attr('fill', 'rgba(30, 143, 39, .1)');
    }

    function toggleYAxes(){
        d3.selectAll('.currentY').remove();

        yScale = d3.scale.linear()
            .domain(d3.extent(units))
            .range([h, 0]);

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        svg.append('g')
            .attr('class', 'y axis currentY')
            .attr('transform', 'translate(40, 70)')
            .call(yAxis);

        function yGridLine() {
            return d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(data.length)
        }

        d3.select('#path').append("g")
            .attr("class", "y grid currentY")
            .attr('id', '#grid')

            .call(yGridLine()
                .tickSize(-w, 0, 0)
                .tickFormat("")
        );

        $('.currentY').animate({'opacity' : 1}, 100)
    }

    function movePlots(){
        svg.selectAll('circle')
            .transition()
            .duration(400)
            .ease('exp')
            .attr('cx', function (d, i) {
                return xScale(dates[i]);
            })
            .attr('cy', function (d, i) {
                return yScale(units[i]);
            })
    }

    function parseDate(date){
        return d3.time.format("%Y%m%d").parse(date);
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

    function toggleToolTip(b, xVal, yVal, date, weight){
        date = String(date).substr(4, 11);
        if(b){
            d3.select('#tooltip')
                .attr('transform', 'translate(' + (xVal + 5) + ',' + (yVal + 20) + ')')
                .classed('active', true);

            d3.selectAll('.content text').remove();
            d3.select('.content').append('text').attr('class', 'date').text(date);
            d3.select('.content').append('text').attr('class', 'weight').attr('transform', 'translate(2,15)').text(weight + selectedUnit);
        } else {
            d3.select('#tooltip')
                .classed('active', false);
        }
    }

    $('.unit').on('click', function () {
        selectedUnit = this.id === 'kg' ? 'kg' : 'lb';
        setUnit();
        toggleYAxes();
    })

    $('.year').on('click', function () {
        selectedYear = this.id;
        initialise(selectedYear, true);
    })

    initialise('2014', false);

})();