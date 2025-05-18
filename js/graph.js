export class Graph {
  constructor(width = 400, height = 250) {
    this.width = width;
    this.height = height;
    this.svgNS = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(this.svgNS, 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.svg.style.overflow = 'visible';
    this.svg.style.transition = 'opacity 0.5s ease-in';
    this.svg.style.opacity = '0';
    this.svg.classList.add('w-full', 'h-full');
    
    // Create a resize observer to handle container size changes
    this.resizeObserver = null;
  }

  render() {
    requestAnimationFrame(() => {
      this.svg.classList.add('loaded');
      this.svg.style.opacity = '1';
    });
    return this.svg;
  }
  
  // Method to make the graph responsive to container size changes
  makeResponsive(container) {
    if (!container) return;
    
    // Clean up any existing observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Create a new resize observer
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.handleResize(width, height);
        }
      }
    });
    
    // Start observing the container
    this.resizeObserver.observe(container);
  }
  
  // Override this method in subclasses to handle specific resize logic
  handleResize(width, height) {
    // Base implementation just updates the viewBox
    const aspectRatio = this.width / this.height;
    const containerRatio = width / height;
    
    if (containerRatio > aspectRatio) {
      // Container is wider than graph
      const newWidth = height * aspectRatio;
      this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    } else {
      // Container is taller than graph
      const newHeight = width / aspectRatio;
      this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    }
  }

  // Helper to create text elements
  createText(x, y, text, options = {}) {
    const textElement = document.createElementNS(this.svgNS, 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('font-size', options.fontSize || '10');
    textElement.setAttribute('text-anchor', options.anchor || 'middle');
    textElement.setAttribute('fill', options.fill || '#333');
    if (options.fontWeight) textElement.setAttribute('font-weight', options.fontWeight);
    textElement.textContent = text;
    return textElement;
  }
}

export class BarGraph extends Graph {
  constructor(data = [], options = {}) {
    super(options.width || 400, options.height || 250);
    this.data = data;
    this.title = options.title || 'Bar Graph';
    this.barColor = options.barColor || '#4CAF50';
    this.renderBars();
  }

  renderBars() {
    const max = Math.max(...this.data.map(d => d.value));
    const barWidth = this.width / this.data.length;

    this.data.forEach((d, i) => {
      const finalHeight = (d.value / max) * (this.height - 40);
      const x = i * barWidth + 10;
      const y = this.height - finalHeight - 20;

      const rect = document.createElementNS(this.svgNS, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', this.height - 20); // start at base
      rect.setAttribute('width', barWidth - 20);
      rect.setAttribute('height', 0); // grow from 0
      rect.setAttribute('fill', this.barColor);
      this.svg.appendChild(rect);

      // Animate height
      requestAnimationFrame(() => {
        rect.setAttribute('height', finalHeight);
        rect.setAttribute('y', y);
      });

      // Label
      const label = document.createElementNS(this.svgNS, 'text');
      label.setAttribute('x', x + (barWidth - 20) / 2);
      label.setAttribute('y', this.height - 5);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '10');
      label.textContent = d.label;
      this.svg.appendChild(label);
    });
  }
}

// export class PieChart extends Graph {
//   constructor(data = [], options = {}) {
//     super(options.width || 250, options.height || 250);
//     this.data = data;
//     this.colors = options.colors || ['#4CAF50', '#F44336'];
//     this.renderPie();
//   }

//   renderPie() {
//     const total = this.data.reduce((sum, d) => sum + d.value, 0);
//     let startAngle = 0;
//     const cx = this.width / 2;
//     const cy = this.height / 2;
//     const radius = Math.min(cx, cy) - 10;

//     this.data.forEach((d, i) => {
//       const sliceAngle = (d.value / total) * 2 * Math.PI;
//       const x1 = cx + radius * Math.cos(startAngle);
//       const y1 = cy + radius * Math.sin(startAngle);
//       const x2 = cx + radius * Math.cos(startAngle + sliceAngle);
//       const y2 = cy + radius * Math.sin(startAngle + sliceAngle);
//       const largeArc = sliceAngle > Math.PI ? 1 : 0;

//       const pathData = [
//         `M ${cx} ${cy}`,
//         `L ${x1} ${y1}`,
//         `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
//         `Z`
//       ].join(' ');

