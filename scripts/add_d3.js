// D3 script to create an interactive bar chart for subway ridership by station

// Load the CSV data from the URL
d3.csv("https://raw.githubusercontent.com/sadavarterohit/mta-ridership/refs/heads/main/data/aggregated_data.csv").then(function(data) {
  // Parse the data to ensure numerical values are treated as numbers
  data.forEach(d => {
    d.ridership = +d.ridership;
  });

  // Extract unique line identifiers from the data
  const subwayLines = ['1','2','3','4','5','6','7','A','C','E','B','D','F','M','G','J','Z','L','N','Q','R','W'];
  const days = ['weekday', 'weekend'];

  // Set dimensions for the SVG container
  const margin = {top: 40, right: 20, bottom: 120, left: 60};
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create an SVG element and append it to the #plot div
  const svg = d3.select("#plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 40)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create checkboxes for subway lines and days with better styling
  const controls = d3.select("#plot")
    .append("div")
    .attr("class", "controls")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("gap", "20px");

  controls.append("h3").text("Filter by Line:").style("width", "100%");
  subwayLines.forEach(line => {
    controls.append("label")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-right", "10px")
      .html(`<input type="checkbox" class="line-checkbox" value="${line}" checked> <span style="margin-left: 5px;">Line ${line}</span>`);
  });

  controls.append("h3").text("Filter by Day:").style("width", "100%");
  days.forEach(day => {
    controls.append("label")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-right", "10px")
      .html(`<input type="checkbox" class="day-checkbox" value="${day}" checked> <span style="margin-left: 5px;">${day.charAt(0).toUpperCase() + day.slice(1)}</span>`);
  });

  // Create scales for the X and Y axes
  const xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .range([height, 0]);

  // Create axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);

  svg.append("g")
    .attr("class", "y-axis");

  // Function to update the chart based on checkbox selections
  function updateChart() {
    const selectedLines = Array.from(document.querySelectorAll('.line-checkbox:checked')).map(input => input.value);
    const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(input => input.value);

    const filteredData = data.filter(d => {
      return selectedDays.includes(d.day_type) && selectedLines.some(line => d.lines.includes(line));
    });

    let maxRidershipByStation = d3.rollups(filteredData, v => d3.max(v, d => d.ridership), d => d.station_complex);

    // Sort and take top 10 stations by ridership
    maxRidershipByStation = maxRidershipByStation.sort((a, b) => b[1] - a[1]).slice(0, 10);

    xScale.domain(maxRidershipByStation.map(d => d[0]));
    yScale.domain([0, d3.max(maxRidershipByStation, d => d[1])]);

    // Join the data to the bars
    const bars = svg.selectAll(".bar")
      .data(maxRidershipByStation, d => d[0]);

    // Remove bars that no longer exist
    bars.exit().remove();

    // Update existing bars
    bars
      .transition().duration(500)
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d[1]));

    // Add new bars
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d[1]))
      .attr("fill", "steelblue");

    // Update the axes
    svg.select(".x-axis")
      .transition().duration(500)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)");

    svg.select(".y-axis")
      .transition().duration(500)
      .call(yAxis);
  }

  // Initial render
  updateChart();

  // Add event listeners for checkboxes
  d3.selectAll(".line-checkbox").on("change", updateChart);
  d3.selectAll(".day-checkbox").on("change", updateChart);
});
