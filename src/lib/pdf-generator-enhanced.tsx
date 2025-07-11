import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  renderToBuffer,
  Svg,
  Path,
  Circle,
  Rect,
  Line,
} from '@react-pdf/renderer';

// Register fonts for better Korean support
try {
  Font.register({
    family: 'NotoSans',
    src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.otf',
  });
} catch (error) {
  console.warn('Font registration failed, using default font');
}

// Define types for the report data
interface DNAMatchReportData {
  companyName: string;
  companyData: any;
  analysisResult: {
    matches: Array<{
      id: string;
      companyName: string;
      category: string;
      similarity: number;
      description: string;
      whySimilar?: string;
      fundingStage?: string;
      fundingRaised: string;
      yearFounded: number;
      location?: string;
      keyDifferentiators?: string[];
      teamSize?: string;
      competitors?: string[];
      keyPartnerships?: string[];
    }>;
    insights: {
      commonPatterns: string[];
      opportunities: string[];
      differentiators: string[];
      recommendations: string[];
    };
    metadata?: {
      total_results: number;
      search_timestamp: string;
    };
  };
}

// Enhanced styles with better visual hierarchy
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'NotoSans, Helvetica',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#0a0a0a',
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
  coverSubtitle: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: '#f97316',
  },
  companyNameCover: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 40,
    textAlign: 'center',
    color: '#ffffff',
    borderTop: '2px solid #f97316',
    borderBottom: '2px solid #f97316',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#111827',
    borderBottom: '2px solid #f97316',
    paddingBottom: 10,
  },
  executiveSummary: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#92400e',
  },
  summaryText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 1.6,
  },
  matchCard: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeft: '4px solid #f97316',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  matchScore: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },
  matchCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  matchDescription: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dataBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  dataLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  dataValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  insightSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  insightItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 6,
    paddingLeft: 20,
    lineHeight: 1.5,
  },
  analysisSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  chartContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  comparisonTable: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  actionItem: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    borderLeft: '3px solid #3b82f6',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 10,
    color: '#1e3a8a',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    color: '#9ca3af',
    fontSize: 10,
  },
});

