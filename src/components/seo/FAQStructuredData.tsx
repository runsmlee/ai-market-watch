interface FAQItem {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs: FAQItem[];
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema, null, 2),
      }}
    />
  );
}

// Default FAQs for the AI Market Watch platform
export const defaultFAQs: FAQItem[] = [
  {
    question: 'What is AI Market Watch?',
    answer: 'AI Market Watch is a comprehensive intelligence platform that tracks global AI startups, funding rounds, and market trends. We provide real-time insights into the AI ecosystem with detailed company profiles, VC analysis, and investment data.'
  },
  {
    question: 'How many AI startups does AI Market Watch track?',
    answer: 'AI Market Watch tracks over 800+ AI companies across 168 categories with more than $3.2B in total funding tracked. Our database is continuously updated with new companies and funding information.'
  },
  {
    question: 'What information is available for each AI startup?',
    answer: 'Each startup profile includes company description, founding year, team information, funding history, category classification, location, and our proprietary VC analysis scores covering team strength, market potential, technology innovation, and growth metrics.'
  },
  {
    question: 'How is the VC analysis score calculated?',
    answer: 'Our VC analysis score evaluates startups across six key dimensions: Team (25%), Market (20%), Technology (20%), Funding (15%), Growth (10%), and Differentiation (10%). Each metric is scored on a scale of 1-10 based on industry benchmarks and comparative analysis.'
  },
  {
    question: 'Can I filter and search for specific AI startups?',
    answer: 'Yes, AI Market Watch provides advanced filtering options by category, location, funding stage, and team size. You can also use our real-time search feature to find specific companies or technologies.'
  },
  {
    question: 'Is AI Market Watch data updated in real-time?',
    answer: 'Our platform updates company information regularly. Funding data and company profiles are refreshed as new information becomes available from public sources and our data partners.'
  }
];

export default FAQStructuredData;