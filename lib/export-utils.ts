// Utility functions for exporting data

export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export chart as image
export function downloadChartAsImage(chartId: string, filename: string) {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) return;

  // Find the SVG element within the chart
  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) return;

  // Serialize SVG to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  const svgSize = svgElement.getBoundingClientRect();
  canvas.width = svgSize.width * 2; // 2x for better quality
  canvas.height = svgSize.height * 2;
  
  // Create image from SVG
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    
    // Download canvas as PNG
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.png`;
      link.click();
    });
  };
  
  img.src = url;
}

// Format data for Excel-like structure
export function prepareCommentsForExport(comments: any[], sentiments: string[]) {
  return comments.map((comment, index) => ({
    'Author': comment.author,
    'Comment': comment.text.replace(/<[^>]*>/g, ''), // Remove HTML tags
    'Likes': comment.likeCount,
    'Published Date': new Date(comment.publishedAt).toLocaleString(),
    'Sentiment': sentiments[index],
    'Comment ID': comment.id,
  }));
}

export function prepareSentimentSummary(sentimentCounts: { Positive: number; Negative: number; Neutral: number }) {
  const total = sentimentCounts.Positive + sentimentCounts.Negative + sentimentCounts.Neutral;
  return [
    {
      'Sentiment': 'Positive',
      'Count': sentimentCounts.Positive,
      'Percentage': ((sentimentCounts.Positive / total) * 100).toFixed(2) + '%',
    },
    {
      'Sentiment': 'Neutral',
      'Count': sentimentCounts.Neutral,
      'Percentage': ((sentimentCounts.Neutral / total) * 100).toFixed(2) + '%',
    },
    {
      'Sentiment': 'Negative',
      'Count': sentimentCounts.Negative,
      'Percentage': ((sentimentCounts.Negative / total) * 100).toFixed(2) + '%',
    },
  ];
}

export function prepareTopCommentersForExport(topCommenters: Array<{ author: string; count: number }>) {
  return topCommenters.map((commenter, index) => ({
    'Rank': index + 1,
    'Author': commenter.author,
    'Comment Count': commenter.count,
  }));
}
