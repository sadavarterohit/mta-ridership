// add your JavaScript/D3 to this file
// Parameters
const svg_w = 750;
const svg_h = 300;
const margin = {top: 60, right: 25, bottom: 40,
    left: 250};
const innerWidth = svg_w - margin.left - margin.right;
const innerHeight = svg_h - margin.top - margin.bottom;

// Add svg's for weekday and weekend
const svg_wd = d3.select("div#plot")
  .append("svg")
    .attr("id", "weekday-plot")
    .attr("width", svg_w)
    .attr("height", svg_h);
    
const svg_we = d3.select("div#plot")
  .append("svg")
    .attr("id", "weekend-plot")
    .attr("width", svg_w)
    .attr("height", svg_h);


// Add background rectangles
svg_wd.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg_w)
    .attr("height", svg_h)
    .attr("fill", "aliceblue");
    
svg_we.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg_w)
    .attr("height", svg_h)
    .attr("fill", "aliceblue");

const rowConverter = function (d) {
  return {
    station_complex: d.station_complex,
    month: d.month,
    ridership: +d.ridership
  }
};  

// Transition Parameters (milliseconds)
const delay = 800;
const transition_time = 400;

// Scale factor of ridership count
const ridership_scale = 1000000;

// Plotting code for weekday data
const wd_url = "https://raw.githubusercontent.com/sadavarterohit/mta-ridership/refs/heads/main/data/MTA_Stationwise_Monthly_Ridership_Weekday.csv"
d3.csv(wd_url, rowConverter)
  .then(function(data) {
    
    let filteredData = data.filter(d => d.month == "2020-07-01");
    const stations = d3.sort(filteredData.map(d => d.station_complex));
    
    const yScale = d3.scaleBand().domain(stations).range([innerHeight, 0]).paddingInner(.2);
    const xScale = d3.scaleLinear().domain([0, 3.5]).range([0, innerWidth]);
    
    const rects = svg_wd.append("g")
      .attr("id", "rects")
      .attr("transform", `translate (${margin.left}, ${margin.top})`);
    
    const bars = rects.selectAll("rect")
      .data(filteredData, d => d.station_complex);

    bars.enter()
      .append("rect")
       .attr("x", xScale(0))
       .attr("y", d => yScale(d.station_complex))
       .attr("width", d => xScale(d.ridership/ridership_scale))
       .attr("height", yScale.bandwidth())
       .attr("fill", "cornflowerblue");
       
    const xAxis = d3.axisBottom()
        .scale(xScale);

    const yAxis = d3.axisLeft()
        .scale(yScale);
        
    svg_wd.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate (${margin.left}, ${svg_h - margin.bottom})`)
        .call(xAxis);
        
    svg_wd.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", margin.left + innerWidth/2)
        .attr("y", svg_h - margin.bottom/4)
        .style("font-family", "sans-serif")
        .style("font-size", "11")
        .text("Ridership (in millions)");
        
    svg_wd.append("text")
        .attr("class", "title")
        .attr("text-anchor", "end")
        .attr("x", margin.left + innerWidth/2)
        .attr("y", margin.top/3)
        .style("font-family", "sans-serif")
        .style("font-size", "20")
        .style("font-weight", "bold")
        .text("Monthly Ridership on Weekdays");
        
    const dateText = svg_wd.append("text");
    dateText.attr("class", "date-label")
        .attr("text-anchor", "end")
        .attr("x", margin.left + innerWidth/3)
        .attr("y", 2*margin.top/3)
        .style("font-family", "sans-serif")
        .style("font-size", "14")
        .style("font-weight", "bold");

    svg_wd.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate (${margin.left}, ${margin.top})`)
        .call(yAxis);
        
     const currDate = new Date(2020, 7, 1, 12, 0, 0);
     const endDate = new Date(2024, 10, 1, 12, 0, 0);
     
     const formatTime = d3.utcFormat("%b %Y");
     
     dateText.text("Jul 2020");
     
     // Successively update the plot for each month
     setInterval(function() {
        if (currDate.getTime() < endDate.getTime()) {
          let dateString = currDate.toISOString().substring(0, 10);
          filteredData = data.filter(d => d.month == dateString);
          
          dateText.text(formatTime(currDate));
          
          rects.selectAll("rect")
           .data(filteredData, d => d.station_complex)
           .transition().duration(transition_time)
           .attr("x", xScale(0))
           .attr("y", d => yScale(d.station_complex))
           .attr("width", d => xScale(d.ridership/ridership_scale))
           .attr("height", yScale.bandwidth())
           .attr("fill", "cornflowerblue");
          
          currDate.setMonth(currDate.getMonth() + 1);
        }
     }, delay);


  })
  .catch(function(error) {
    console.error(error)
  })
  
