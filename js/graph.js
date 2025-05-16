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
