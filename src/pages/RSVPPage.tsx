import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  PartyPopper, 
  User,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Camera,
  Star,
  ArrowLeft
} from 'lucide-react';
import { saveRSVP, saveRSVPProgress, getRSVPProgress, clearRSVPProgress, getRSVPByEmail } from '@/services/rsvp';
import { toast } from 'sonner';

interface RSVPFormData {
  // Basic Info
  fullName: string;
  email: string;
  phone: string;
  
  // Tournament Preferences
  preferredPartner: string;
  teamName: string;
  skillLevel: string;
  
  // Event Details
  attendingEvents: string[];
  dietaryRestrictions: string;
  shirtSize: string;
  
  // Fun Customization
  favoriteGame: string;
  victoryDance: string;
  specialTalent: string;
  motivationalQuote: string;
  
  // Logistics
  needsTransportation: boolean;
  canOfferRide: boolean;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Additional Options
  willingToVolunteer: boolean;
  bringingGuests: boolean;
  guestCount: number;
  additionalRequests: string;
  
  // Agreement
  agreeToTerms: boolean;
  agreeToPhotos: boolean;
  wantUpdates: boolean;
}

const initialFormData: RSVPFormData = {
  fullName: '',
  email: '',
  phone: '',
  preferredPartner: '',
  teamName: '',
  skillLevel: 'beginner',
  attendingEvents: [],
  dietaryRestrictions: '',
  shirtSize: 'm',
  favoriteGame: '',
  victoryDance: '',
  specialTalent: '',
  motivationalQuote: '',
  needsTransportation: false,
  canOfferRide: false,
  emergencyContact: '',
  emergencyPhone: '',
  willingToVolunteer: false,
  bringingGuests: false,
  guestCount: 0,
  additionalRequests: '',
  agreeToTerms: false,
  agreeToPhotos: false,
  wantUpdates: true,
};

const tournamentEvents = [
  { id: 'beer-pong', name: 'Beer Pong Championship', icon: '🏓', difficulty: 'intermediate' },
  { id: 'flip-cup', name: 'Flip Cup Frenzy', icon: '🥤', difficulty: 'beginner' },
  { id: 'cornhole', name: 'Cornhole Classic', icon: '🎯', difficulty: 'beginner' },
  { id: 'quarters', name: 'Quarters Quest', icon: '🪙', difficulty: 'intermediate' },
  { id: 'giant-jenga', name: 'Giant Jenga', icon: '🗼', difficulty: 'beginner' },
  { id: 'dizzy-bat', name: 'Dizzy Bat', icon: '🦇', difficulty: 'advanced' },
  { id: 'keg-stand', name: 'Keg Stand', icon: '🍺', difficulty: 'legendary' },
  { id: 'beer-olympics-relay', name: 'Beer Olympics Relay', icon: '🏃', difficulty: 'advanced' },
];

const skillLevels = [
  { value: 'beginner', label: 'Beginner 🌱', description: 'Just here for the fun!' },
  { value: 'intermediate', label: 'Intermediate 🚀', description: 'Ready to compete!' },
  { value: 'advanced', label: 'Advanced 🏆', description: 'Serious competitor!' },
  { value: 'legendary', label: 'Legendary 👑', description: 'Hall of Fame material!' },
];