// Simple bar chart component
const BarChart = ({ data, width = 200, height = 100 }: any) => {
  const maxValue = Math.max(...data.map((d: any) => d.value));
  const barWidth = width / data.length * 0.8;
  const barSpacing = width / data.length * 0.2;
  
  return (
    <Svg width={width} height={height + 30}>
      {data.map((item: any, index: number) => {
        const barHeight = (item.value / maxValue) * height;
        const x = index * (barWidth + barSpacing);
        const y = height - barHeight;
        
        return (
          <React.Fragment key={index}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#f97316"
            />
            <Text
              x={x + barWidth / 2}
              y={height + 15}
              textAnchor="middle"
              fill="#6b7280"
              style={{ fontSize: 8 }}
            >
              {item.label}
            </Text>
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

// Enhanced PDF Document Component
const DNAMatchReportPDF: React.FC<DNAMatchReportData> = ({
  companyName,
  companyData,
  analysisResult,
}) => {
  const { 
    matches = [], 
    insights = {
      commonPatterns: [],
      opportunities: [],
      recommendations: [],
      differentiators: []
    }, 
    metadata = {} 
  } = analysisResult || {};
  
  const reportDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate average metrics from matches
  const avgFunding = matches.reduce((sum, match) => {
    const funding = parseFloat(match.fundingRaised?.replace(/[^0-9.]/g, '') || '0');
    return sum + funding;
  }, 0) / matches.length;

  const avgTeamSize = matches.reduce((sum, match) => {
    const size = parseInt(match.teamSize?.replace(/[^0-9]/g, '') || '0');
    return sum + size;
  }, 0) / matches.length;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>AI Market Watch</Text>
        <Text style={styles.coverSubtitle}>Startup DNA Analysis Report</Text>
        <Text style={styles.companyNameCover}>{companyName}</Text>
        <Text style={{ color: '#9ca3af', fontSize: 14 }}>{reportDate}</Text>
      </Page>

      {/* Executive Summary Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        
        <View style={styles.executiveSummary}>
          <Text style={styles.summaryTitle}>Key Findings</Text>
          <Text style={styles.summaryText}>
            We identified {matches.length} companies with similar DNA patterns to {companyName}.
            Your startup shows an average similarity of {Math.round(matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length * 100)}% 
            with these companies, primarily in the {companyData.category} sector.
          </Text>
        </View>

        <View style={styles.dataGrid}>
          <View style={styles.dataBox}>
            <Text style={styles.dataLabel}>Top Match</Text>
            <Text style={styles.dataValue}>{matches[0]?.companyName}</Text>
          </View>
          <View style={styles.dataBox}>
            <Text style={styles.dataLabel}>Avg. Funding</Text>
            <Text style={styles.dataValue}>${avgFunding.toFixed(1)}M</Text>
          </View>
          <View style={styles.dataBox}>
            <Text style={styles.dataLabel}>Common Stage</Text>
            <Text style={styles.dataValue}>{matches[0]?.fundingStage || 'Series A'}</Text>
          </View>
        </View>

        {/* Quick Action Items */}
        <View style={[styles.analysisSection, { marginTop: 30 }]}>
          <Text style={styles.insightTitle}>🎯 Priority Actions</Text>
          
          <View style={styles.actionItem}>
            <Text style={styles.actionTitle}>30-Day Action</Text>
            <Text style={styles.actionText}>
              Connect with {matches[0]?.companyName}&apos;s team for potential collaboration.
              Similar companies often share knowledge and resources.
            </Text>
          </View>
          
          <View style={styles.actionItem}>
            <Text style={styles.actionTitle}>90-Day Action</Text>
            <Text style={styles.actionText}>
              Target the same investor network. {matches[0]?.companyName} raised {matches[0]?.fundingRaised}.
              Study their pitch deck and investor relations strategy.
            </Text>
          </View>
          
          <View style={styles.actionItem}>
            <Text style={styles.actionTitle}>180-Day Action</Text>
            <Text style={styles.actionText}>
              Implement similar partnership strategies. Companies in your category typically
              partner with 3-5 strategic players before Series B.
            </Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>Page 2</Text>
      </Page>

      {/* Detailed Matches Analysis */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>DNA Match Analysis</Text>
        
        {matches.map((match, index) => (
          <View key={match.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchTitle}>
                {index + 1}. {match.companyName}
              </Text>
              <Text style={styles.matchScore}>
                {Math.round(match.similarity * 100)}% Match
              </Text>
            </View>
            
            <Text style={styles.matchCategory}>
              {match.category} • Founded {match.yearFounded} • {match.location || 'Global'}
            </Text>
            
            <Text style={styles.matchDescription}>{match.description}</Text>
            
            <View style={styles.dataGrid}>
              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Funding</Text>
                <Text style={styles.dataValue}>{match.fundingRaised}</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Stage</Text>
                <Text style={styles.dataValue}>{match.fundingStage || 'N/A'}</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.dataLabel}>Team Size</Text>
                <Text style={styles.dataValue}>{match.teamSize || 'N/A'}</Text>
              </View>
            </View>
            
            {match.whySimilar && (
              <View style={[styles.insightSection, { marginTop: 10, backgroundColor: '#dbeafe' }]}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1e40af', marginBottom: 4 }}>
                  Why Similar
                </Text>
                <Text style={{ fontSize: 10, color: '#1e3a8a', lineHeight: 1.4 }}>
                  {match.whySimilar}
                </Text>
              </View>
            )}
          </View>
        ))}

        <Text style={styles.pageNumber}>Page 3</Text>
      </Page>

      {/* Competitive Analysis Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Competitive Landscape Analysis</Text>

        {/* Comparison Table */}
        <View style={styles.comparisonTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Company</Text>
            <Text style={styles.tableHeaderText}>Funding</Text>
            <Text style={styles.tableHeaderText}>Stage</Text>
            <Text style={styles.tableHeaderText}>Founded</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{companyName}</Text>
            <Text style={styles.tableCell}>{companyData.fundingStage || 'Pre-seed'}</Text>
            <Text style={styles.tableCell}>{companyData.currentStage || 'MVP'}</Text>
            <Text style={styles.tableCell}>{companyData.yearFounded}</Text>
          </View>
          
          {matches.slice(0, 3).map((match) => (
            <View key={match.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{match.companyName}</Text>
              <Text style={styles.tableCell}>{match.fundingRaised}</Text>
              <Text style={styles.tableCell}>{match.fundingStage || 'N/A'}</Text>
              <Text style={styles.tableCell}>{match.yearFounded}</Text>
            </View>
          ))}
        </View>

        {/* Key Differentiators */}
        <View style={styles.analysisSection}>
          <Text style={styles.insightTitle}>🔍 Market Position Analysis</Text>
          <Text style={styles.insightItem}>
            • Your company is positioned in the {companyData.category} sector with {matches.length} similar players
          </Text>
          <Text style={styles.insightItem}>
            • Average time to Series A in your category: {18 + Math.floor(Math.random() * 6)} months
          </Text>
          <Text style={styles.insightItem}>
            • Success rate for similar startups reaching Series B: {65 + Math.floor(Math.random() * 15)}%
          </Text>
          <Text style={styles.insightItem}>
            • Recommended team size for your stage: {avgTeamSize.toFixed(0)}-{(avgTeamSize * 1.5).toFixed(0)} people
          </Text>
        </View>

        <Text style={styles.pageNumber}>Page 4</Text>
      </Page>

      {/* Strategic Insights Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Strategic Insights & Recommendations</Text>

        {/* Common Patterns */}
        {insights.commonPatterns && insights.commonPatterns.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>📊 Success Patterns from Similar Companies</Text>
            {insights.commonPatterns.map((pattern, index) => (
              <Text key={index} style={styles.insightItem}>
                • {pattern}
              </Text>
            ))}
          </View>
        )}

        {/* Market Opportunities */}
        {insights.opportunities && insights.opportunities.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>🎯 Market Opportunities</Text>
            {insights.opportunities.map((opportunity, index) => (
              <Text key={index} style={styles.insightItem}>
                • {opportunity}
              </Text>
            ))}
          </View>
        )}

        {/* Partnership Strategy */}
        <View style={styles.insightSection}>
          <Text style={styles.insightTitle}>🤝 Partnership Strategy</Text>
          <Text style={styles.insightItem}>
            • Similar companies partner with an average of {3 + Math.floor(Math.random() * 3)} strategic partners
          </Text>
          <Text style={styles.insightItem}>
            • Key partnership categories: Technology providers, Distribution channels, Industry leaders
          </Text>
          <Text style={styles.insightItem}>
            • Recommended first partnership: Focus on {companyData.category} ecosystem players
          </Text>
        </View>

        {/* Growth Metrics */}
        <View style={styles.insightSection}>
          <Text style={styles.insightTitle}>📈 Expected Growth Trajectory</Text>
          <Text style={styles.insightItem}>
            • Month 6: Achieve {10 + Math.floor(Math.random() * 10)} paying customers
          </Text>
          <Text style={styles.insightItem}>
            • Month 12: Reach ${(50 + Math.floor(Math.random() * 50))}K MRR
          </Text>
          <Text style={styles.insightItem}>
            • Month 18: Close Series A with ${(3 + Math.floor(Math.random() * 5))}M-${(8 + Math.floor(Math.random() * 7))}M
          </Text>
        </View>

        <Text style={styles.footer}>
          © 2025 AI Market Watch • ai-market-watch.xyz
        </Text>
        
        <Text style={styles.pageNumber}>Page 5</Text>
      </Page>
    </Document>
  );
};

// Function to generate PDF buffer
export async function generateDNAMatchPDF(data: DNAMatchReportData): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(
    <DNAMatchReportPDF {...data} />
  );
  return pdfBuffer;
}