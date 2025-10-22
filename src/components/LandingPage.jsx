import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Search, 
  Star, 
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: Search,
      title: 'Smart Discovery',
      description: 'Find the perfect creative professionals for your projects with our intelligent search and filtering system.'
    },
    {
      icon: Calendar,
      title: 'Seamless Booking',
      description: 'Book talent, venues, and services with our streamlined booking system. No more scattered DMs or spreadsheets.'
    },
    {
      icon: MessageCircle,
      title: 'Unified Communication',
      description: 'Keep all project communication in one place with threaded messaging and real-time notifications.'
    },
    {
      icon: Users,
      title: 'TIES Studio',
      description: 'Collaborate on complex projects with task management, file sharing, and budget tracking tools.'
    }
  ]

  const userTypes = [
    {
      title: 'Freelancers',
      description: 'Showcase your work, get discovered, and manage bookings professionally.',
      benefits: ['Professional portfolio', 'Booking management', 'Secure payments', 'Pro features available']
    },
    {
      title: 'Organisers',
      description: 'Find talent, manage events, and collaborate with your team seamlessly.',
      benefits: ['Talent discovery', 'Project management', 'Team collaboration', 'Budget tracking']
    },
    {
      title: 'Venues',
      description: 'List your space and connect with event organisers and creative teams.',
      benefits: ['Space listings', 'Booking calendar', 'Direct communication', 'Verified bookings']
    },
    {
      title: 'Vendors',
      description: 'Offer your services and equipment to the creative community.',
      benefits: ['Service listings', 'Equipment rental', 'Professional network', 'Reliable payments']
    }
  ]

  const stats = [
    { number: '715K+', label: 'Creative Professionals in Australia' },
    { number: '150K+', label: 'Digitally Engaged Users' },
    { number: '73%', label: 'Adopted Digital Tools Last Year' },
    { number: '58%', label: 'Report Better Collaboration' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Where Creatives
              <span className="text-primary block">Come Together</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              TIES Together is the all-in-one platform for creative professionals. 
              Discover talent, book services, collaborate on projects, and get paid reliably — all in one space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop juggling multiple tools. TIES Together brings discovery, booking, 
              and collaboration into one seamless experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Creative Professional
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a freelancer, organiser, venue, or vendor, 
              TIES Together has the tools you need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {type.description}
                </p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Basic profile & portfolio
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Discovery & search
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Basic messaging
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  10% booking commission
                </li>
              </ul>
              <Button variant="outline" className="w-full">Get Started</Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary text-white p-8 rounded-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">TIES Pro</h3>
              <div className="text-3xl font-bold mb-4">$15<span className="text-lg">/month</span></div>
              <p className="text-blue-100 mb-6">For active freelancers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-200 mr-2" />
                  Everything in Free
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-200 mr-2" />
                  8% booking commission
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-200 mr-2" />
                  Priority placement
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-200 mr-2" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-200 mr-2" />
                  No ads
                </li>
              </ul>
              <Button variant="secondary" className="w-full">Upgrade to Pro</Button>
            </div>

            {/* Studio Pro Plan */}
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Studio Pro</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$30<span className="text-lg">/month</span></div>
              <p className="text-gray-600 mb-6">For organisers & teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Everything in Pro
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited projects
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Team collaboration
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Budget tracking
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  File management
                </li>
              </ul>
              <Button variant="outline" className="w-full">Get Studio Pro</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Creative Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creative professionals who are already using TIES Together 
            to discover, book, and collaborate more effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Free Today
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold">TIES Together</span>
            </div>
            <p className="text-gray-400 mb-4">
              The creative collaboration platform built by creatives, for creatives.
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 TIES Together. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

