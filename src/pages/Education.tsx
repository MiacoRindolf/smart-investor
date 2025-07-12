import { BookOpen, Target, TrendingUp, Shield, Brain, Calculator, Award } from 'lucide-react'

const Education = () => {
  const lessons = [
    {
      id: 1,
      title: 'Investment Basics',
      description: 'Learn the fundamentals of investing, including stocks, bonds, and portfolio basics.',
      level: 'Beginner',
      duration: '15 min',
      topics: ['What are stocks?', 'Risk vs Return', 'Investment goals'],
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      title: 'Risk Management',
      description: 'Understand how to manage risk and protect your investments.',
      level: 'Beginner',
      duration: '20 min',
      topics: ['Diversification', 'Stop losses', 'Position sizing'],
      icon: Shield,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      title: 'Technical Analysis',
      description: 'Learn to read charts and identify trading opportunities.',
      level: 'Intermediate',
      duration: '30 min',
      topics: ['Chart patterns', 'Indicators', 'Support & Resistance'],
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      title: 'Fundamental Analysis',
      description: 'Analyze company financials and determine intrinsic value.',
      level: 'Intermediate',
      duration: '25 min',
      topics: ['Financial statements', 'Ratios', 'Valuation methods'],
      icon: Calculator,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 5,
      title: 'Psychology of Trading',
      description: 'Master the mental aspects of successful investing.',
      level: 'Advanced',
      duration: '20 min',
      topics: ['Emotional control', 'Bias recognition', 'Discipline'],
      icon: Brain,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 6,
      title: 'Advanced Strategies',
      description: 'Explore sophisticated investment strategies and techniques.',
      level: 'Advanced',
      duration: '35 min',
      topics: ['Options', 'Derivatives', 'Portfolio optimization'],
      icon: Award,
      color: 'bg-indigo-100 text-indigo-600'
    }
  ]

  const quickTips = [
    {
      title: 'Start with Index Funds',
      description: 'For beginners, index funds offer instant diversification and lower fees.',
      category: 'Getting Started'
    },
    {
      title: 'Dollar-Cost Averaging',
      description: 'Invest a fixed amount regularly to reduce the impact of market volatility.',
      category: 'Strategy'
    },
    {
      title: 'Emergency Fund First',
      description: 'Keep 3-6 months of expenses in savings before investing in stocks.',
      category: 'Financial Planning'
    },
    {
      title: 'Understand What You Buy',
      description: 'Never invest in companies or funds you don\'t understand.',
      category: 'Research'
    }
  ]

  const glossary = [
    { term: 'Bull Market', definition: 'A period of rising stock prices and investor optimism.' },
    { term: 'Bear Market', definition: 'A period of declining stock prices, typically 20% or more from recent highs.' },
    { term: 'P/E Ratio', definition: 'Price-to-Earnings ratio - measures how much investors pay for each dollar of earnings.' },
    { term: 'Market Cap', definition: 'Total value of a company\'s shares (share price × number of shares).' },
    { term: 'Dividend', definition: 'Regular payments made by companies to shareholders from profits.' },
    { term: 'Volatility', definition: 'The degree of variation in a stock\'s price over time.' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Investment Education</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BookOpen className="h-4 w-4" />
          <span>Your journey to smart investing starts here</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Learning Progress</h2>
          <Target className="h-6 w-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100">Lessons Completed</p>
            <p className="text-2xl font-bold">2 / 6</p>
          </div>
          <div>
            <p className="text-blue-100">Current Level</p>
            <p className="text-2xl font-bold">Beginner</p>
          </div>
          <div>
            <p className="text-blue-100">Study Time</p>
            <p className="text-2xl font-bold">35 min</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-blue-100 mb-1">
            <span>Progress</span>
            <span>33%</span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>
      </div>

      {/* Lesson Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${lesson.color}`}>
                  <lesson.icon className="h-6 w-6" />
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lesson.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    lesson.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lesson.level}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    {lesson.duration}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Topics covered:</p>
                <ul className="text-sm text-gray-600">
                  {lesson.topics.map((topic, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full mt-4 btn-primary">
                {lesson.id <= 2 ? 'Continue Learning' : 'Start Lesson'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickTips.map((tip, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-yellow-200 rounded-full">
                  <span className="text-yellow-800 text-xs font-bold">💡</span>
                </div>
                <div>
                  <p className="font-semibold text-yellow-900">{tip.title}</p>
                  <p className="text-yellow-800 text-sm mt-1">{tip.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">
                    {tip.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glossary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Glossary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossary.map((item, index) => (
            <div key={index} className="border-l-4 border-primary-500 pl-4">
              <h3 className="font-semibold text-gray-900">{item.term}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Important Risk Disclaimer</h3>
            <p className="text-red-800 mb-3">
              All investments carry risk, including the potential loss of principal. Past performance does not guarantee future results.
            </p>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• Never invest money you cannot afford to lose</li>
              <li>• Diversify your investments across different asset classes</li>
              <li>• Consider your risk tolerance and investment timeline</li>
              <li>• Consult with a financial advisor for personalized advice</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Education 