export default function RSVPPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tournamentSlug = searchParams.get('tournament') || 'default-tournament';
  
  const [formData, setFormData] = useState<RSVPFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = getRSVPProgress(tournamentSlug);
    if (savedProgress) {
      setFormData(savedProgress);
      toast.info('We restored your previous progress!');
    }
  }, [tournamentSlug]);
  
  // Auto-save progress
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (!isSubmitted && formData.fullName) {
        saveRSVPProgress(formData, tournamentSlug);
      }
    }, 1000);
    
    return () => clearTimeout(saveTimer);
  }, [formData, tournamentSlug, isSubmitted]);
  
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof RSVPFormData, value: RSVPFormData[keyof RSVPFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        break;
      case 2:
        if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
        if (formData.attendingEvents.length === 0) newErrors.attendingEvents = 'At least one event must be selected';
        break;
      case 3:
        // Fun questions are optional
        break;
      case 4:
        if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
        if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';
        break;
      case 5:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleEventToggle = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      attendingEvents: prev.attendingEvents.includes(eventId)
        ? prev.attendingEvents.filter(id => id !== eventId)
        : [...prev.attendingEvents, eventId]
    }));
  };

  const handleCheckboxChange = (field: keyof RSVPFormData, checked: boolean) => {
    updateFormData(field, checked);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if email already exists
      const existingRSVP = await getRSVPByEmail(formData.email, tournamentSlug);
      if (existingRSVP) {
        toast.error('An RSVP with this email already exists for this tournament');
        setIsSubmitting(false);
        return;
      }
      
      // Save RSVP to local storage
      const savedRSVP = await saveRSVP({
        ...formData,
        tournamentSlug,
        skillLevel: formData.skillLevel as 'beginner' | 'intermediate' | 'advanced' | 'legendary',
      } as any);
      
      console.log('RSVP Saved:', savedRSVP);
      
      // Clear progress after successful submission
      clearRSVPProgress();
      
      toast.success('RSVP submitted successfully!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="card-victory w-full max-w-2xl animate-bounce-in">
          <CardContent className="text-center space-y-6 pt-8">
            <div className="animate-confetti">
              <Trophy className="w-24 h-24 mx-auto text-party-green mb-4" />
            </div>
            <h1 className="font-beer text-4xl text-party-green text-shadow">
              RSVP CONFIRMED! 🏆
            </h1>
            <p className="font-party text-xl text-shadow-lg">
              Welcome to the Beer Olympics, {formData.fullName}! 🍺
            </p>
            <div className="bg-gradient-victory/20 p-6 rounded-2xl">
              <h2 className="font-party text-lg mb-3">Your Registration Summary:</h2>
              <div className="space-y-2 text-left">
                <p><strong>Team:</strong> {formData.teamName}</p>
                <p><strong>Partner:</strong> {formData.preferredPartner || 'Solo Champion'}</p>
                <p><strong>Events:</strong> {formData.attendingEvents.length} selected</p>
                <p><strong>Skill Level:</strong> {formData.skillLevel}</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4 text-4xl animate-party-float">
              <span>🍺</span>
              <span>🎉</span>
              <span>🏆</span>
              <span>🎪</span>
            </div>
            <p className="text-sm opacity-75">
              Check your email for confirmation and event details!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-neutral-900 hover:bg-white/10 border border-neutral-900/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="font-beer text-4xl md:text-6xl text-glow animate-bounce-in">
            🍺 BEER OLYMPICS RSVP 🏆
          </h1>
          <p className="font-party text-xl text-shadow-lg">
            Join the ultimate backyard tournament experience!
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="card-party">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-party text-sm">Step {currentStep} of {totalSteps}</span>
              <span className="font-party text-sm">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-neutral-300 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-party h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-party opacity-75">
              <span>Basic Info</span>
              <span>Tournament</span>
              <span>Fun Stuff</span>
              <span>Logistics</span>
              <span>Finish</span>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="card-party">
          <CardHeader>
            <CardTitle className="font-beer text-2xl flex items-center gap-2">
              {currentStep === 1 && <><User className="w-6 h-6" /> BASIC INFORMATION</>}
              {currentStep === 2 && <><Trophy className="w-6 h-6" /> TOURNAMENT SETUP</>}
              {currentStep === 3 && <><Sparkles className="w-6 h-6" /> FUN CUSTOMIZATION</>}
              {currentStep === 4 && <><MapPin className="w-6 h-6" /> LOGISTICS & SAFETY</>}
              {currentStep === 5 && <><CheckCircle className="w-6 h-6" /> FINAL CONFIRMATION</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="font-party text-sm font-medium">Full Name *</label>
                    <Input
                      id="fullName"
                      className="input-party"
                      placeholder="Your champion name! 🏆"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="font-party text-sm font-medium">Email *</label>
                    <Input
                      id="email"
                      type="email"
                      className="input-party"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="font-party text-sm font-medium">Phone Number *</label>
                    <Input
                      id="phone"
                      type="tel"
                      className="input-party"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="preferredPartner" className="font-party text-sm font-medium">Preferred Partner</label>
                    <Input
                      id="preferredPartner"
                      className="input-beer"
                      placeholder="Your teammate's name (optional)"
                      value={formData.preferredPartner}
                      onChange={(e) => updateFormData('preferredPartner', e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-gradient-party/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <PartyPopper className="h-5 w-5 text-party-pink" />
                    <h3 className="font-party text-lg">Welcome to the Party!</h3>
                  </div>
                  <p className="text-sm opacity-75">
                    We'll use this info to create your champion profile and send you tournament updates!
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Tournament Setup */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="teamName" className="font-party text-sm font-medium">Team Name *</label>
                    <Input
                      id="teamName"
                      className="input-beer"
                      placeholder="The Beer Legends! 🍺"
                      value={formData.teamName}
                      onChange={(e) => updateFormData('teamName', e.target.value)}
                    />
                    {errors.teamName && <p className="text-red-500 text-sm">{errors.teamName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="skillLevel" className="font-party text-sm font-medium">Skill Level</label>
                    <select 
                      id="skillLevel"
                      className="input-party w-full"
                      value={formData.skillLevel}
                      onChange={(e) => updateFormData('skillLevel', e.target.value)}
                    >
                      {skillLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-party text-sm font-medium">Events You're Attending *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tournamentEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-2 p-3 border rounded-xl hover:bg-gradient-party/10">
                        <input
                          type="checkbox"
                          id={event.id}
                          checked={formData.attendingEvents.includes(event.id)}
                          onChange={() => handleEventToggle(event.id)}
                          className="rounded"
                        />
                        <label htmlFor={event.id} className="font-party cursor-pointer flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{event.icon}</span>
                              <span>{event.name}</span>
                            </div>
                            <span className="text-xs bg-neutral-200 px-2 py-1 rounded">
                              {event.difficulty}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.attendingEvents && <p className="text-red-500 text-sm">{errors.attendingEvents}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="shirtSize" className="font-party text-sm font-medium">T-Shirt Size</label>
                  <select 
                    id="shirtSize"
                    className="input-beer w-full"
                    value={formData.shirtSize}
                    onChange={(e) => updateFormData('shirtSize', e.target.value)}
                  >
                    <option value="xs">XS</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Fun Customization */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gradient-party/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-party-yellow" />
                    <h3 className="font-party text-lg">Make It Personal!</h3>
                  </div>
                  <p className="text-sm opacity-75">
                    These fun questions help us create a more personalized experience (all optional!)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="favoriteGame" className="font-party text-sm font-medium">Favorite Game</label>
                    <select 
                      id="favoriteGame"
                      className="input-party w-full"
                      value={formData.favoriteGame}
                      onChange={(e) => updateFormData('favoriteGame', e.target.value)}
                    >
                      <option value="">What's your specialty?</option>
                      <option value="beer-pong">🏓 Beer Pong</option>
                      <option value="flip-cup">🥤 Flip Cup</option>
                      <option value="cornhole">🎯 Cornhole</option>
                      <option value="quarters">🪙 Quarters</option>
                      <option value="all">🏆 I'm good at everything!</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="victoryDance" className="font-party text-sm font-medium">Victory Dance</label>
                    <Input
                      id="victoryDance"
                      className="input-party"
                      placeholder="The Floss, The Dab, Custom moves?"
                      value={formData.victoryDance}
                      onChange={(e) => updateFormData('victoryDance', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="specialTalent" className="font-party text-sm font-medium">Special Talent</label>
                  <Input
                    id="specialTalent"
                    className="input-party"
                    placeholder="What makes you unique? 🌟"
                    value={formData.specialTalent}
                    onChange={(e) => updateFormData('specialTalent', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="motivationalQuote" className="font-party text-sm font-medium">Battle Cry / Motivational Quote</label>
                  <textarea
                    id="motivationalQuote"
                    className="input-party w-full resize-none"
                    placeholder="What gets you pumped up? 🚀"
                    rows={3}
                    value={formData.motivationalQuote}
                    onChange={(e) => updateFormData('motivationalQuote', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dietaryRestrictions" className="font-party text-sm font-medium">Dietary Restrictions / Food Preferences</label>
                  <textarea
                    id="dietaryRestrictions"
                    className="input-party w-full resize-none"
                    placeholder="Vegetarian, allergies, pizza preferences? 🍕"
                    rows={2}
                    value={formData.dietaryRestrictions}
                    onChange={(e) => updateFormData('dietaryRestrictions', e.target.value)}
                  />
                </div>

                <div className="bg-gradient-party/10 p-4 rounded-2xl">
                  <h3 className="font-party text-lg mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Social Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="photos" className="font-party text-sm">Allow event photos</label>
                      <input
                        type="checkbox"
                        id="photos"
                        checked={formData.agreeToPhotos}
                        onChange={(e) => handleCheckboxChange('agreeToPhotos', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="volunteer" className="font-party text-sm">Willing to volunteer</label>
                      <input
                        type="checkbox"
                        id="volunteer"
                        checked={formData.willingToVolunteer}
                        onChange={(e) => handleCheckboxChange('willingToVolunteer', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Logistics & Safety */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-party/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-party-orange" />
                    <h3 className="font-party text-lg">Safety First!</h3>
                  </div>
                  <p className="text-sm opacity-75">
                    We need this info to ensure everyone has a safe and fun experience!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="emergencyContact" className="font-party text-sm font-medium">Emergency Contact Name *</label>
                    <Input
                      id="emergencyContact"
                      className="input-party"
                      placeholder="Someone who cares about you"
                      value={formData.emergencyContact}
                      onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                    />
                    {errors.emergencyContact && <p className="text-red-500 text-sm">{errors.emergencyContact}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="emergencyPhone" className="font-party text-sm font-medium">Emergency Contact Phone *</label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      className="input-party"
                      placeholder="(555) 123-4567"
                      value={formData.emergencyPhone}
                      onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                    />
                    {errors.emergencyPhone && <p className="text-red-500 text-sm">{errors.emergencyPhone}</p>}
                  </div>
                </div>

                <div className="bg-gradient-ocean/10 p-4 rounded-2xl">
                  <h3 className="font-party text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Transportation & Logistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="needsRide" className="font-party text-sm">Need a ride to the event?</label>
                      <input
                        type="checkbox"
                        id="needsRide"
                        checked={formData.needsTransportation}
                        onChange={(e) => handleCheckboxChange('needsTransportation', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="canDrive" className="font-party text-sm">Can offer rides to others?</label>
                      <input
                        type="checkbox"
                        id="canDrive"
                        checked={formData.canOfferRide}
                        onChange={(e) => handleCheckboxChange('canOfferRide', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="guests" className="font-party text-sm">Bringing guests?</label>
                      <input
                        type="checkbox"
                        id="guests"
                        checked={formData.bringingGuests}
                        onChange={(e) => handleCheckboxChange('bringingGuests', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="additionalRequests" className="font-party text-sm font-medium">Additional Requests or Notes</label>
                  <textarea
                    id="additionalRequests"
                    className="input-party w-full resize-none"
                    placeholder="Anything else we should know? 📝"
                    rows={3}
                    value={formData.additionalRequests}
                    onChange={(e) => updateFormData('additionalRequests', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Final Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-gradient-party/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-party-green" />
                    <h3 className="font-party text-lg">Almost There!</h3>
                  </div>
                  <p className="text-sm opacity-75">
                    Review your information and confirm your RSVP to join the Beer Olympics!
                  </p>
                </div>

                <div className="bg-gradient-party/10 p-6 rounded-2xl">
                  <h3 className="font-party text-xl mb-4">Your Registration Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {formData.fullName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Team:</strong> {formData.teamName}</p>
                      <p><strong>Partner:</strong> {formData.preferredPartner || 'Solo Champion'}</p>
                      <p><strong>Skill Level:</strong> {formData.skillLevel}</p>
                    </div>
                    <div>
                      <p><strong>Events:</strong> {formData.attendingEvents.length} selected</p>
                      <p><strong>T-Shirt:</strong> {formData.shirtSize.toUpperCase()}</p>
                      <p><strong>Transportation:</strong> {formData.needsTransportation ? 'Needs ride' : 'Has transport'}</p>
                      <p><strong>Volunteers:</strong> {formData.willingToVolunteer ? 'Yes' : 'No'}</p>
                      <p><strong>Emergency Contact:</strong> {formData.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleCheckboxChange('agreeToTerms', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="terms" className="font-party cursor-pointer text-sm">
                      I agree to the tournament rules and code of conduct *
                    </label>
                  </div>
                  {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="updates"
                      checked={formData.wantUpdates}
                      onChange={(e) => handleCheckboxChange('wantUpdates', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="updates" className="font-party cursor-pointer text-sm">
                      Send me updates about the tournament
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-victory/20 p-4 rounded-2xl text-center">
                  <p className="font-party text-lg mb-2">Ready to become a Beer Olympics legend? 🏆</p>
                  <p className="text-sm opacity-75">
                    By submitting, you'll receive a confirmation email with all the details!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="card-party">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="font-party"
              >
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      step === currentStep
                        ? 'bg-gradient-party'
                        : step < currentStep
                        ? 'bg-party-green'
                        : 'bg-neutral-300'
                    }`}
                  />
                ))}
              </div>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="btn-party font-party"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-victory font-party"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Confirm RSVP!
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}