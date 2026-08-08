import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  FileCode,
  Code2,
  Layers,
  Cpu,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FolderTree,
  Sparkles,
  FileDown,
  Loader2,
  Copy,
  Check,
  Search,
  Filter,
  ShieldCheck,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Github,
} from 'lucide-react';
import { GeneratedProject } from '../types';
import { GitHubExportModal } from './GitHubExportModal';

interface ProjectDashboardProps {
  project: GeneratedProject | null;
  fileContents?: Record<string, string>;
}

interface FileMetric {
  path: string;
  name: string;
  extension: string;
  category: string;
  lines: number;
  sizeBytes: number;
  functions: number;
  imports: number;
  complexityScore: number;
  complexityLabel: 'Low' | 'Moderate' | 'High' | 'Very High';
}

interface CategoryMetric {
  name: string;
  count: number;
  lines: number;
  sizeBytes: number;
  color: string;
}

interface DirectoryMetric {
  dir: string;
  count: number;
  lines: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'React / TSX': '#6366f1', // Indigo
  'TypeScript': '#06b6d4', // Cyan
  'JSON & Configs': '#f59e0b', // Amber
  'Styles & CSS': '#ec4899', // Pink
  'Markdown & Docs': '#a855f7', // Purple
  'Scripts & Shell': '#10b981', // Emerald
  'Other': '#64748b', // Slate
};

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, fileContents }) => {
  const [activeView, setActiveView] = useState<'overview' | 'types' | 'files' | 'directories'>('overview');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<'all' | 'Very High' | 'High' | 'Moderate' | 'Low'>('all');
  const [showHealthAdvice, setShowHealthAdvice] = useState(false);

  // Derive files record
  const filesToAnalyze: Record<string, string> = useMemo(() => {
    if (fileContents && Object.keys(fileContents).length > 0) {
      return fileContents;
    }
    return project?.files || {};
  }, [fileContents, project]);

  // Analyze all files in the project
  const metrics = useMemo(() => {
    const fileEntries = Object.entries(filesToAnalyze);
    if (fileEntries.length === 0) {
      return {
        totalFiles: 0,
        totalLines: 0,
        totalSizeBytes: 0,
        avgLinesPerFile: 0,
        fileMetrics: [] as FileMetric[],
        categoryMetrics: [] as CategoryMetric[],
        directoryMetrics: [] as DirectoryMetric[],
        topComplexFiles: [] as FileMetric[],
        complexitySummary: { low: 0, moderate: 0, high: 0, veryHigh: 0 },
      };
    }

    let totalLines = 0;
    let totalSizeBytes = 0;
    const fileMetrics: FileMetric[] = [];
    const categoryMap: Record<string, { count: number; lines: number; sizeBytes: number }> = {};
    const dirMap: Record<string, { count: number; lines: number }> = {};

    fileEntries.forEach(([path, content]) => {
      const safeContent = typeof content === 'string' ? content : String(content || '');
      const lines = safeContent ? safeContent.split('\n').length : 0;
      const sizeBytes = new Blob([safeContent]).size;

      totalLines += lines;
      totalSizeBytes += sizeBytes;

      // Detect extension and category
      const extension = path.includes('.') ? path.split('.').pop()?.toLowerCase() || '' : 'none';
      let category = 'Other';

      if (extension === 'tsx' || extension === 'jsx') {
        category = 'React / TSX';
      } else if (extension === 'ts' || extension === 'js') {
        category = 'TypeScript';
      } else if (['json', 'toml', 'yaml', 'yml'].includes(extension)) {
        category = 'JSON & Configs';
      } else if (['css', 'scss', 'sass', 'less'].includes(extension)) {
        category = 'Styles & CSS';
      } else if (['md', 'txt'].includes(extension)) {
        category = 'Markdown & Docs';
      } else if (['sh', 'bat', 'cmd', 'rs'].includes(extension) || path.includes('gradle') || path.includes('Dockerfile')) {
        category = 'Scripts & Shell';
      }

      // Group by Category
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, lines: 0, sizeBytes: 0 };
      }
      categoryMap[category].count += 1;
      categoryMap[category].lines += lines;
      categoryMap[category].sizeBytes += sizeBytes;

      // Group by Top Directory
      const pathParts = path.split('/');
      const dir = pathParts.length > 1 ? pathParts[0] : 'root';
      if (!dirMap[dir]) {
        dirMap[dir] = { count: 0, lines: 0 };
      }
      dirMap[dir].count += 1;
      dirMap[dir].lines += lines;

      // Estimate Complexity
      const functionsMatch = safeContent.match(/(function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|=>|\bdef\b)/g);
      const functionsCount = functionsMatch ? functionsMatch.length : 0;

      const importsMatch = safeContent.match(/(import\s+.*from|require\(|import\()/g);
      const importsCount = importsMatch ? importsMatch.length : 0;

      const conditionalsMatch = safeContent.match(/\b(if|else|switch|case|for|while|try|catch|\?)\b/g);
      const conditionalsCount = conditionalsMatch ? conditionalsMatch.length : 0;

      // Weighted Complexity Score Calculation
      const complexityScore = Math.round(
        lines * 0.4 +
        functionsCount * 4 +
        conditionalsCount * 3 +
        importsCount * 2
      );

      let complexityLabel: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
      if (complexityScore > 300) complexityLabel = 'Very High';
      else if (complexityScore > 150) complexityLabel = 'High';
      else if (complexityScore > 60) complexityLabel = 'Moderate';

      const filename = pathParts[pathParts.length - 1];

      fileMetrics.push({
        path,
        name: filename,
        extension,
        category,
        lines,
        sizeBytes,
        functions: functionsCount,
        imports: importsCount,
        complexityScore,
        complexityLabel,
      });
    });

    // Format Category Metrics for Pie / Bar chart
    const categoryMetrics: CategoryMetric[] = Object.entries(categoryMap).map(([name, stat]) => ({
      name,
      count: stat.count,
      lines: stat.lines,
      sizeBytes: stat.sizeBytes,
      color: CATEGORY_COLORS[name] || '#64748b',
    })).sort((a, b) => b.lines - a.lines);

    // Format Directory Metrics
    const dirColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#3b82f6', '#84cc16'];
    const directoryMetrics: DirectoryMetric[] = Object.entries(dirMap).map(([dir, stat], idx) => ({
      dir: dir === 'root' ? 'root/' : `${dir}/`,
      count: stat.count,
      lines: stat.lines,
      color: dirColors[idx % dirColors.length],
    })).sort((a, b) => b.lines - a.lines);

    // Sort files by complexity score descending
    const topComplexFiles = [...fileMetrics].sort((a, b) => b.complexityScore - a.complexityScore).slice(0, 8);

    // Count complexity bands
    const complexitySummary = {
      low: fileMetrics.filter((f) => f.complexityLabel === 'Low').length,
      moderate: fileMetrics.filter((f) => f.complexityLabel === 'Moderate').length,
      high: fileMetrics.filter((f) => f.complexityLabel === 'High').length,
      veryHigh: fileMetrics.filter((f) => f.complexityLabel === 'Very High').length,
    };

    return {
      totalFiles: fileEntries.length,
      totalLines,
      totalSizeBytes,
      avgLinesPerFile: Math.round(totalLines / (fileEntries.length || 1)),
      fileMetrics,
      categoryMetrics,
      directoryMetrics,
      topComplexFiles,
      complexitySummary,
    };
  }, [filesToAnalyze]);

  const formatKB = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const healthScore = useMemo(() => {
    if (metrics.totalFiles === 0) return 100;
    let penalty = 0;
    penalty += metrics.complexitySummary.veryHigh * 12;
    penalty += metrics.complexitySummary.high * 5;
    if (metrics.avgLinesPerFile > 300) penalty += 15;
    else if (metrics.avgLinesPerFile > 200) penalty += 8;
    return Math.max(55, Math.min(100, 100 - penalty));
  }, [metrics]);

  const filteredFileMetrics = useMemo(() => {
    return metrics.fileMetrics
      .filter((f) => {
        const matchesSearch =
          !searchTerm ||
          f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesComplexity =
          complexityFilter === 'all' || f.complexityLabel === complexityFilter;
        return matchesSearch && matchesComplexity;
      })
      .sort((a, b) => b.complexityScore - a.complexityScore);
  }, [metrics.fileMetrics, searchTerm, complexityFilter]);

  const handleCopyMarkdown = () => {
    const name = project?.projectName || 'Project Architecture';
    const markdown = `# ${name} - Architecture Summary
Generated on ${new Date().toLocaleDateString()}

## 📊 Core Overview
- **Total Files**: ${metrics.totalFiles}
- **Total Lines of Code**: ${metrics.totalLines.toLocaleString()} LOC (~${metrics.avgLinesPerFile} LOC / file)
- **Source Size**: ${formatKB(metrics.totalSizeBytes)}
- **Code Health Score**: ${healthScore}/100

## 📁 File Category Share
${metrics.categoryMetrics.map((c) => `- **${c.name}**: ${c.count} files, ${c.lines} LOC (${formatKB(c.sizeBytes)})`).join('\n')}

## ⚡ High Complexity Files
${metrics.fileMetrics
  .sort((a, b) => b.complexityScore - a.complexityScore)
  .slice(0, 8)
  .map((f) => `- \`${f.path}\`: ${f.lines} LOC, Score: ${f.complexityScore} (${f.complexityLabel})`)
  .join('\n')}
