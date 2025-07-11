// Test script to send DNA report email with real data
const testData = {
  email: "runsmlee@gmail.com", // Your email
  formData: {
    companyName: "SoulCanvas",
    description: "AI-powered digital art therapy platform that transforms personal emotions into visual artwork while providing emotional support and community connection",
    category: "Healthcare AI",
    problem: "Many people struggle with loneliness and unexpressed feelings, lacking safe spaces for emotional expression",
    solution: "We provide an AI art generation platform that converts emotions into artwork, combined with community features and emotional support tools",
    targetMarket: "Young adults dealing with stress, anxiety, and emotional wellness",
    businessModel: "Subscription-based with freemium model",
    teamSize: "5-10",
    fundingStage: "Pre-seed",
    location: "San Francisco, CA",
    yearFounded: "2023"
  },
  analysisResult: {
    matches: [
      {
        id: "97",
        companyName: "SoulCanvas",
        similarity: 0.99,
        category: "Healthcare AI",
        description: "AI-powered digital art therapy platform that transforms personal emotions into visual artwork while providing emotional support and community connection",
        fundingRaised: "Information not publicly available",
        yearFounded: 2023,
        whySimilar: "This is the user's own startup, providing a direct and perfect match as it aligns completely with the described purpose of emotional expression through AI art and community connection to address loneliness.",
        keyDifferentiators: [
          "Integration of AI art generation with mental health support and community features",
          "AI technology that converts emotional inputs into artistic expressions with therapeutic benefits",
          "Unique combination of AI art generation and emotional support, distinct from traditional meditation or therapy apps"
        ],
        fundingStage: "Pre-seed",
        location: "San Francisco, CA",
        teamSize: "5-10"
      },
      {
        id: "725",
        companyName: "Midjourney, Inc.",
        similarity: 0.85,
        category: "Generative AI",
        description: "An independent research lab producing an AI program that creates high-quality, artistic images from natural language prompts.",
        fundingRaised: "$0",
        yearFounded: 2021,
        whySimilar: "Midjourney is a leading generative AI company focused on creating high-quality artistic images from text prompts. It is similar in its core use of AI for art generation and its community aspect, though its primary focus is on broader creative art rather than emotional expression or therapy.",
        keyDifferentiators: [
          "Superior quality in artistic output and community engagement",
          "Community-driven feedback loop for rapid product iteration",
          "Self-funded, maintaining full autonomy"
        ],
        fundingStage: "Self-funded",
        location: "San Francisco, CA",
        teamSize: "11-50"
      },
      {
        id: "Portola-Company",
        companyName: "Portola",
        similarity: 0.87,
        category: "Generative AI",
        description: "A generative AI-powered virtual alien friend designed to foster personal growth and emotional support through engaging companionship.",
        fundingRaised: "$10 million",
        yearFounded: 2024,
        whySimilar: "Portola provides a generative AI-powered virtual companion for personal growth and emotional support, directly addressing loneliness and fostering a judgment-free space for users to explore feelings. This aligns strongly with SoulCanvas's goal of using AI to address unexpressed feelings and connect people for emotional well-being.",
        keyDifferentiators: [
          "Blends advanced generative AI with a whimsical 'alien' persona to reduce the stigma of seeking support, using narrative design to foster deep user attachment.",
          "Proprietary fine-tuning on empathy-driven dialogue datasets and real-time adaptive learning for nuanced emotional responses; strong focus on privacy-preserving personalization.",
          "Consumer-first wellness and entertainment tool focused on building deep, supportive user-AI relationships."
        ],
        fundingStage: "Seed",
        location: "New York, NY",
        teamSize: "11-50",
        keyPartnerships: ["Mental health organizations", "AI research labs"]
      }
    ],
    insights: {
      commonPatterns: [
        "Leveraging Generative AI for creative expression and emotional well-being.",
        "Focus on mental health support and addressing loneliness through technology.",
        "Building communities around shared creative or emotional experiences.",
        "Utilizing AI for personalized user interaction and content generation."
      ],
      differentiators: [],
      opportunities: [
        "Niche in AI-powered art therapy and emotional intelligence.",
        "Expansion into broader digital wellness and mental health sectors.",
        "Developing more interactive and empathetic AI companions/tools.",
        "Gamification of emotional expression and self-improvement."
      ],
      recommendations: [
        "Emphasize the unique blend of AI art, emotional expression, and community to differentiate from broader mental health or AI art apps.",
        "Focus on user data privacy and ethical AI development, especially given the sensitive nature of emotional data.",
        "Explore partnerships with mental health professionals or institutions to validate therapeutic benefits and gain credibility.",
        "Consider diverse art styles and generative capabilities to appeal to a wider audience and emotional range."
      ]
    },
    metadata: {
      total_results: 3,
      search_timestamp: new Date().toISOString()
    }
  }
};

// Send the request to the API endpoint
async function sendTestEmail() {
  try {
    console.log('Sending DNA report email to:', testData.email);
    console.log('Company:', testData.formData.companyName);
    
    const response = await fetch('http://localhost:3001/api/send-dna-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      console.log('Response text:', text.substring(0, 200) + '...');
      result = { error: 'Non-JSON response' };
    }
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Result:', result);
    } else {
      console.error('❌ Failed to send email:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
sendTestEmail();