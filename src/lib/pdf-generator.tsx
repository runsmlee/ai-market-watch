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
} from '@react-pdf/renderer';

// Define types for the report data
interface DNAMatchReportData {
  companyName: string;
  companyData: any;
  analysisResult: {
    matches: Array<{
      id: string;
      company_name: string;
      category: string;
      similarity_score: number;
      description: string;
      why_similar: string;
      funding_stage: string;
      total_funding: string;
      year_founded: number;
      location: string;
      key_differentiators: string[];
    }>;
    insights: {
      common_patterns: string[];
      market_opportunities: string[];
      potential_competitors: string[];
      potential_partners: string[];
      strategic_recommendations: string[];
    };
    metadata: {
      total_results: number;
      search_timestamp: string;
    };
  };
}

// Register custom fonts if needed
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// });

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#6b7280',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#f97316',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: '#111827',
  },
  matchCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  matchScore: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
  },
  matchCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  matchDescription: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  similarityBox: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  similarityTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  similarityText: {
    fontSize: 10,
    color: '#1e40af',
    lineHeight: 1.4,
  },
  differentiatorItem: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3,
    paddingLeft: 10,
  },
  fundingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  fundingText: {
    fontSize: 10,
    color: '#6b7280',
  },
  insightSection: {
    marginBottom: 20,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  insightItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 15,
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 20,
  },
  metadata: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 30,
  },
});

// PDF Document Component
const DNAMatchReportPDF: React.FC<DNAMatchReportData> = ({
  companyName,
  companyData,
  analysisResult,
}) => {
  const { 
    matches = [], 
    insights = {
      common_patterns: [],
      market_opportunities: [],
      strategic_recommendations: [],
      potential_competitors: [],
      potential_partners: []
    }, 
    metadata = {} 
  } = analysisResult || {};
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.title}>AI Market Watch</Text>
          <Text style={styles.subtitle}>Startup DNA Analysis Report</Text>
          <View style={styles.divider} />
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.subtitle}>{reportDate}</Text>
        </View>
      </Page>

      {/* Matches Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Your DNA Matches</Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
          We found {matches.length} startups with similar DNA patterns to yours.
        </Text>

        {matches.map((match, index) => (
          <View key={match.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchTitle}>
                {index + 1}. {match.company_name}
              </Text>
              <Text style={styles.matchScore}>
                {Math.round(match.similarity_score * 100)}% Match
              </Text>
            </View>
            
            <Text style={styles.matchCategory}>
              {match.category} • Founded {match.year_founded} • {match.location}
            </Text>
            
            <Text style={styles.matchDescription}>{match.description}</Text>
            
            {match.why_similar && (
              <View style={styles.similarityBox}>
                <Text style={styles.similarityTitle}>Why Similar</Text>
                <Text style={styles.similarityText}>{match.why_similar}</Text>
              </View>
            )}
            
            {match.key_differentiators && match.key_differentiators.length > 0 && (
              <View>
                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
                  Key Differentiators:
                </Text>
                {match.key_differentiators.map((diff, idx) => (
                  <Text key={idx} style={styles.differentiatorItem}>
                    • {diff}
                  </Text>
                ))}
              </View>
            )}
            
            <View style={styles.fundingInfo}>
              <Text style={styles.fundingText}>
                Stage: {match.funding_stage || 'N/A'}
              </Text>
              <Text style={styles.fundingText}>
                Total Raised: {match.total_funding || 'N/A'}
              </Text>
            </View>
          </View>
        ))}

        <Text style={styles.pageNumber}>Page 2</Text>
      </Page>

      {/* Insights Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Strategic Insights</Text>

        {/* Common Patterns */}
        {insights.common_patterns && insights.common_patterns.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>📊 Common Success Patterns</Text>
            {insights.common_patterns.map((pattern, index) => (
              <Text key={index} style={styles.insightItem}>
                • {pattern}
              </Text>
            ))}
          </View>
        )}

        {/* Market Opportunities */}
        {insights.market_opportunities && insights.market_opportunities.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>🎯 Market Opportunities</Text>
            {insights.market_opportunities.map((opportunity, index) => (
              <Text key={index} style={styles.insightItem}>
                • {opportunity}
              </Text>
            ))}
          </View>
        )}

        {/* Strategic Recommendations */}
        {insights.strategic_recommendations && insights.strategic_recommendations.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>💡 Strategic Recommendations</Text>
            {insights.strategic_recommendations.map((rec, index) => (
              <Text key={index} style={styles.insightItem}>
                • {rec}
              </Text>
            ))}
          </View>
        )}

        {/* Potential Competitors */}
        {insights.potential_competitors && insights.potential_competitors.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>⚔️ Potential Competitors</Text>
            <Text style={styles.insightItem}>
              {insights.potential_competitors.join(', ')}
            </Text>
          </View>
        )}

        {/* Potential Partners */}
        {insights.potential_partners && insights.potential_partners.length > 0 && (
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>🤝 Potential Partners</Text>
            <Text style={styles.insightItem}>
              {insights.potential_partners.join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.divider} />
        
        <Text style={styles.metadata}>
          Report generated on {reportDate} • Total startups analyzed: {(metadata as any)?.total_results || matches.length}
        </Text>

        <Text style={styles.footer}>
          © 2025 AI Market Watch • ai-market-watch.vercel.app
        </Text>
        
        <Text style={styles.pageNumber}>Page 3</Text>
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