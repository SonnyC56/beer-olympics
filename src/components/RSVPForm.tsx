import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Users,
  Trophy,
  Pizza,
  Shirt,
  Car,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Beer,
  PartyPopper,
  Shield,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { saveRSVP, saveRSVPProgress, getRSVPProgress } from '@/services/rsvp';
import type { RSVPData } from '@/services/rsvp';
import { cn } from '@/lib/utils';

interface RSVPFormProps {
  tournamentSlug: string;
  tournamentName: string;
  eventDate: string;
  onSuccess?: (rsvp: RSVPData) => void;
  onCancel?: () => void;
}

const SHIRT_SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const;
const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to Beer Olympics' },
  { value: 'intermediate', label: 'Intermediate', description: 'Played a few times' },
  { value: 'advanced', label: 'Advanced', description: 'Regular competitor' },
  { value: 'legendary', label: 'Legendary', description: 'Beer Olympics champion' }
] as const;

const PARTICIPATION_TYPES = [
  { value: 'player', label: 'Player', icon: Trophy, description: 'Compete in the games' },
  { value: 'spectator', label: 'Spectator', icon: Users, description: 'Cheer from the sidelines' },
  { value: 'designated_driver', label: 'Designated Driver', icon: Car, description: 'Keep everyone safe' }
] as const;

const GAMES = [
  'Beer Pong',
  'Flip Cup',
  'Kings Cup',
  'Quarters',
  'Beer Die',
  'Civil War',
  'Stack Cup',
  'Boat Race'
];

