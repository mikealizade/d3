var weightTracker = {} || weightTracker;

weightTracker = (function(){

    var data = [],
        countries = [],
        trackerObj,
        margin = {top : 40, bottom : 40, left : 40, right: 40},
        w = 700,
        h = 400,
        svg, yScale, xScale;

    function initialise(){

        $.getJSON('weight-tracker.json', function (json) {

            trackerObj = json;
            //countries = Object.keys(trackerObj);

            for(var weight in trackerObj){
                if(trackerObj.hasOwnProperty(weight)){
                    data.push(trackerObj[weight]);
                }
            }

            console.log(data)

            //initChart(type);
        })
    }

    function initChart(){

        /*var xAxis, yAxis, yScale, text ;

        svg = d3.select('#chart').append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)

        yScale = d3.scale.linear().domain([0, d3.max(data)]).range([0, h]);
        xScale = d3.scale.ordinal().domain(data).rangeBands([0, w], .05, 0);
        zScale = d3.scale.ordinal().domain(countries).rangeBands([0, w], .05, 0);

        xAxis = d3.svg.axis()
            .scale(zScale)
            .orient('bottom')
            .ticks(5)
            .innerTickSize(6)
            *//*.outerTickSize(12)*//*
            .tickPadding(4);

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d){
                return xScale(d);
            })
            .attr('y', function(d){
                return 300 - yScale(d);
            })
            .attr('width', xScale.rangeBand())
            .attr('height', function(d){
                return yScale(d);
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        text = svg.selectAll("text")
            .data(data)
            .enter()
            .append("text");

        text.attr('x', function(d){
            return xScale(d) + xScale.rangeBand() - (xScale.rangeBand() * .05);
        })
            .attr('y', function(d){
                return 370 - yScale(d);
            })
            .text( function (d) { return d; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "#fff");

        svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(40, '+ (h + 50) + ')')
            .call(xAxis);*/

        /*yScale = d3.scale.linear()
         .domain([0, d3.max(data)])
         .range([h, 0]);

         yAxis = d3.svg.axis()
         .scale(yScale)
         .orient('left');

         svg.append('g')
         .attr('class', 'yaxis')
         .attr('transform', 'translate(30, 40)')
         .call(yAxis);*/

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

    initialise('nuclear weapons');

})();