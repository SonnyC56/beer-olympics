import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Trophy, Car, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Beer, PartyPopper, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { saveRSVP, saveRSVPProgress, getRSVPProgress } from '@/services/rsvp';
import { cn } from '@/lib/utils';
const SHIRT_SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
const SKILL_LEVELS = [
    { value: 'beginner', label: 'Beginner', description: 'New to Beer Olympics' },
    { value: 'intermediate', label: 'Intermediate', description: 'Played a few times' },
    { value: 'advanced', label: 'Advanced', description: 'Regular competitor' },
    { value: 'legendary', label: 'Legendary', description: 'Beer Olympics champion' }
];
const PARTICIPATION_TYPES = [
    { value: 'player', label: 'Player', icon: Trophy, description: 'Compete in the games' },
    { value: 'spectator', label: 'Spectator', icon: Users, description: 'Cheer from the sidelines' },
    { value: 'designated_driver', label: 'Designated Driver', icon: Car, description: 'Keep everyone safe' }
];
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
export function RSVPForm({ tournamentSlug, tournamentName, eventDate, onSuccess, onCancel }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        participationType: 'player',
        preferredPartner: '',
        teamName: '',
        skillLevel: 'intermediate',
        attendingGames: [],
        dietaryRestrictions: '',
        shirtSize: 'm',
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
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const isStepValid = (stepIndex) => {
        const step = activeSteps[stepIndex];
        return step.fields.every(field => {
            const value = formData[field];
            if (typeof value === 'boolean')
                return true;
            if (Array.isArray(value))
                return value.length > 0 || field === 'attendingGames';
            if (typeof value === 'number')
                return true;
            return value && value !== '';
        });
    };
    const handleNext = () => {
        if (isStepValid(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, activeSteps.length - 1));
        }
        else {
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
            toast.success(_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "You're all set!" }), _jsx("p", { className: "text-sm", children: "Check your email for confirmation" })] })] }));
            if (onSuccess) {
                onSuccess(rsvpData);
            }
        }
        catch (error) {
            toast.error('Failed to submit RSVP. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    const renderStepContent = () => {
        const step = activeSteps[currentStep];
        switch (step.title) {
            case 'Basic Info':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "fullName", children: "Full Name *" }), _jsx(Input, { id: "fullName", value: formData.fullName, onChange: (e) => updateField('fullName', e.target.value), placeholder: "John Doe", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email *" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => updateField('email', e.target.value), placeholder: "john@example.com", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", children: "Phone Number *" }), _jsx(Input, { id: "phone", type: "tel", value: formData.phone, onChange: (e) => updateField('phone', e.target.value), placeholder: "(555) 123-4567", className: "mt-1" })] })] }));
            case 'Participation':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base mb-3 block", children: "How will you participate? *" }), _jsx(RadioGroup, { value: formData.participationType, onValueChange: (value) => updateField('participationType', value), children: _jsx("div", { className: "grid gap-4", children: PARTICIPATION_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            return (_jsxs(motion.label, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: cn("relative flex cursor-pointer rounded-lg border p-4 hover:bg-gray-800/50 transition-all", formData.participationType === type.value
                                                    ? "border-amber-500 bg-amber-500/10"
                                                    : "border-gray-700"), children: [_jsx(RadioGroupItem, { value: type.value, className: "sr-only" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn("w-12 h-12 rounded-full flex items-center justify-center", formData.participationType === type.value
                                                                    ? "bg-amber-500 text-white"
                                                                    : "bg-gray-700 text-gray-400"), children: _jsx(Icon, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-white", children: type.label }), _jsx("p", { className: "text-sm text-gray-400", children: type.description })] })] })] }, type.value));
                                        }) }) })] }), formData.participationType === 'player' && (_jsxs("div", { children: [_jsx(Label, { className: "text-base mb-3 block", children: "What's your skill level? *" }), _jsx(RadioGroup, { value: formData.skillLevel, onValueChange: (value) => updateField('skillLevel', value), children: _jsx("div", { className: "grid grid-cols-2 gap-3", children: SKILL_LEVELS.map((level) => (_jsxs(motion.label, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: cn("relative flex cursor-pointer rounded-lg border p-3 hover:bg-gray-800/50 transition-all", formData.skillLevel === level.value
                                                ? "border-amber-500 bg-amber-500/10"
                                                : "border-gray-700"), children: [_jsx(RadioGroupItem, { value: level.value, className: "sr-only" }), _jsxs("div", { className: "text-center w-full", children: [_jsx("p", { className: "font-semibold text-white", children: level.label }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: level.description })] })] }, level.value))) }) })] })), formData.participationType === 'designated_driver' && (_jsxs(Alert, { className: "bg-green-500/10 border-green-500", children: [_jsx(Shield, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Thank you for keeping everyone safe! You'll receive a special DD badge and perks." })] }))] }));
            case 'Team Preferences':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "teamName", children: "Team Name (optional)" }), _jsx(Input, { id: "teamName", value: formData.teamName, onChange: (e) => updateField('teamName', e.target.value), placeholder: "The Beer Necessities", className: "mt-1" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Leave blank to be assigned to a team" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "preferredPartner", children: "Preferred Partner (optional)" }), _jsx(Input, { id: "preferredPartner", value: formData.preferredPartner, onChange: (e) => updateField('preferredPartner', e.target.value), placeholder: "Partner's name", className: "mt-1" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "We'll try to team you up together" })] })] }));
            case 'Event Details':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base mb-3 block", children: "Which games interest you?" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: GAMES.map((game) => (_jsxs("label", { className: cn("flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-800/50 transition-all", formData.attendingGames.includes(game)
                                            ? "border-amber-500 bg-amber-500/10"
                                            : "border-gray-700"), children: [_jsx(Checkbox, { checked: formData.attendingGames.includes(game), onCheckedChange: (checked) => {
                                                    if (checked) {
                                                        updateField('attendingGames', [...formData.attendingGames, game]);
                                                    }
                                                    else {
                                                        updateField('attendingGames', formData.attendingGames.filter(g => g !== game));
                                                    }
                                                } }), _jsx("span", { className: "text-sm", children: game })] }, game))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "shirtSize", children: "T-Shirt Size *" }), _jsxs(Select, { value: formData.shirtSize, onValueChange: (value) => updateField('shirtSize', value), children: [_jsx(SelectTrigger, { className: "mt-1", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: SHIRT_SIZES.map((size) => (_jsx(SelectItem, { value: size, children: size.toUpperCase() }, size))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dietaryRestrictions", children: "Dietary Restrictions (optional)" }), _jsx(Textarea, { id: "dietaryRestrictions", value: formData.dietaryRestrictions, onChange: (e) => updateField('dietaryRestrictions', e.target.value), placeholder: "Vegetarian, gluten-free, allergies...", className: "mt-1", rows: 3 })] })] }));
            case 'Fun Stuff':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx(Beer, { className: "w-12 h-12 text-amber-500 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-400", children: "Help us get to know you better! (All optional)" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "favoriteGame", children: "Favorite drinking game?" }), _jsx(Input, { id: "favoriteGame", value: formData.favoriteGame, onChange: (e) => updateField('favoriteGame', e.target.value), placeholder: "Beer Pong, Flip Cup...", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "victoryDance", children: "Your signature victory dance?" }), _jsx(Input, { id: "victoryDance", value: formData.victoryDance, onChange: (e) => updateField('victoryDance', e.target.value), placeholder: "The Moonwalk, The Worm...", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "specialTalent", children: "Special talent to show off?" }), _jsx(Input, { id: "specialTalent", value: formData.specialTalent, onChange: (e) => updateField('specialTalent', e.target.value), placeholder: "Juggling, card tricks...", className: "mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "motivationalQuote", children: "Team motivational quote?" }), _jsx(Textarea, { id: "motivationalQuote", value: formData.motivationalQuote, onChange: (e) => updateField('motivationalQuote', e.target.value), placeholder: "Winners never quit, quitters never win!", className: "mt-1", rows: 2 })] })] }));
            case 'Logistics':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all", children: [_jsx(Checkbox, { checked: formData.needsTransportation, onCheckedChange: (checked) => updateField('needsTransportation', checked) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "I need transportation" }), _jsx("p", { className: "text-sm text-gray-400", children: "We'll help coordinate rides" })] })] }), _jsxs("label", { className: "flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all", children: [_jsx(Checkbox, { checked: formData.canOfferRide, onCheckedChange: (checked) => updateField('canOfferRide', checked) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "I can offer rides" }), _jsx("p", { className: "text-sm text-gray-400", children: "Help others get to the event" })] })] }), _jsxs("label", { className: "flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all", children: [_jsx(Checkbox, { checked: formData.willingToVolunteer, onCheckedChange: (checked) => updateField('willingToVolunteer', checked) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "I'd like to volunteer" }), _jsx("p", { className: "text-sm text-gray-400", children: "Help with setup, judging, or cleanup" })] })] }), _jsxs("label", { className: "flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all", children: [_jsx(Checkbox, { checked: formData.bringingGuests, onCheckedChange: (checked) => updateField('bringingGuests', checked) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "I'm bringing guests" }), _jsx("p", { className: "text-sm text-gray-400", children: "Non-participants welcome!" })] })] })] }), formData.bringingGuests && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "guestCount", children: "Number of guests" }), _jsx(Input, { id: "guestCount", type: "number", min: "1", max: "10", value: formData.guestCount, onChange: (e) => updateField('guestCount', parseInt(e.target.value) || 0), className: "mt-1" })] })), _jsxs("div", { children: [_jsx(Label, { htmlFor: "additionalRequests", children: "Additional requests or comments" }), _jsx(Textarea, { id: "additionalRequests", value: formData.additionalRequests, onChange: (e) => updateField('additionalRequests', e.target.value), placeholder: "Any special needs or requests...", className: "mt-1", rows: 3 })] })] }));
            case 'Confirm':
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-800/50 rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-white mb-4", children: "Registration Summary" }), _jsxs("dl", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-gray-400", children: "Name:" }), _jsx("dd", { className: "text-white", children: formData.fullName })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-gray-400", children: "Email:" }), _jsx("dd", { className: "text-white", children: formData.email })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-gray-400", children: "Participation:" }), _jsx("dd", { className: "text-white capitalize", children: formData.participationType })] }), formData.teamName && (_jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-gray-400", children: "Team:" }), _jsx("dd", { className: "text-white", children: formData.teamName })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-gray-400", children: "Shirt Size:" }), _jsx("dd", { className: "text-white", children: formData.shirtSize.toUpperCase() })] }), formData.bringingGuests && (_jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-gray-400", children: "Guests:" }), _jsx("dd", { className: "text-white", children: formData.guestCount })] }))] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-start gap-3", children: [_jsx(Checkbox, { checked: formData.agreeToTerms, onCheckedChange: (checked) => updateField('agreeToTerms', checked), className: "mt-1" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "I agree to the terms and conditions *" }), _jsx("p", { className: "text-sm text-gray-400", children: "I understand this is a 21+ event and will drink responsibly" })] })] }), _jsxs("label", { className: "flex items-start gap-3", children: [_jsx(Checkbox, { checked: formData.agreeToPhotos, onCheckedChange: (checked) => updateField('agreeToPhotos', checked), className: "mt-1" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "I consent to photos/videos *" }), _jsx("p", { className: "text-sm text-gray-400", children: "May be used for event promotion and memories" })] })] }), _jsxs("label", { className: "flex items-start gap-3", children: [_jsx(Checkbox, { checked: formData.wantUpdates, onCheckedChange: (checked) => updateField('wantUpdates', checked), className: "mt-1" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Send me event updates" }), _jsx("p", { className: "text-sm text-gray-400", children: "Get notified about schedule changes and announcements" })] })] })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs(Card, { className: "max-w-2xl mx-auto bg-gray-900 border-gray-800", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 200 }, className: "inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4", children: _jsx(Beer, { className: "w-8 h-8 text-amber-500" }) }), _jsxs(CardTitle, { className: "text-2xl", children: ["RSVP for ", tournamentName] }), _jsx("p", { className: "text-gray-400 mt-2", children: eventDate })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-sm text-gray-400", children: ["Step ", currentStep + 1, " of ", activeSteps.length] }), _jsxs("span", { className: "text-sm text-gray-400", children: [Math.round(((currentStep + 1) / activeSteps.length) * 100), "% Complete"] })] }), _jsx(Progress, { value: ((currentStep + 1) / activeSteps.length) * 100, className: "h-2" }), _jsx("div", { className: "flex items-center justify-between mt-4", children: activeSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = index === currentStep;
                                    const isCompleted = index < currentStep;
                                    return (_jsxs("div", { className: cn("flex flex-col items-center gap-1", isActive && "text-amber-500", isCompleted && "text-green-500", !isActive && !isCompleted && "text-gray-600"), children: [_jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all", isActive && "border-amber-500 bg-amber-500/20", isCompleted && "border-green-500 bg-green-500/20", !isActive && !isCompleted && "border-gray-600"), children: isCompleted ? (_jsx(CheckCircle2, { className: "w-4 h-4" })) : (_jsx(Icon, { className: "w-4 h-4" })) }), _jsx("span", { className: "text-xs hidden sm:block", children: step.title })] }, step.title));
                                }) })] })] }), _jsxs(CardContent, { children: [_jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.2 }, children: renderStepContent() }, currentStep) }), _jsxs("div", { className: "flex items-center justify-between mt-8", children: [_jsxs(Button, { variant: "outline", onClick: currentStep === 0 ? onCancel : handleBack, disabled: submitting, children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-2" }), currentStep === 0 ? 'Cancel' : 'Back'] }), currentStep < activeSteps.length - 1 ? (_jsxs(Button, { onClick: handleNext, disabled: !isStepValid(currentStep) || submitting, className: "bg-amber-500 hover:bg-amber-600", children: ["Next", _jsx(ChevronRight, { className: "w-4 h-4 ml-2" })] })) : (_jsx(Button, { onClick: handleSubmit, disabled: !isStepValid(currentStep) || !formData.agreeToTerms || submitting, className: "bg-green-500 hover:bg-green-600", children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: ["Submit RSVP", _jsx(CheckCircle2, { className: "w-4 h-4 ml-2" })] })) }))] })] })] }));
}
