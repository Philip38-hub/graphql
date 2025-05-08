// js/graph.js

export class Graph {
    constructor(width = 400, height = 250) {
      this.width = width;
      this.height = height;
      this.svgNS = "http://www.w3.org/2000/svg";
      this.svg = document.createElementNS(this.svgNS, 'svg');
      this.svg.setAttribute('width', this.width);
      this.svg.setAttribute('height', this.height);
    }
  
    render() {
      return this.svg;
    }
  }
  
  export class BarGraph extends Graph {
    constructor(data = [], options = {}) {
      super(options.width, options.height);
      this.data = data;
      this.title = options.title || 'Bar Graph';
      this.barColor = options.barColor || '#4CAF50';
      this.renderBars();
    }
  
    renderBars() {
      const max = Math.max(...this.data.map(d => d.value));
      const barWidth = this.width / this.data.length;
  
      this.data.forEach((d, i) => {
        const barHeight = (d.value / max) * (this.height - 40);
        const rect = document.createElementNS(this.svgNS, 'rect');
        rect.setAttribute('x', i * barWidth + 10);
        rect.setAttribute('y', this.height - barHeight - 20);
        rect.setAttribute('width', barWidth - 20);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', this.barColor);
        this.svg.appendChild(rect);
  
        // Label
        const label = document.createElementNS(this.svgNS, 'text');
        label.setAttribute('x', i * barWidth + barWidth / 2);
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
      super(options.width || 200, options.height || 200);
      this.data = data;
      this.colors = options.colors || ['#4CAF50', '#F44336'];
      this.renderPie();
    }
  
    renderPie() {
      const total = this.data.reduce((sum, d) => sum + d.value, 0);
      let startAngle = 0;
      const cx = this.width / 2;
      const cy = this.height / 2;
      const radius = Math.min(cx, cy) - 10;
  
      this.data.forEach((d, i) => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const x1 = cx + radius * Math.cos(startAngle);
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(startAngle + sliceAngle);
        const y2 = cy + radius * Math.sin(startAngle + sliceAngle);
  
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
        this.svg.appendChild(path);
  
        startAngle += sliceAngle;
      });
    }
  }
  