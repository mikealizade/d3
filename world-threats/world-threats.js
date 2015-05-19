var worldThreats = {} || worldThreats;

worldThreats = (function(){

    var data = [],
        countries = [],
        dangersObj,
        margin = {top : 40, bottom : 40, left : 40, right: 40},
        w = 800,
        h = 300,
        svg, yScale, xScale, xAxis, yAxis, text,
        threat = $('#danger').find('span');

    function initialise(type){

        $.getJSON('dangers.json', function (json) {

            dangersObj = json;
            countries = Object.keys(dangersObj);

            for(var country in dangersObj){
                if(dangersObj.hasOwnProperty(country)){
                    data.push(dangersObj[country][type]);
                }
            }

            initChart(type);
        })
    }

    function initChart(type){

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
            .tickPadding(4);

        svg.selectAll('rect')
            .call(buildChart);

        svg.selectAll('text')
            .call(initText);

        svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(40, '+ (h + 50) + ')')
            .call(xAxis);

        threat.text(type)
    }

    function buildChart(selection){
        selection
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d){
                return xScale(d);
            })
            .attr('y', function(d){
                return 300;
            })
            .attr('width', xScale.rangeBand())
            .attr('height', function(d){
                return 0;
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.selectAll('rect')
            .call(tweenBars)
    }

    function tweenBars(selection){
        selection
            .data(data)
            .transition()
            .duration(500)
            .attr('y', function(d){
                return 300 - yScale(d);
            })
            .attr('height', function(d){
                return yScale(d);
            });
    }

    function initText(selection){
        selection
            .data(data)
            .enter()
            .append("text")
            .attr('x', function(d){
                return xScale(d) + xScale.rangeBand() - (xScale.rangeBand() * .05);
            })
            .attr('y', function(d){
                return 370;
            })
            .text( function (d) {
                return d;
            })
            .attr('class', 'values')
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "#fff");

        svg.selectAll("text.values")
            .transition()
            .duration(500)
            .attr('y', function(d){
                return 370 - yScale(d);
            })
    }

    function update(type){
        data = [];

        $.getJSON('dangers.json', function (json) {
            dangersObj = json;
        });

        for(var country in dangersObj){
            data.push(dangersObj[country][type]);
        }

        yScale = d3.scale.linear().domain([0, d3.max(data)]).range([0, h]);

        svg.selectAll('rect')
            .call(tweenBars)

        svg.selectAll("text")
            .data(data)
            .transition()
            .duration(500)
            .attr('y', function(d){
                return 370 - yScale(d);
            })
            .text( function (d) { return d; })

        threat.text(type)
    }

    $('button').on('click', function() {
        update($(this).text());
    });

    initialise('nuclear weapons');

})();