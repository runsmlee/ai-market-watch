// Direct test of email sending functionality
const { generateDNAMatchPDF } = require('../src/lib/pdf-generator');
const { sendDNAMatchEmail, createDNAMatchEmailTemplate } = require('../src/lib/email');
require('dotenv').config({ path: '.env.local' });

// Test data
const testData = {
  companyName: 'Patenty AI',
  formData: {
    companyName: 'Patenty AI',
    description: 'AI-powered patent solution for legal tech',
    category: 'Legal Tech',
    problem: 'Patent filing is time-consuming and expensive',
    solution: 'AI automation for patent research and filing'
  },
  analysisResult: {
    matches: [
      {
        company_name: "Solve Intelligence",
        category: "Legal Tech / IP",
        similarity_score: 0.95,
        description: "AI-powered patent workflow automation",
        total_funding: "$15M",
        year_founded: 2023
      },
      {
        company_name: "&AI",
        category: "AI Agents",
        similarity_score: 0.93,
        description: "AI assistant for patent attorneys",
        total_funding: "$6.5M",
        year_founded: 2024
      },
      {
        company_name: "Atria AI",
        category: "Legal AI",
        similarity_score: 0.90,
        description: "AI tools for legal workflows",
        total_funding: "£720K",
        year_founded: 2023
      }
    ],
    insights: {
      common_patterns: ["AI for legal automation", "Patent focus"],
      market_opportunities: ["Growing legal tech market"],
      strategic_recommendations: ["Focus on patent quality"]
    },
    metadata: {
      total_results: 3
    }
  }
};

async function testDirectEmail() {
  console.log('🧪 Testing Direct Email Send\n');
  
  try {
    // 1. Generate PDF
    console.log('📄 Generating PDF...');
    const pdfBuffer = await generateDNAMatchPDF({
      companyName: testData.companyName,
      companyData: testData.formData,
      analysisResult: testData.analysisResult
    });
    console.log('✅ PDF generated successfully! Size:', (pdfBuffer.length / 1024).toFixed(2), 'KB');
    
    // 2. Create email HTML
    console.log('\n📧 Creating email template...');
    const emailHtml = createDNAMatchEmailTemplate({
      companyName: testData.companyName,
      topMatches: testData.analysisResult.matches.map(m => ({
        companyName: m.company_name,
        similarity: m.similarity_score,
        category: m.category
      }))
    });
    console.log('✅ Email template created!');
    
    // 3. Send email
    console.log('\n📮 Sending email...');
    const result = await sendDNAMatchEmail({
      to: 'runsmlee@gmail.com',
      subject: `Your AI Startup DNA Analysis Report - ${testData.companyName}`,
      html: emailHtml,
      attachments: [{
        filename: `${testData.companyName}-DNA-Analysis.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Email sending failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testDirectEmail();