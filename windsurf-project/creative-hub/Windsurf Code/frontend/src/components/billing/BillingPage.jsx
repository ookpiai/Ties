import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../../App'
import { 
  CreditCard,
  Crown,
  Star,
  Check,
  X,
  Calendar,
  DollarSign,
  Receipt,
  Download,
  Settings,
  AlertCircle,
  Shield,
  Zap,
  Users,
  Folder,
  MessageCircle,
  BarChart3,
  Globe,
  Lock,
  Smartphone,
  Mail,
  FileText,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Percent,
  Calculator,
  Banknote,
  Wallet
} from 'lucide-react'

const BillingPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('subscription')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [showCardForm, setShowCardForm] = useState(false)

  // Mock subscription data
  const [currentSubscription, setCurrentSubscription] = useState({
    plan: 'TIES Pro',
    status: 'active',
    nextBilling: '2024-02-25T00:00:00Z',
    amount: 29,
    cycle: 'monthly',
    features: ['Advanced search filters', 'Priority support', 'Enhanced profile', 'Basic analytics'],
    startDate: '2024-01-25T00:00:00Z'
  })

  // Subscription plans
  const plans = [
    {
      id: 'free',
      name: 'TIES Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started with creative collaboration',
      features: [
        'Basic profile creation',
        'Browse and discover creatives',
        'Send up to 10 messages per month',
        'Apply to unlimited jobs',
        'Basic portfolio showcase',
        'Community access'
      ],
      limitations: [
        'Limited messaging',
        'No advanced filters',
        'Basic support only',
        'No analytics'
      ],
      popular: false,
      color: 'gray'
    },
    {
      id: 'ties-pro',
      name: 'TIES Pro',
      price: { monthly: 29, yearly: 290 },
      description: 'Enhanced features for active creative professionals',
      features: [
        'Everything in TIES Free',
        'Unlimited messaging',
        'Advanced search filters',
        'Priority support',
        'Enhanced profile customization',
        'Basic analytics dashboard',
        'Featured profile boost (1x/month)',
        'Project collaboration tools',
        'Client management system'
      ],
      limitations: [
        'Limited team collaboration',
        'Basic project management',
        'Standard commission rates'
      ],
      popular: true,
      color: 'blue'
    },
    {
      id: 'studio-pro',
      name: 'Studio Pro',
      price: { monthly: 79, yearly: 790 },
      description: 'Complete solution for creative teams and agencies',
      features: [
        'Everything in TIES Pro',
        'Unlimited team collaboration',
        'Advanced project management',
        'White-label client portals',
        'Advanced analytics & reporting',
        'Custom integrations',
        'Reduced commission rates (3% vs 5%)',
        'Priority job placement',
        'Dedicated account manager',
        'Custom branding options',
        'API access',
        'Advanced security features'
      ],
      limitations: [],
      popular: false,
      color: 'purple'
    }
  ]

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      brand: 'mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ])

  // Mock billing history
  const [billingHistory, setBillingHistory] = useState([
    {
      id: 'inv_001',
      date: '2024-01-25T00:00:00Z',
      amount: 29.00,
      status: 'paid',
      description: 'TIES Pro - Monthly Subscription',
      downloadUrl: '#'
    },
    {
      id: 'inv_002',
      date: '2023-12-25T00:00:00Z',
      amount: 29.00,
      status: 'paid',
      description: 'TIES Pro - Monthly Subscription',
      downloadUrl: '#'
    },
    {
      id: 'inv_003',
      date: '2023-11-25T00:00:00Z',
      amount: 29.00,
      status: 'paid',
      description: 'TIES Pro - Monthly Subscription',
      downloadUrl: '#'
    },
    {
      id: 'comm_001',
      date: '2024-01-20T00:00:00Z',
      amount: 75.00,
      status: 'paid',
      description: 'Commission - Brand Identity Project',
      downloadUrl: '#'
    },
    {
      id: 'comm_002',
      date: '2024-01-15T00:00:00Z',
      amount: 140.00,
      status: 'pending',
      description: 'Commission - Video Production Project',
      downloadUrl: null
    }
  ])

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `£${amount.toFixed(2)}`
  }

  // Get plan color
  const getPlanColor = (color) => {
    const colors = {
      gray: 'border-gray-200 bg-gray-50',
      blue: 'border-blue-200 bg-blue-50',
      purple: 'border-purple-200 bg-purple-50'
    }
    return colors[color] || colors.gray
  }

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Get card brand icon
  const getCardBrandIcon = (brand) => {
    // In a real app, you'd use actual card brand icons
    return <CreditCard className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subscription
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'plans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Plans & Pricing
              </button>
              <button
                onClick={() => setActiveTab('payment-methods')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment-methods'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('billing-history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'billing-history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Billing History
              </button>
            </nav>
          </div>
        </div>

        {/* Current Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <span>Current Subscription</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{currentSubscription.plan}</h3>
                    <p className="text-gray-600">
                      {formatCurrency(currentSubscription.amount)}/{currentSubscription.cycle}
                    </p>
                  </div>
                  <Badge className={getStatusColor(currentSubscription.status)}>
                    {currentSubscription.status}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Next Billing Date</Label>
                    <p className="text-sm">{formatDate(currentSubscription.nextBilling)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Subscription Start</Label>
                    <p className="text-sm">{formatDate(currentSubscription.startDate)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Included Features</Label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {currentSubscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => setActiveTab('plans')}>
                    Upgrade Plan
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage & Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span>Usage This Month</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Messages Sent</span>
                      <span className="text-sm text-gray-600">Unlimited</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">127 messages sent</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Profile Boosts</span>
                      <span className="text-sm text-gray-600">1 / 1</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">1 boost used this month</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Projects</span>
                      <span className="text-sm text-gray-600">Unlimited</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">3 active projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans & Pricing Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'font-medium' : 'text-gray-600'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'font-medium' : 'text-gray-600'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <Badge className="bg-green-100 text-green-800">Save 17%</Badge>
              )}
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${getPlanColor(plan.color)} ${
                    plan.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {formatCurrency(plan.price[billingCycle])}
                      </span>
                      <span className="text-gray-600">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.limitations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button 
                      className="w-full mt-6"
                      variant={currentSubscription.plan === plan.name ? "outline" : "default"}
                      disabled={currentSubscription.plan === plan.name}
                    >
                      {currentSubscription.plan === plan.name ? 'Current Plan' : 
                       plan.price[billingCycle] === 0 ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Commission Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Percent className="w-5 h-5 text-purple-600" />
                  <span>Commission Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="font-semibold">TIES Free</h3>
                    <div className="text-2xl font-bold text-gray-600 mt-2">5%</div>
                    <p className="text-sm text-gray-600">Standard commission on all bookings</p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">TIES Pro</h3>
                    <div className="text-2xl font-bold text-blue-600 mt-2">5%</div>
                    <p className="text-sm text-gray-600">Standard commission on all bookings</p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Studio Pro</h3>
                    <div className="text-2xl font-bold text-purple-600 mt-2">3%</div>
                    <p className="text-sm text-gray-600">Reduced commission on all bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Payment Methods</h2>
              <Button onClick={() => setShowCardForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCardBrandIcon(method.brand)}
                        <div>
                          <div className="font-medium">
                            •••• •••• •••• {method.last4}
                          </div>
                          <div className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Card Form */}
            {showCardForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input id="cardName" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryMonth">Expiry Month</Label>
                      <Input id="expiryMonth" placeholder="MM" />
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">Expiry Year</Label>
                      <Input id="expiryYear" placeholder="YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button>Add Payment Method</Button>
                    <Button variant="outline" onClick={() => setShowCardForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'billing-history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Billing History</h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {billingHistory.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.downloadUrl && (
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default BillingPage