export function RSVPForm({ tournamentSlug, tournamentName, eventDate, onSuccess, onCancel }: RSVPFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    participationType: 'player' as 'player' | 'spectator' | 'designated_driver',
    preferredPartner: '',
    teamName: '',
    skillLevel: 'intermediate' as const,
    attendingGames: [] as string[],
    dietaryRestrictions: '',
    shirtSize: 'm' as const,
    favoriteGame: '',
    victoryDance: '',
    specialTalent: '',
    motivationalQuote: '',
    needsTransportation: false,
    canOfferRide: false,
    isDesignatedDriver: false,
    willingToVolunteer: false,
    bringingGuests: false,
    guestCount: 0,
    additionalRequests: '',
    agreeToTerms: false,
    agreeToPhotos: false,
    wantUpdates: true
  });

  const steps = [
    { title: 'Basic Info', icon: User, fields: ['fullName', 'email', 'phone'] },
    { title: 'Participation', icon: Trophy, fields: ['participationType', 'skillLevel'] },
    { title: 'Team Preferences', icon: Users, fields: ['teamName', 'preferredPartner'] },
    { title: 'Event Details', icon: PartyPopper, fields: ['attendingGames', 'shirtSize', 'dietaryRestrictions'] },
    { title: 'Fun Stuff', icon: Sparkles, fields: ['favoriteGame', 'victoryDance', 'specialTalent', 'motivationalQuote'] },
    { title: 'Logistics', icon: Car, fields: ['needsTransportation', 'canOfferRide', 'willingToVolunteer', 'bringingGuests', 'guestCount'] },
    { title: 'Confirm', icon: CheckCircle2, fields: ['agreeToTerms', 'agreeToPhotos', 'wantUpdates'] }
  ];

  // Filter steps based on participation type
  const activeSteps = formData.participationType !== 'player'
    ? steps.filter(s => !['Team Preferences', 'Fun Stuff'].includes(s.title))
    : steps;

  useEffect(() => {
    // Load saved progress
    const saved = getRSVPProgress(tournamentSlug);
    if (saved) {
      setFormData(saved);
      toast.info('We saved your progress! Continue where you left off.');
    }
  }, [tournamentSlug]);

  useEffect(() => {
    // Auto-save progress
    if (currentStep > 0) {
      saveRSVPProgress(formData, tournamentSlug);
    }
  }, [formData, currentStep, tournamentSlug]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (stepIndex: number) => {
    const step = activeSteps[stepIndex];
    return step.fields.every(field => {
      const value = formData[field as keyof typeof formData];
      if (typeof value === 'boolean') return true;
      if (Array.isArray(value)) return value.length > 0 || field === 'attendingGames';
      if (typeof value === 'number') return true;
      return value && value !== '';
    });
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, activeSteps.length - 1));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!isStepValid(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setSubmitting(true);

    try {
      const rsvpData = await saveRSVP({
        ...formData,
        tournamentSlug
      });

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-semibold">You're all set!</p>
            <p className="text-sm">Check your email for confirmation</p>
          </div>
        </div>
      );

      if (onSuccess) {
        onSuccess(rsvpData);
      }
    } catch (error) {
      toast.error('Failed to submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = activeSteps[currentStep];

    switch (step.title) {
      case 'Basic Info':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'Participation':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base mb-3 block">How will you participate? *</Label>
              <RadioGroup
                value={formData.participationType}
                onValueChange={(value) => updateField('participationType', value)}
              >
                <div className="grid gap-4">
                  {PARTICIPATION_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <motion.label
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative flex cursor-pointer rounded-lg border p-4 hover:bg-gray-800/50 transition-all",
                          formData.participationType === type.value
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-gray-700"
                        )}
                      >
                        <RadioGroupItem value={type.value} className="sr-only" />
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            formData.participationType === type.value
                              ? "bg-amber-500 text-white"
                              : "bg-gray-700 text-gray-400"
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{type.label}</p>
                            <p className="text-sm text-gray-400">{type.description}</p>
                          </div>
                        </div>
                      </motion.label>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {formData.participationType === 'player' && (
              <div>
                <Label className="text-base mb-3 block">What's your skill level? *</Label>
                <RadioGroup
                  value={formData.skillLevel}
                  onValueChange={(value) => updateField('skillLevel', value)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {SKILL_LEVELS.map((level) => (
                      <motion.label
                        key={level.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative flex cursor-pointer rounded-lg border p-3 hover:bg-gray-800/50 transition-all",
                          formData.skillLevel === level.value
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-gray-700"
                        )}
                      >
                        <RadioGroupItem value={level.value} className="sr-only" />
                        <div className="text-center w-full">
                          <p className="font-semibold text-white">{level.label}</p>
                          <p className="text-xs text-gray-400 mt-1">{level.description}</p>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {formData.participationType === 'designated_driver' && (
              <Alert className="bg-green-500/10 border-green-500">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Thank you for keeping everyone safe! You'll receive a special DD badge and perks.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'Team Preferences':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name (optional)</Label>
              <Input
                id="teamName"
                value={formData.teamName}
                onChange={(e) => updateField('teamName', e.target.value)}
                placeholder="The Beer Necessities"
                className="mt-1"
              />
              <p className="text-sm text-gray-400 mt-1">
                Leave blank to be assigned to a team
              </p>
            </div>

            <div>
              <Label htmlFor="preferredPartner">Preferred Partner (optional)</Label>
              <Input
                id="preferredPartner"
                value={formData.preferredPartner}
                onChange={(e) => updateField('preferredPartner', e.target.value)}
                placeholder="Partner's name"
                className="mt-1"
              />
              <p className="text-sm text-gray-400 mt-1">
                We'll try to team you up together
              </p>
            </div>
          </div>
        );

      case 'Event Details':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base mb-3 block">Which games interest you?</Label>
              <div className="grid grid-cols-2 gap-2">
                {GAMES.map((game) => (
                  <label
                    key={game}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-800/50 transition-all",
                      formData.attendingGames.includes(game)
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700"
                    )}
                  >
                    <Checkbox
                      checked={formData.attendingGames.includes(game)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateField('attendingGames', [...formData.attendingGames, game]);
                        } else {
                          updateField('attendingGames', formData.attendingGames.filter(g => g !== game));
                        }
                      }}
                    />
                    <span className="text-sm">{game}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="shirtSize">T-Shirt Size *</Label>
              <Select
                value={formData.shirtSize}
                onValueChange={(value) => updateField('shirtSize', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIRT_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions (optional)</Label>
              <Textarea
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={(e) => updateField('dietaryRestrictions', e.target.value)}
                placeholder="Vegetarian, gluten-free, allergies..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      case 'Fun Stuff':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Beer className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Help us get to know you better! (All optional)
              </p>
            </div>

            <div>
              <Label htmlFor="favoriteGame">Favorite drinking game?</Label>
              <Input
                id="favoriteGame"
                value={formData.favoriteGame}
                onChange={(e) => updateField('favoriteGame', e.target.value)}
                placeholder="Beer Pong, Flip Cup..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="victoryDance">Your signature victory dance?</Label>
              <Input
                id="victoryDance"
                value={formData.victoryDance}
                onChange={(e) => updateField('victoryDance', e.target.value)}
                placeholder="The Moonwalk, The Worm..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="specialTalent">Special talent to show off?</Label>
              <Input
                id="specialTalent"
                value={formData.specialTalent}
                onChange={(e) => updateField('specialTalent', e.target.value)}
                placeholder="Juggling, card tricks..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="motivationalQuote">Team motivational quote?</Label>
              <Textarea
                id="motivationalQuote"
                value={formData.motivationalQuote}
                onChange={(e) => updateField('motivationalQuote', e.target.value)}
                placeholder="Winners never quit, quitters never win!"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        );

      case 'Logistics':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all">
                <Checkbox
                  checked={formData.needsTransportation}
                  onCheckedChange={(checked) => updateField('needsTransportation', checked)}
                />
                <div>
                  <p className="font-medium">I need transportation</p>
                  <p className="text-sm text-gray-400">We'll help coordinate rides</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all">
                <Checkbox
                  checked={formData.canOfferRide}
                  onCheckedChange={(checked) => updateField('canOfferRide', checked)}
                />
                <div>
                  <p className="font-medium">I can offer rides</p>
                  <p className="text-sm text-gray-400">Help others get to the event</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all">
                <Checkbox
                  checked={formData.willingToVolunteer}
                  onCheckedChange={(checked) => updateField('willingToVolunteer', checked)}
                />
                <div>
                  <p className="font-medium">I'd like to volunteer</p>
                  <p className="text-sm text-gray-400">Help with setup, judging, or cleanup</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all">
                <Checkbox
                  checked={formData.bringingGuests}
                  onCheckedChange={(checked) => updateField('bringingGuests', checked)}
                />
                <div>
                  <p className="font-medium">I'm bringing guests</p>
                  <p className="text-sm text-gray-400">Non-participants welcome!</p>
                </div>
              </label>
            </div>

            {formData.bringingGuests && (
              <div>
                <Label htmlFor="guestCount">Number of guests</Label>
                <Input
                  id="guestCount"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.guestCount}
                  onChange={(e) => updateField('guestCount', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="additionalRequests">Additional requests or comments</Label>
              <Textarea
                id="additionalRequests"
                value={formData.additionalRequests}
                onChange={(e) => updateField('additionalRequests', e.target.value)}
                placeholder="Any special needs or requests..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      case 'Confirm':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">Registration Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Name:</dt>
                  <dd className="text-white">{formData.fullName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Email:</dt>
                  <dd className="text-white">{formData.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Participation:</dt>
                  <dd className="text-white capitalize">{formData.participationType}</dd>
                </div>
                {formData.teamName && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Team:</dt>
                    <dd className="text-white">{formData.teamName}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-400">Shirt Size:</dt>
                  <dd className="text-white">{formData.shirtSize.toUpperCase()}</dd>
                </div>
                {formData.bringingGuests && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Guests:</dt>
                    <dd className="text-white">{formData.guestCount}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <Checkbox
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => updateField('agreeToTerms', checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">I agree to the terms and conditions *</p>
                  <p className="text-sm text-gray-400">
                    I understand this is a 21+ event and will drink responsibly
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <Checkbox
                  checked={formData.agreeToPhotos}
                  onCheckedChange={(checked) => updateField('agreeToPhotos', checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">I consent to photos/videos *</p>
                  <p className="text-sm text-gray-400">
                    May be used for event promotion and memories
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <Checkbox
                  checked={formData.wantUpdates}
                  onCheckedChange={(checked) => updateField('wantUpdates', checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Send me event updates</p>
                  <p className="text-sm text-gray-400">
                    Get notified about schedule changes and announcements
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4"
          >
            <Beer className="w-8 h-8 text-amber-500" />
          </motion.div>
          <CardTitle className="text-2xl">RSVP for {tournamentName}</CardTitle>
          <p className="text-gray-400 mt-2">{eventDate}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {activeSteps.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentStep + 1) / activeSteps.length) * 100)}% Complete
            </span>
          </div>
          <Progress value={((currentStep + 1) / activeSteps.length) * 100} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {activeSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={step.title}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    isActive && "text-amber-500",
                    isCompleted && "text-green-500",
                    !isActive && !isCompleted && "text-gray-600"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isActive && "border-amber-500 bg-amber-500/20",
                    isCompleted && "border-green-500 bg-green-500/20",
                    !isActive && !isCompleted && "border-gray-600"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
            disabled={submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < activeSteps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep) || submitting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || !formData.agreeToTerms || submitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit RSVP
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}