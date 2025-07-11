// Test script for DNA match email flow
require('dotenv').config({ path: '.env.local' });

// Sample test data that mimics n8n response
const testData = {
  email: 'runsmlee@gmail.com',
  formData: {
    companyName: 'Test Startup',
    description: 'AI-powered solution for automated testing',
    category: 'AI Infrastructure',
    problem: 'Manual testing is time-consuming and error-prone',
    solution: 'We use AI to automate testing workflows',
    targetMarket: 'Software development teams',
    businessModel: 'SaaS subscription',
    teamSize: '10-50',
    fundingStage: 'Series A',
    location: 'San Francisco, CA',
    yearFounded: '2023'
  },
  analysisResult: [
    {
      output: {
        query_summary: "AI-powered testing automation solution",
        matches: [
          {
            id: "123",
            company_name: "TestAI Corp",
            category: "AI Infrastructure",
            similarity_score: 0.92,
            description: "AI-driven test automation platform for enterprise software teams",
            why_similar: "Both companies focus on AI-powered testing automation with similar target markets",
            funding_stage: "Series B",
            total_funding: "$25 million",
            year_founded: 2022,
            location: "New York, NY",
            key_differentiators: [
              "Enterprise-grade security features",
              "Integration with major CI/CD platforms"
            ]
          },
          {
            id: "456",
            company_name: "AutoTest AI",
            category: "Developer Tools",
            similarity_score: 0.88,
            description: "Automated testing solution using machine learning",
            why_similar: "Similar approach to test automation using AI/ML technologies",
            funding_stage: "Seed",
            total_funding: "$5 million",
            year_founded: 2023,
            location: "Austin, TX",
            key_differentiators: [
              "Focus on mobile app testing",
              "No-code test creation"
            ]
          },
          {
            id: "789",
            company_name: "QA Intelligence",
            category: "AI Infrastructure",
            similarity_score: 0.85,
            description: "Intelligent QA platform for continuous testing",
            why_similar: "Both leverage AI for quality assurance and testing workflows",
            funding_stage: "Series A",
            total_funding: "$15 million",
            year_founded: 2021,
            location: "Seattle, WA",
            key_differentiators: [
              "Predictive bug detection",
              "Real-time performance monitoring"
            ]
          }
        ],
        insights: {
          common_patterns: [
            "AI/ML-driven approach to testing automation",
            "Focus on developer productivity and efficiency",
            "SaaS business model with subscription pricing"
          ],
          market_opportunities: [
            "Growing demand for AI-powered developer tools",
            "Shift towards continuous testing in DevOps",
            "Enterprise adoption of automated QA solutions"
          ],
          potential_competitors: [
            "Testim.io",
            "Mabl",
            "Applitools",
            "Functionize"
          ],
          potential_partners: [
            "GitHub",
            "GitLab",
            "CircleCI",
            "Jenkins"
          ],
          strategic_recommendations: [
            "Differentiate with unique AI capabilities or vertical focus",
            "Build strong integrations with popular development tools",
            "Focus on enterprise security and compliance features"
          ]
        },
        metadata: {
          total_results: 3,
          reranked_results: 3,
          search_timestamp: new Date().toISOString()
        }
      }
    }
  ]
};

async function testEmailFlow() {
  console.log('🧪 Testing DNA Match Email Flow\n');
  
  try {
    // Make API call to send-dna-report endpoint
    const response = await fetch('http://localhost:3000/api/send-dna-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Failed to send email');
      console.error('Error:', result);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Check if the server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/startups');
    if (response.ok) {
      console.log('✅ Server is running\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please run: npm run dev\n');
    return false;
  }
}

// Run the test
(async () => {
  if (await checkServer()) {
    await testEmailFlow();
  }
})();