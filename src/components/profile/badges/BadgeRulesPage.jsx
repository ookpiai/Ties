/**
 * Badge Rules Page
 *
 * Dedicated page explaining the badge system per badge.md spec:
 * - Why badges exist
 * - How they are automatically awarded
 * - Per-badge breakdown with requirements and rewards
 * - "How to Succeed on TIES Together" section
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ShieldCheck,
  Image,
  Zap,
  CheckCircle,
  Star,
  DollarSign,
  Crown,
  ArrowRight,
  Sparkles,
  Target,
  Gift,
  Award,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { SPEC_BADGE_INFO, SPEC_BADGES_ORDER } from '../../../api/badges'

// Icon mapping
const BADGE_ICONS = {
  ShieldCheck,
  Image,
  Zap,
  CheckCircle,
  Star,
  DollarSign,
  Crown,
}

// Success steps that map to badges
const SUCCESS_STEPS = [
  {
    step: 1,
    badge: 'verified',
    action: 'Verify your profile',
    description: 'Complete ID verification, confirm your email and phone, and fill out your profile.',
    icon: ShieldCheck,
  },
  {
    step: 2,
    badge: 'portfolio',
    action: 'Build your portfolio',
    description: 'Upload 5+ strong projects to showcase your work and attract clients.',
    icon: Image,
  },
  {
    step: 3,
    badge: 'activity',
    action: 'Stay active',
    description: 'Complete at least one job each month to keep your Activity badge.',
    icon: Zap,
  },
  {
    step: 4,
    badge: 'completion',
    action: 'Deliver reliably',
    description: 'Complete 5+ jobs on time and dispute-free to earn the Completion badge.',
    icon: CheckCircle,
  },
  {
    step: 5,
    badge: 'quality',
    action: 'Aim for excellence',
    description: 'Maintain a 4.5+ star rating across 5+ reviews for the Quality badge.',
    icon: Star,
  },
  {
    step: 6,
    badge: 'earnings',
    action: 'Hit your milestone',
    description: 'Earn $1,000 on the platform to unlock the Earnings badge.',
    icon: DollarSign,
  },
  {
    step: 7,
    badge: 'ties_pro',
    action: 'Go Pro',
    description: 'Upgrade to TIES Pro for premium visibility and exclusive features.',
    icon: Crown,
  },
]

export const BadgeRulesPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Award className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">
          Badge Rules & How to Succeed
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          TIES Together badges are designed to motivate great work, reward genuine activity,
          and provide clear pathways to success. Every badge is automatically granted once
          its requirements are met.
        </p>
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Automatic Awards</h3>
            <p className="text-sm text-muted-foreground">
              No manual approval needed. Badges are system-triggered when you meet requirements.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Track Your Progress</h3>
            <p className="text-sm text-muted-foreground">
              Real-time progress bars show exactly how close you are to each badge.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Display Up to 5</h3>
            <p className="text-sm text-muted-foreground">
              Choose which badges to showcase. All earned badges stay in your Badge Library.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badge Breakdown */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Award className="w-6 h-6" />
          Badge Breakdown
        </h2>

        <div className="space-y-6">
          {SPEC_BADGES_ORDER.map((badgeType, index) => {
            const info = SPEC_BADGE_INFO[badgeType]
            const IconComponent = BADGE_ICONS[info.icon] || Star
            const isSubscription = badgeType === 'ties_pro'

            return (
              <Card key={badgeType} className={isSubscription ? 'border-amber-300 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Badge Number & Icon */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-muted-foreground mb-2">
                        {isSubscription ? 'PRO' : index + 1}
                      </span>
                      <div className={`p-4 rounded-xl ${info.bgColor} border ${info.borderColor}`}>
                        <IconComponent className={`w-8 h-8 ${info.color}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{info.label} Badge</h3>
                        {isSubscription && (
                          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white">
                            Subscription
                          </Badge>
                        )}
                        {badgeType === 'activity' && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Can Expire
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {info.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Requirements */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <Target className="w-4 h-4 text-blue-500" />
                            Requirements
                          </h4>
                          <ul className="space-y-1.5">
                            {info.requirements.map((req, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Rewards */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <Gift className="w-4 h-4 text-purple-500" />
                            Rewards
                          </h4>
                          <ul className="space-y-1.5">
                            {info.rewards.map((reward, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                {reward}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* How to Succeed Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          How to Succeed on TIES Together
        </h2>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-6">
              Follow these steps to build your credibility and unlock all badges.
              Each step brings you closer to platform success and increased visibility.
            </p>

            <div className="space-y-4">
              {SUCCESS_STEPS.map((step, index) => {
                const info = SPEC_BADGE_INFO[step.badge]
                const IconComponent = step.icon

                return (
                  <div key={step.step} className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {step.step}
                      </div>
                      {index < SUCCESS_STEPS.length - 1 && (
                        <div className="w-0.5 h-8 bg-border mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{step.action}</h4>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Badge className={`${info.bgColor} ${info.color} border ${info.borderColor}`}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {info.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Expiry Rules */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Badge Rules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permanent Badges</CardTitle>
              <CardDescription>Once earned, these badges are yours forever</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Verified Badge
                </li>
                <li className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-purple-500" />
                  Portfolio Badge
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Completion Badge
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Quality Badge
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Earnings Badge
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dynamic Badges</CardTitle>
              <CardDescription>These badges can change based on activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-orange-500 mt-0.5" />
                  <span>
                    <strong>Activity Badge:</strong> Resets after 30 days of inactivity.
                    Complete a job to re-earn it.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-amber-500 mt-0.5" />
                  <span>
                    <strong>TIES Pro:</strong> Active only while subscription is maintained.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured User Glow */}
      <Card className="mb-12 border-amber-300 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Featured User Glow</h3>
              <p className="text-muted-foreground mb-3">
                Earn a special glowing outline on Discover that makes your profile stand out:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Subscribe to TIES Pro (gold glow)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">OR</span>
                </li>
                <li className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-purple-500" />
                  <span className="text-muted-foreground">+</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                  Hold both Portfolio AND Quality badges
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Ready to start earning badges?
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link to="/profile">
              View Your Progress
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/settings">
              Complete Your Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BadgeRulesPage
