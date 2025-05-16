export class Graph {
  constructor(width = 400, height = 250) {
    this.width = width;
    this.height = height;
    this.svgNS = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(this.svgNS, 'svg');
    this.svg.setAttribute('width', this.width);
    this.svg.setAttribute('height', this.height);
    this.svg.style.overflow = 'visible';
    this.svg.style.transition = 'opacity 0.5s ease-in';
    this.svg.style.opacity = '0';
  }

  render() {
    requestAnimationFrame(() => {
      this.svg.classList.add('loaded');
      this.svg.style.opacity = '1';
    });
    return this.svg;
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

export class PieChart extends Graph {
  constructor(data = [], options = {}) {
    super(options.width || 250, options.height || 250);
    this.data = data;
    this.colors = options.colors || ['#4CAF50', '#F44336'];
    this.renderPie();
  }

  renderPie() {
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    
    // Check if we have valid data to render
    if (total <= 0 || !this.data.length) {
      const text = document.createElementNS(this.svgNS, 'text');
      text.setAttribute('x', this.width / 2);
      text.setAttribute('y', this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = 'No data to display';
      this.svg.appendChild(text);
      return;
    }
    
    let startAngle = 0;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = Math.min(cx, cy) - 10;

    this.data.forEach((d, i) => {
      // Ensure value is a number
      const value = Number(d.value) || 0;
      if (value <= 0) return; // Skip zero or negative values
      
      const sliceAngle = (value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      // Calculate points using angles
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      
      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');

      const path = document.createElementNS(this.svgNS, 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', this.colors[i % this.colors.length]);
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '1');
      this.svg.appendChild(path);

      // Add label for each slice (only if slice is large enough)
      if (sliceAngle > 0.1) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = cx + labelRadius * Math.cos(midAngle);
        const labelY = cy + labelRadius * Math.sin(midAngle);
        
        const label = document.createElementNS(this.svgNS, 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        label.setAttribute('fill', '#fff');
        label.setAttribute('font-size', '12');
        label.textContent = `${d.label}`;
        this.svg.appendChild(label);
      }

      startAngle = endAngle;
    });
    
    // Add legend
    this.addLegend();
  }
}

export class WebChart extends Graph {
  constructor(data = [], options = {}) {
    super(options.width || 300, options.height || 300);
    this.data = data;
    this.maxValue = options.maxValue || 100;
    this.levels = options.levels || 5;
    this.color = options.color || '#3498db';
    this.backgroundColor = options.backgroundColor || 'rgba(99, 102, 241, 0.2)';
    this.labelColor = options.labelColor || '#4b5563';
    this.renderWebChart();
  }

  renderWebChart() {
    if (!this.data || this.data.length < 3) {
      const text = document.createElementNS(this.svgNS, 'text');
      text.setAttribute('x', this.width / 2);
      text.setAttribute('y', this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = 'Need at least 3 skills to display chart';
      this.svg.appendChild(text);
      return;
    }

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - 30;
    const angleStep = (Math.PI * 2) / this.data.length;

    // Draw level circles and lines
    for (let level = 1; level <= this.levels; level++) {
      const levelRadius = (radius * level) / this.levels;
      
      // Draw level circle
      const circle = document.createElementNS(this.svgNS, 'circle');
      circle.setAttribute('cx', centerX);
      circle.setAttribute('cy', centerY);
      circle.setAttribute('r', levelRadius);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#e2e8f0');
      circle.setAttribute('stroke-width', '1');
      this.svg.appendChild(circle);
      
      // Draw level value
      if (level < this.levels) {
        const levelValue = document.createElementNS(this.svgNS, 'text');
        const levelText = Math.round((level / this.levels) * this.maxValue);
        levelValue.setAttribute('x', centerX + 5);
        levelValue.setAttribute('y', centerY - levelRadius + 15);
        levelValue.setAttribute('font-size', '10');
        levelValue.setAttribute('fill', '#94a3b8');
        levelValue.textContent = levelText;
        this.svg.appendChild(levelValue);
      }
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
    
    // Draw filled polygon
    const polygon = document.createElementNS(this.svgNS, 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', this.backgroundColor);
    polygon.setAttribute('stroke', this.color);
    polygon.setAttribute('stroke-width', '2');
    polygon.setAttribute('opacity', '0');
    this.svg.appendChild(polygon);
    
    // Animate polygon appearance
    setTimeout(() => {
      polygon.setAttribute('opacity', '1');
    }, 100);
    
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
  }
}
