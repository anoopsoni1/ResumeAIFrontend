import { Download } from "lucide-react";
import { useRef } from "react";

export default function PortfolioHTMLDownload({ children, showDownloadHeader = true }) {
  const portfolioRef = useRef();

  const handleDownloadHTML = () => {
    const content = portfolioRef.current.innerHTML;

    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio</title>

  <!-- Tailwind CDN for styling -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    body {
      background: #0a0a0f;
      color: #ffffff;
      font-family: system-ui, sans-serif;
      padding: 40px;
    }
  </style>
</head>

<body>
  <div class="max-w-4xl mx-auto">
    ${content}
  </div>
</body>
</html>
`;

    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();

    URL.revokeObjectURL(url);
  };

  if (!showDownloadHeader) {
    return <div ref={portfolioRef}>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 flex justify-end">
        <button
          onClick={handleDownloadHTML}
          className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Download size={18} />
          Download HTML
        </button>
      </div>
      <div ref={portfolioRef} className="p-10">
        {children}
      </div>
    </div>
  );
}