//       const path = document.createElementNS(this.svgNS, 'path');
//       path.setAttribute('d', pathData);
//       path.setAttribute('fill', this.colors[i % this.colors.length]);

//       // Animate stroke draw
//       path.setAttribute('stroke', '#fff');
//       path.setAttribute('stroke-width', '1');
//       path.setAttribute('stroke-dasharray', '1000');
//       path.setAttribute('stroke-dashoffset', '1000');
//       this.svg.appendChild(path);

//       // Animate stroke drawing
//       requestAnimationFrame(() => {
//         path.setAttribute('stroke-dashoffset', '0');
//       });

//       startAngle += sliceAngle;
//     });
//   }
// }

export class LineGraph extends Graph {
  constructor(data = [], options = {}) {
    super(options.width || 500, options.height || 300);
    this.data = data;
    this.lineColor = options.lineColor || '#3498db';
    this.areaColor = options.areaColor || 'rgba(52, 152, 219, 0.2)';
    this.pointColor = options.pointColor || '#2980b9';
    this.gridColor = options.gridColor || '#ecf0f1';
    this.textColor = options.textColor || '#7f8c8d';
    this.padding = options.padding || { top: 30, right: 30, bottom: 50, left: 60 };
    this.renderLine();
  }

  renderLine() {
    if (!this.data || this.data.length === 0) return;

    // Sort data by date if it's not already sorted
    this.data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate dimensions
    const graphWidth = this.width - this.padding.left - this.padding.right;
    const graphHeight = this.height - this.padding.top - this.padding.bottom;

    // Find min and max values
    const values = this.data.map(d => d.value);
    const dates = this.data.map(d => new Date(d.date));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    // Add a grid
    this.renderGrid(graphWidth, graphHeight, minValue, maxValue, minDate, maxDate);

    // Create scales
    const xScale = (date) => {
      const range = maxDate - minDate;
      const percent = (date - minDate) / range;
      return this.padding.left + percent * graphWidth;
    };

    const yScale = (value) => {
      // Add 10% padding to the top
      const paddedMax = maxValue * 1.1;
      const range = paddedMax - minValue;
      const percent = (value - minValue) / range;
      return this.height - this.padding.bottom - percent * graphHeight;
    };

    // Create line path
    let pathData = '';
    let areaPathData = '';

    this.data.forEach((d, i) => {
      const x = xScale(new Date(d.date));
      const y = yScale(d.value);

      if (i === 0) {
        pathData += `M ${x} ${y}`;
        areaPathData += `M ${x} ${this.height - this.padding.bottom} L ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
        areaPathData += ` L ${x} ${y}`;
      }

      // Add points
      const point = document.createElementNS(this.svgNS, 'circle');
      point.setAttribute('cx', x);
      point.setAttribute('cy', y);
      point.setAttribute('r', 4);
      point.setAttribute('fill', this.pointColor);
      point.setAttribute('stroke', '#fff');
      point.setAttribute('stroke-width', 2);
      point.setAttribute('opacity', 0);

      // Add tooltip on hover
      const tooltip = this.createTooltip(d, x, y);

      // Show tooltip on hover
      point.addEventListener('mouseover', () => {
        tooltip.setAttribute('opacity', 1);
      });

      point.addEventListener('mouseout', () => {
        tooltip.setAttribute('opacity', 0);
      });

      this.svg.appendChild(point);

      // Animate points
      setTimeout(() => {
        point.setAttribute('opacity', 1);
      }, i * 100);
    });

    // Close the area path
    areaPathData += ` L ${xScale(new Date(this.data[this.data.length - 1].date))} ${this.height - this.padding.bottom} Z`;

    // Create and add the area
    const areaPath = document.createElementNS(this.svgNS, 'path');
    areaPath.setAttribute('d', areaPathData);
    areaPath.setAttribute('fill', this.areaColor);
    areaPath.setAttribute('opacity', 0);
    this.svg.appendChild(areaPath);

    // Create and add the line
    const path = document.createElementNS(this.svgNS, 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.lineColor);
    path.setAttribute('stroke-width', 3);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-dasharray', path.getTotalLength());
    path.setAttribute('stroke-dashoffset', path.getTotalLength());
    this.svg.appendChild(path);

    // Animate line and area
    requestAnimationFrame(() => {
      path.setAttribute('stroke-dashoffset', 0);
      areaPath.setAttribute('opacity', 1);
    });
  }

  renderGrid(width, height, minValue, maxValue, minDate, maxDate) {
    // Create grid container
    const grid = document.createElementNS(this.svgNS, 'g');
    grid.setAttribute('class', 'grid');

    // Add horizontal grid lines and y-axis labels
    const yTickCount = 5;
    const yStep = height / (yTickCount - 1);
    const valueRange = (maxValue * 1.1) - minValue;
    const valueStep = valueRange / (yTickCount - 1);

    for (let i = 0; i < yTickCount; i++) {
      const y = this.padding.top + i * yStep;
      const value = maxValue * 1.1 - i * valueStep;

      // Grid line
      const line = document.createElementNS(this.svgNS, 'line');
      line.setAttribute('x1', this.padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.width - this.padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', this.gridColor);
      line.setAttribute('stroke-width', 1);
      grid.appendChild(line);

      // Y-axis label
      const label = this.createText(
        this.padding.left - 10,
        y,
        Math.round(value).toLocaleString(),
        {
          fontSize: '12',
          anchor: 'end',
          fill: this.textColor
        }
      );
      grid.appendChild(label);
    }

    // Add vertical grid lines and x-axis labels
    const xTickCount = Math.min(this.data.length, 6);
    const dateRange = maxDate - minDate;
    const dateStep = dateRange / (xTickCount - 1);

    for (let i = 0; i < xTickCount; i++) {
      const date = new Date(minDate.getTime() + i * dateStep);
      const x = this.padding.left + (i / (xTickCount - 1)) * width;

      // Grid line
      const line = document.createElementNS(this.svgNS, 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', this.padding.top);
      line.setAttribute('x2', x);
      line.setAttribute('y2', this.height - this.padding.bottom);
      line.setAttribute('stroke', this.gridColor);
      line.setAttribute('stroke-width', 1);
      grid.appendChild(line);

      // X-axis label
      const label = this.createText(
        x,
        this.height - this.padding.bottom + 20,
        this.formatDate(date),
        {
          fontSize: '12',
          anchor: 'middle',
          fill: this.textColor
        }
      );
      grid.appendChild(label);
    }

    // Add axis titles
    const yAxisTitle = this.createText(
      20,
      this.height / 2,
      'XP Points',
      {
        fontSize: '14',
        anchor: 'middle',
        fill: this.textColor,
        fontWeight: 'bold'
      }
    );
    yAxisTitle.setAttribute('transform', `rotate(-90, 20, ${this.height / 2})`);
    grid.appendChild(yAxisTitle);

    const xAxisTitle = this.createText(
      this.width / 2,
      this.height - 10,
      'Date',
      {
        fontSize: '14',
        anchor: 'middle',
        fill: this.textColor,
        fontWeight: 'bold'
      }
    );
    grid.appendChild(xAxisTitle);

    this.svg.appendChild(grid);
  }

  createTooltip(data, x, y) {
    const g = document.createElementNS(this.svgNS, 'g');
    g.setAttribute('opacity', 0);

    // Background rectangle
    const rect = document.createElementNS(this.svgNS, 'rect');
    rect.setAttribute('x', x - 70);
    rect.setAttribute('y', y - 45);
    rect.setAttribute('width', 140);
    rect.setAttribute('height', 40);
    rect.setAttribute('rx', 5);
    rect.setAttribute('ry', 5);
    rect.setAttribute('fill', 'rgba(0,0,0,0.7)');
    g.appendChild(rect);

    // Date text
    const dateText = this.createText(
      x,
      y - 30,
      this.formatDate(new Date(data.date)),
      {
        fontSize: '12',
        fill: '#fff'
      }
    );
    g.appendChild(dateText);

    // Value text
    const valueText = this.createText(
      x,
      y - 15,
      `XP: ${data.value.toLocaleString()}`,
      {
        fontSize: '12',
        fontWeight: 'bold',
        fill: '#fff'
      }
    );
    g.appendChild(valueText);

    this.svg.appendChild(g);
    return g;
  }

  formatDate(date) {
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
}

export class WebChart extends Graph {
  constructor(data = [], options = {}) {
    console.log('WebChart constructor called with data:', data);
    super(options.width || 300, options.height || 300);
    
    // Ensure data is always an array
    this.data = Array.isArray(data) ? data : [];
    
    this.maxValue = options.maxValue || 100;
    this.levels = options.levels || 5;
    this.color = options.color || '#3498db';
    this.backgroundColor = options.backgroundColor || 'rgba(99, 102, 241, 0.2)';
    this.labelColor = options.labelColor || '#4b5563';
  }

  render() {
    console.log('WebChart render called');
    this.renderWebChart();
    return super.render();
  }

  renderWebChart() {
    console.log('renderWebChart called with data:', this.data);
    console.log('Chart dimensions:', { width: this.width, height: this.height });
    
    if (!this.data || !Array.isArray(this.data) || this.data.length < 3) {
      console.warn('Not enough data points for web chart:', this.data);
      const text = document.createElementNS(this.svgNS, 'text');
      text.setAttribute('x', this.width / 2);
      text.setAttribute('y', this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#4b5563');
      text.textContent = 'Need at least 3 skills to display chart';
      this.svg.appendChild(text);
      return;
    }

    // Ensure minimum dimensions
    const minDimension = Math.max(200, Math.min(this.width, this.height));
    const centerX = minDimension / 2;
    const centerY = minDimension / 2;
    
    // Ensure positive radius with padding
    const radius = Math.max(50, (minDimension / 2) - 40);
    const angleStep = (Math.PI * 2) / this.data.length;

    console.log('Drawing web chart with:', {
      centerX, centerY, radius, angleStep,
      dataPoints: this.data.length
    });

    // Draw level circles and lines
    for (let level = 1; level <= this.levels; level++) {
      const levelRadius = (radius * level) / this.levels;
      
      console.log(`Drawing level ${level} circle with radius ${levelRadius}`);
      
      // Draw level circle
      const circle = document.createElementNS(this.svgNS, 'circle');
      circle.setAttribute('cx', centerX);
      circle.setAttribute('cy', centerY);
      circle.setAttribute('r', Math.max(0, levelRadius)); // Ensure positive radius
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#e2e8f0');
      circle.setAttribute('stroke-width', '1');
      this.svg.appendChild(circle);
    }

    // Draw axis lines
    this.data.forEach((item, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const lineX = centerX + radius * Math.cos(angle);
      const lineY = centerY + radius * Math.sin(angle);
      
      const line = document.createElementNS(this.svgNS, 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', lineX);
      line.setAttribute('y2', lineY);
      line.setAttribute('stroke', '#e2e8f0');
      line.setAttribute('stroke-width', '1');
      this.svg.appendChild(line);
      
      // Add axis label
      const labelDistance = radius + 20;
      const labelX = centerX + labelDistance * Math.cos(angle);
      const labelY = centerY + labelDistance * Math.sin(angle);
      
      const label = document.createElementNS(this.svgNS, 'text');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('font-size', '12');
      label.setAttribute('fill', this.labelColor);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.textContent = item.label;
      this.svg.appendChild(label);
    });

    // Draw data polygon
    const points = this.data.map((item, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const value = Math.min(item.value, this.maxValue);
      const distance = (radius * value) / this.maxValue;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    
    console.log('Polygon points:', points);
    
    // Draw filled polygon
    const polygon = document.createElementNS(this.svgNS, 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', this.backgroundColor);
    polygon.setAttribute('stroke', this.color);
    polygon.setAttribute('stroke-width', '2');
    this.svg.appendChild(polygon);
    
    // Draw data points
    this.data.forEach((item, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = Math.min(item.value, this.maxValue);
      const distance = (radius * value) / this.maxValue;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      const point = document.createElementNS(this.svgNS, 'circle');
      point.setAttribute('cx', x);
      point.setAttribute('cy', y);
      point.setAttribute('r', '4');
      point.setAttribute('fill', '#fff');
      point.setAttribute('stroke', this.color);
      point.setAttribute('stroke-width', '2');
      this.svg.appendChild(point);
      
      // Add value label
      const valueLabel = document.createElementNS(this.svgNS, 'text');
      valueLabel.setAttribute('x', x);
      valueLabel.setAttribute('y', y - 10);
      valueLabel.setAttribute('font-size', '10');
      valueLabel.setAttribute('font-weight', 'bold');
      valueLabel.setAttribute('fill', this.color);
      valueLabel.setAttribute('text-anchor', 'middle');
      valueLabel.textContent = item.value;
      this.svg.appendChild(valueLabel);
    });
    
    console.log('Web chart rendering complete');
  }
}