`;

    navigator.clipboard.writeText(markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2200);
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const projectName = project?.projectName || 'Project Architecture';

      // Title Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 36, 'F');

      // Top Indigo Accent Strip
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 2.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${projectName} Visual Report`, 14, 18);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated on ${new Date().toLocaleDateString()} • Code Intelligence & Recharts Analytics`, 14, 26);

      let y = 46;

      // Section 1: Executive Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Codebase Executive Summary', 14, y);
      y += 6;

      const cardWidth = 43;
      const cardHeight = 22;
      const cardGap = 3.5;
      const cards = [
        { title: 'TOTAL FILES', val: `${metrics.totalFiles}`, detail: `${metrics.categoryMetrics.length} file categories` },
        { title: 'TOTAL LINES', val: `${metrics.totalLines.toLocaleString()}`, detail: `~${metrics.avgLinesPerFile} LOC / file` },
        { title: 'PAYLOAD SIZE', val: formatKB(metrics.totalSizeBytes), detail: 'Source assets' },
        { title: 'HIGH COMPLEXITY', val: `${metrics.complexitySummary.high + metrics.complexitySummary.veryHigh}`, detail: `${metrics.complexitySummary.low} low / ${metrics.complexitySummary.moderate} mod` },
      ];

      cards.forEach((c, i) => {
        const x = 14 + i * (cardWidth + cardGap);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(c.title, x + 3.5, y + 5.5);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(c.val, x + 3.5, y + 12);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(c.detail, x + 3.5, y + 17.5);
      });

      y += cardHeight + 12;

      // Section 2: Category Breakdown Table
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('2. File Type & Category Distribution', 14, y);
      y += 6;

      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 182, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Name', 18, y + 4.8);
      doc.text('Files', 80, y + 4.8, { align: 'right' });
      doc.text('Lines of Code', 120, y + 4.8, { align: 'right' });
      doc.text('Total Size', 155, y + 4.8, { align: 'right' });
      doc.text('Code Share', 190, y + 4.8, { align: 'right' });

      y += 7;

      metrics.categoryMetrics.forEach((cat, idx) => {
        const isOdd = idx % 2 === 1;
        doc.setFillColor(isOdd ? 248 : 255, isOdd ? 250 : 255, isOdd ? 252 : 255);
        doc.rect(14, y, 182, 6.5, 'F');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);

        const share = metrics.totalLines > 0 ? ((cat.lines / metrics.totalLines) * 100).toFixed(1) : '0';

        doc.text(cat.name, 18, y + 4.5);
        doc.text(`${cat.count}`, 80, y + 4.5, { align: 'right' });
        doc.text(`${cat.lines}`, 120, y + 4.5, { align: 'right' });
        doc.text(formatKB(cat.sizeBytes), 155, y + 4.5, { align: 'right' });
        doc.text(`${share}%`, 190, y + 4.5, { align: 'right' });

        y += 6.5;
      });

      y += 10;

      // Section 3: High-Complexity Files
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Highest Complexity Files Ranking', 14, y);
      y += 6;

      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 182, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('File Path', 18, y + 4.8);
      doc.text('Category', 95, y + 4.8);
      doc.text('Lines', 135, y + 4.8, { align: 'right' });
      doc.text('Functions', 160, y + 4.8, { align: 'right' });
      doc.text('Complexity', 190, y + 4.8, { align: 'right' });

      y += 7;

      const topFilesToPrint = metrics.fileMetrics
        .sort((a, b) => b.complexityScore - a.complexityScore)
        .slice(0, 10);

      topFilesToPrint.forEach((f, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        const isOdd = idx % 2 === 1;
        doc.setFillColor(isOdd ? 248 : 255, isOdd ? 250 : 255, isOdd ? 252 : 255);
        doc.rect(14, y, 182, 6.5, 'F');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);

        const truncPath = f.path.length > 45 ? '...' + f.path.slice(-42) : f.path;

        doc.text(truncPath, 18, y + 4.5);
        doc.text(f.category, 95, y + 4.5);
        doc.text(`${f.lines}`, 135, y + 4.5, { align: 'right' });
        doc.text(`${f.functions}`, 160, y + 4.5, { align: 'right' });

        if (f.complexityScore > 150) {
          doc.setTextColor(225, 29, 72);
        } else {
          doc.setTextColor(79, 70, 229);
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${f.complexityScore} (${f.complexityLabel})`, 190, y + 4.5, { align: 'right' });

        y += 6.5;
      });

      y += 10;

      // Section 4: Directories
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Directory Hierarchy Code Volume', 14, y);
      y += 6;

      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 182, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Directory Path', 18, y + 4.8);
      doc.text('File Count', 120, y + 4.8, { align: 'right' });
      doc.text('Total Lines of Code', 190, y + 4.8, { align: 'right' });

      y += 7;

      metrics.directoryMetrics.forEach((d, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        const isOdd = idx % 2 === 1;
        doc.setFillColor(isOdd ? 248 : 255, isOdd ? 250 : 255, isOdd ? 252 : 255);
        doc.rect(14, y, 182, 6.5, 'F');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);

        doc.text(d.dir, 18, y + 4.5);
        doc.text(`${d.count}`, 120, y + 4.5, { align: 'right' });
        doc.text(`${d.lines}`, 190, y + 4.5, { align: 'right' });

        y += 6.5;
      });

      // Page Footers
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${page} of ${totalPages} • ${projectName} Visual Architecture Report`,
          105,
          290,
          { align: 'center' }
        );
      }

      const safeFilename = (projectName || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
      doc.save(`${safeFilename}-architecture-report.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (!project && Object.keys(filesToAnalyze).length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
        <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-300">No Project Code Loaded</h3>
        <p className="text-xs">Generate or paste project code above to view the Recharts complexity dashboard.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6"
    >
      {/* Dashboard Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Project Intelligence & Recharts Analytics
            </span>
            <span className="text-[11px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full">
              Codebase Complexity & Distribution
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>{project?.projectName || 'Generated Project'} Architecture Dashboard</span>
          </h3>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsGitHubModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            title="Export repository to GitHub with CI/CD scripts"
          >
            <Github className="w-3.5 h-3.5 text-white" />
            <span>GitHub Export</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            title="Copy architecture summary report as Markdown"
          >
            {copiedMarkdown ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Spec!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            title="Download visual intelligence PDF report"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeView === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveView('types')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeView === 'types'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              File Types
            </button>
            <button
              onClick={() => setActiveView('files')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeView === 'files'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Top Complexity
            </button>
            <button
              onClick={() => setActiveView('directories')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeView === 'directories'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Directories
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Total Files
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalFiles}</div>
          <div className="text-[10px] text-slate-500 font-mono">
            {metrics.categoryMetrics.length} categories
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            Total Lines
          </div>
          <div className="text-2xl font-black text-cyan-300">{metrics.totalLines.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-mono">
            ~{metrics.avgLinesPerFile} LOC / file
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Source Size
          </div>
          <div className="text-2xl font-black text-emerald-300">{formatKB(metrics.totalSizeBytes)}</div>
          <div className="text-[10px] text-slate-500 font-mono">
            Uncompressed
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.34 }}
          className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            High Complexity
          </div>
          <div className="text-2xl font-black text-amber-300">
            {metrics.complexitySummary.high + metrics.complexitySummary.veryHigh}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {metrics.complexitySummary.low} simple, {metrics.complexitySummary.moderate} mod
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
          onClick={() => setShowHealthAdvice(!showHealthAdvice)}
          className="p-3.5 bg-slate-950/80 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl space-y-1 cursor-pointer group transition"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Health Score
            </span>
            {showHealthAdvice ? (
              <ChevronUp className="w-3 h-3 text-slate-500 group-hover:text-indigo-300" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-indigo-300" />
            )}
          </div>
          <div className="text-2xl font-black text-indigo-300 flex items-baseline gap-1">
            <span>{healthScore}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="text-[10px] text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            <span>{showHealthAdvice ? 'Hide Recommendations' : 'View Insights'}</span>
          </div>
        </motion.div>
      </div>

      {/* Health Insights Expandable Drawer */}
      <AnimatePresence>
        {showHealthAdvice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-slate-950/90 border border-indigo-500/30 rounded-xl p-4 text-xs space-y-2"
          >
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Automated Architecture Refactoring Insights</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 pl-5 list-disc font-mono text-[11px]">
              {metrics.complexitySummary.veryHigh > 0 && (
                <li>
                  <strong className="text-rose-400">Very High Complexity Files Detected:</strong> Consider decomposing{' '}
                  <span className="text-white font-bold">{metrics.topComplexFiles[0]?.name}</span> ({metrics.topComplexFiles[0]?.lines} LOC) into smaller custom hooks or sub-components.
                </li>
              )}
              {metrics.avgLinesPerFile > 180 && (
                <li>
                  <strong className="text-amber-400">Average Module Size:</strong> Modules average ~{metrics.avgLinesPerFile} LOC. Decomposing complex views improves maintainability and tree-shaking efficiency.
                </li>
              )}
              <li>
                <strong className="text-emerald-400">Strong Component Modularization:</strong> Clean separation across {metrics.directoryMetrics.length} directory modules ({metrics.directoryMetrics.map(d => d.dir).join(', ')}).
              </li>
              <li>
                <strong className="text-cyan-400">Recharts Visualization:</strong> All charts feature Framer Motion enter transitions, custom tooltips, and interactive legends.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area based on Tab with AnimatePresence */}
      <AnimatePresence mode="wait">
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* File Type Distribution Donut Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.96 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="p-5 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-3 flex flex-col justify-between transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  File Category Share (Lines of Code)
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Recharts Donut</span>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="w-full h-64 min-h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.categoryMetrics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="lines"
                      nameKey="name"
                      isAnimationActive={true}
                      animationDuration={1100}
                      animationBegin={200}
                      animationEasing="ease-out"
                    >
                      {metrics.categoryMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#020617" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                      formatter={(value: any, name: any) => [`${value} lines`, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>

            {/* Top File Complexity Bar Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.96 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="p-5 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-3 flex flex-col justify-between transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Top Files by Complexity Index
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Recharts Bar</span>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, delay: 0.22 }}
                className="w-full h-64 min-h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topComplexFiles} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={10}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                      formatter={(value: any, name: any) => [value, name === 'complexityScore' ? 'Complexity Index' : 'Lines']}
                    />
                    <Bar
                      dataKey="complexityScore"
                      name="Complexity Index"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationBegin={250}
                      animationEasing="ease-out"
                    >
                      {metrics.topComplexFiles.map((entry, index) => {
                        const barColors = ['#6366f1', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b'];
                        return <Cell key={`bar-${index}`} fill={barColors[index % barColors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeView === 'types' && (
          <motion.div
            key="types"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-5 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-4 transition-all duration-300 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                File Type Distribution Breakdown
              </h4>
              <span className="text-[11px] text-slate-400">Lines & Byte Size per Category</span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full h-72 min-h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.categoryMetrics} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar
                    dataKey="lines"
                    name="Total Lines of Code"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1100}
                    animationBegin={150}
                  />
                  <Bar
                    dataKey="count"
                    name="File Count"
                    fill="#06b6d4"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1100}
                    animationBegin={300}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {metrics.categoryMetrics.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.88, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: -10 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1 transition-all"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">{cat.count} files • {cat.lines} LOC</div>
                  <div className="text-[10px] text-slate-500 font-mono">{formatKB(cat.sizeBytes)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-5 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-4 transition-all duration-300 shadow-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Codebase File Complexity Ranking
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Calculated using LOC, functions, imports, and branching statements
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search file path..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={complexityFilter}
                    onChange={(e) => setComplexityFilter(e.target.value as any)}
                    className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">All Levels</option>
                    <option value="Very High" className="bg-slate-900 text-rose-400">Very High</option>
                    <option value="High" className="bg-slate-900 text-amber-400">High</option>
                    <option value="Moderate" className="bg-slate-900 text-indigo-400">Moderate</option>
                    <option value="Low" className="bg-slate-900 text-emerald-400">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">File Path</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Lines</th>
                    <th className="p-2.5 text-right">Functions</th>
                    <th className="p-2.5 text-right">Imports</th>
                    <th className="p-2.5 text-right">Size</th>
                    <th className="p-2.5 text-center">Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredFileMetrics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 text-xs">
                        No files matching search filter &quot;{searchTerm}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredFileMetrics.map((f, i) => (
                      <motion.tr
                        key={f.path}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        className="hover:bg-slate-900/60 transition"
                      >
                        <td className="p-2.5 font-semibold text-slate-100 flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-xs">{f.path}</span>
                        </td>
                        <td className="p-2.5 text-slate-400">{f.category}</td>
                        <td className="p-2.5 text-right font-bold text-cyan-300">{f.lines}</td>
                        <td className="p-2.5 text-right text-slate-300">{f.functions}</td>
                        <td className="p-2.5 text-right text-slate-300">{f.imports}</td>
                        <td className="p-2.5 text-right text-slate-400">{formatKB(f.sizeBytes)}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.complexityLabel === 'Very High'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : f.complexityLabel === 'High'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : f.complexityLabel === 'Moderate'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {f.complexityScore} ({f.complexityLabel})
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeView === 'directories' && (
          <motion.div
            key="directories"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-5 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl space-y-4 transition-all duration-300 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <FolderTree className="w-4 h-4" />
                Directory Layer Distribution
              </h4>
              <span className="text-[11px] text-slate-400">LOC per Folder Module</span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full h-72 min-h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.directoryMetrics} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dir" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                  />
                  <Bar
                    dataKey="lines"
                    name="Lines of Code"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationBegin={200}
                  >
                    {metrics.directoryMetrics.map((entry, index) => (
                      <Cell key={`dir-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Export Modal */}
      <GitHubExportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        project={project}
        fileContents={fileContents}
      />
    </motion.div>
  );
};