// Plotting code for weekend data
const we_url = "https://raw.githubusercontent.com/sadavarterohit/mta-ridership/refs/heads/main/data/MTA_Stationwise_Monthly_Ridership_Weekend.csv"
d3.csv(we_url, rowConverter)
  .then(function(data) {
    
    let filteredData = data.filter(d => d.month == "2020-07-01");
    const stations = d3.sort(filteredData.map(d => d.station_complex));
    
    const yScale = d3.scaleBand().domain(stations).range([innerHeight, 0]).paddingInner(.2);
    const xScale = d3.scaleLinear().domain([0, 1.4]).range([0, innerWidth]);
    
    const rects = svg_we.append("g")
      .attr("id", "rects")
      .attr("transform", `translate (${margin.left}, ${margin.top})`);
    
    const bars = rects.selectAll("rect")
      .data(filteredData, d => d.station_complex);

    bars.enter()
      .append("rect")
       .attr("x", xScale(0))
       .attr("y", d => yScale(d.station_complex))
       .attr("width", d => xScale(d.ridership/1000000))
       .attr("height", yScale.bandwidth())
       .attr("fill", "cornflowerblue");
       
    const xAxis = d3.axisBottom()
        .scale(xScale);

    const yAxis = d3.axisLeft()
        .scale(yScale);
        
    svg_we.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate (${margin.left}, ${svg_h - margin.bottom})`)
        .call(xAxis);
        
    svg_we.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", margin.left + innerWidth/2)
        .attr("y", svg_h - margin.bottom/4)
        .style("font-family", "sans-serif")
        .style("font-size", "11")
        .text("Ridership (in millions)");
        
    svg_we.append("text")
        .attr("class", "title")
        .attr("text-anchor", "end")
        .attr("x", margin.left + innerWidth/2)
        .attr("y", margin.top/3)
        .style("font-family", "sans-serif")
        .style("font-size", "20")
        .style("font-weight", "bold")
        .text("Monthly Ridership on Weekends");
        
    const dateText = svg_we.append("text");
    dateText.attr("class", "date-label")
        .attr("text-anchor", "end")
        .attr("x", margin.left + innerWidth/3)
        .attr("y", 2*margin.top/3)
        .style("font-family", "sans-serif")
        .style("font-size", "14")
        .style("font-weight", "bold");

    svg_we.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate (${margin.left}, ${margin.top})`)
        .call(yAxis);
        
     const currDate = new Date(2020, 7, 1, 12, 0, 0);
     const endDate = new Date(2024, 10, 1, 12, 0, 0);
     
     const formatTime = d3.utcFormat("%b %Y");
     
     dateText.text("Jul 2020");
     
     // Successively update the plot for each month
     setInterval(function() {
        if (currDate.getTime() < endDate.getTime()) {
          let dateString = currDate.toISOString().substring(0, 10);
          filteredData = data.filter(d => d.month == dateString);
          
          dateText.text(formatTime(currDate));
          
          rects.selectAll("rect")
           .data(filteredData, d => d.station_complex)
           .transition().duration(transition_time)
           .attr("x", xScale(0))
           .attr("y", d => yScale(d.station_complex))
           .attr("width", d => xScale(d.ridership/1000000))
           .attr("height", yScale.bandwidth())
           .attr("fill", "cornflowerblue");
          
          currDate.setMonth(currDate.getMonth() + 1);
        }
     }, delay);
  })
  .catch(function(error) {
    console.error(error)
  })