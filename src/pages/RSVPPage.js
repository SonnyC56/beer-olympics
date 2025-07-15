import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, PartyPopper, User, CheckCircle, AlertCircle, Sparkles, MapPin, Camera, Star, ArrowLeft } from 'lucide-react';
import { saveRSVP, saveRSVPProgress, getRSVPProgress, clearRSVPProgress, getRSVPByEmail } from '@/services/rsvp';
import { toast } from 'sonner';
const initialFormData = {
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
    const [formData, setFormData] = useState(initialFormData);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
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
    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const validateStep = (step) => {
        const newErrors = {};
        switch (step) {
            case 1:
                if (!formData.fullName.trim())
                    newErrors.fullName = 'Name is required';
                if (!formData.email.trim())
                    newErrors.email = 'Email is required';
                if (!formData.email.includes('@'))
                    newErrors.email = 'Valid email required';
                if (!formData.phone.trim())
                    newErrors.phone = 'Phone is required';
                break;
            case 2:
                if (!formData.teamName.trim())
                    newErrors.teamName = 'Team name is required';
                if (formData.attendingEvents.length === 0)
                    newErrors.attendingEvents = 'At least one event must be selected';
                break;
            case 3:
                // Fun questions are optional
                break;
            case 4:
                if (!formData.emergencyContact.trim())
                    newErrors.emergencyContact = 'Emergency contact is required';
                if (!formData.emergencyPhone.trim())
                    newErrors.emergencyPhone = 'Emergency phone is required';
                break;
            case 5:
                if (!formData.agreeToTerms)
                    newErrors.agreeToTerms = 'You must agree to the terms';
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
    const handleEventToggle = (eventId) => {
        setFormData(prev => ({
            ...prev,
            attendingEvents: prev.attendingEvents.includes(eventId)
                ? prev.attendingEvents.filter(id => id !== eventId)
                : [...prev.attendingEvents, eventId]
        }));
    };
    const handleCheckboxChange = (field, checked) => {
        updateFormData(field, checked);
    };
    const handleSubmit = async () => {
        if (!validateStep(currentStep))
            return;
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
                skillLevel: formData.skillLevel,
            });
            console.log('RSVP Saved:', savedRSVP);
            // Clear progress after successful submission
            clearRSVPProgress();
            toast.success('RSVP submitted successfully!');
            setIsSubmitted(true);
        }
        catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to submit RSVP. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isSubmitted) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4", children: _jsx(Card, { className: "card-victory w-full max-w-2xl animate-bounce-in", children: _jsxs(CardContent, { className: "text-center space-y-6 pt-8", children: [_jsx("div", { className: "animate-confetti", children: _jsx(Trophy, { className: "w-24 h-24 mx-auto text-party-green mb-4" }) }), _jsx("h1", { className: "font-beer text-4xl text-party-green text-shadow", children: "RSVP CONFIRMED! \uD83C\uDFC6" }), _jsxs("p", { className: "font-party text-xl text-shadow-lg", children: ["Welcome to the Beer Olympics, ", formData.fullName, "! \uD83C\uDF7A"] }), _jsxs("div", { className: "bg-gradient-victory/20 p-6 rounded-2xl", children: [_jsx("h2", { className: "font-party text-lg mb-3", children: "Your Registration Summary:" }), _jsxs("div", { className: "space-y-2 text-left", children: [_jsxs("p", { children: [_jsx("strong", { children: "Team:" }), " ", formData.teamName] }), _jsxs("p", { children: [_jsx("strong", { children: "Partner:" }), " ", formData.preferredPartner || 'Solo Champion'] }), _jsxs("p", { children: [_jsx("strong", { children: "Events:" }), " ", formData.attendingEvents.length, " selected"] }), _jsxs("p", { children: [_jsx("strong", { children: "Skill Level:" }), " ", formData.skillLevel] })] })] }), _jsxs("div", { className: "flex justify-center space-x-4 text-4xl animate-party-float", children: [_jsx("span", { children: "\uD83C\uDF7A" }), _jsx("span", { children: "\uD83C\uDF89" }), _jsx("span", { children: "\uD83C\uDFC6" }), _jsx("span", { children: "\uD83C\uDFAA" })] }), _jsx("p", { className: "text-sm opacity-75", children: "Check your email for confirmation and event details!" })] }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen p-4 md:p-8", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsxs(Button, { variant: "ghost", onClick: () => navigate('/'), className: "text-neutral-900 hover:bg-white/10 border border-neutral-900/20 mb-4", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Home"] }), _jsx("h1", { className: "font-beer text-4xl md:text-6xl text-glow animate-bounce-in", children: "\uD83C\uDF7A BEER OLYMPICS RSVP \uD83C\uDFC6" }), _jsx("p", { className: "font-party text-xl text-shadow-lg", children: "Join the ultimate backyard tournament experience!" })] }), _jsx(Card, { className: "card-party", children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("span", { className: "font-party text-sm", children: ["Step ", currentStep, " of ", totalSteps] }), _jsxs("span", { className: "font-party text-sm", children: [Math.round(progress), "% Complete"] })] }), _jsx("div", { className: "w-full bg-neutral-300 rounded-full h-3 mb-4", children: _jsx("div", { className: "bg-gradient-party h-3 rounded-full transition-all duration-300 ease-out", style: { width: `${progress}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs font-party opacity-75", children: [_jsx("span", { children: "Basic Info" }), _jsx("span", { children: "Tournament" }), _jsx("span", { children: "Fun Stuff" }), _jsx("span", { children: "Logistics" }), _jsx("span", { children: "Finish" })] })] }) }), _jsxs(Card, { className: "card-party", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "font-beer text-2xl flex items-center gap-2", children: [currentStep === 1 && _jsxs(_Fragment, { children: [_jsx(User, { className: "w-6 h-6" }), " BASIC INFORMATION"] }), currentStep === 2 && _jsxs(_Fragment, { children: [_jsx(Trophy, { className: "w-6 h-6" }), " TOURNAMENT SETUP"] }), currentStep === 3 && _jsxs(_Fragment, { children: [_jsx(Sparkles, { className: "w-6 h-6" }), " FUN CUSTOMIZATION"] }), currentStep === 4 && _jsxs(_Fragment, { children: [_jsx(MapPin, { className: "w-6 h-6" }), " LOGISTICS & SAFETY"] }), currentStep === 5 && _jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-6 h-6" }), " FINAL CONFIRMATION"] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [currentStep === 1 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "fullName", className: "font-party text-sm font-medium", children: "Full Name *" }), _jsx(Input, { id: "fullName", className: "input-party", placeholder: "Your champion name! \uD83C\uDFC6", value: formData.fullName, onChange: (e) => updateFormData('fullName', e.target.value) }), errors.fullName && _jsx("p", { className: "text-red-500 text-sm", children: errors.fullName })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "email", className: "font-party text-sm font-medium", children: "Email *" }), _jsx(Input, { id: "email", type: "email", className: "input-party", placeholder: "your.email@example.com", value: formData.email, onChange: (e) => updateFormData('email', e.target.value) }), errors.email && _jsx("p", { className: "text-red-500 text-sm", children: errors.email })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "phone", className: "font-party text-sm font-medium", children: "Phone Number *" }), _jsx(Input, { id: "phone", type: "tel", className: "input-party", placeholder: "(555) 123-4567", value: formData.phone, onChange: (e) => updateFormData('phone', e.target.value) }), errors.phone && _jsx("p", { className: "text-red-500 text-sm", children: errors.phone })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "preferredPartner", className: "font-party text-sm font-medium", children: "Preferred Partner" }), _jsx(Input, { id: "preferredPartner", className: "input-beer", placeholder: "Your teammate's name (optional)", value: formData.preferredPartner, onChange: (e) => updateFormData('preferredPartner', e.target.value) })] })] }), _jsxs("div", { className: "bg-gradient-party/10 p-4 rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(PartyPopper, { className: "h-5 w-5 text-party-pink" }), _jsx("h3", { className: "font-party text-lg", children: "Welcome to the Party!" })] }), _jsx("p", { className: "text-sm opacity-75", children: "We'll use this info to create your champion profile and send you tournament updates!" })] })] })), currentStep === 2 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "teamName", className: "font-party text-sm font-medium", children: "Team Name *" }), _jsx(Input, { id: "teamName", className: "input-beer", placeholder: "The Beer Legends! \uD83C\uDF7A", value: formData.teamName, onChange: (e) => updateFormData('teamName', e.target.value) }), errors.teamName && _jsx("p", { className: "text-red-500 text-sm", children: errors.teamName })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "skillLevel", className: "font-party text-sm font-medium", children: "Skill Level" }), _jsx("select", { id: "skillLevel", className: "input-party w-full", value: formData.skillLevel, onChange: (e) => updateFormData('skillLevel', e.target.value), children: skillLevels.map((level) => (_jsxs("option", { value: level.value, children: [level.label, " - ", level.description] }, level.value))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "font-party text-sm font-medium", children: "Events You're Attending *" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: tournamentEvents.map((event) => (_jsxs("div", { className: "flex items-center space-x-2 p-3 border rounded-xl hover:bg-gradient-party/10", children: [_jsx("input", { type: "checkbox", id: event.id, checked: formData.attendingEvents.includes(event.id), onChange: () => handleEventToggle(event.id), className: "rounded" }), _jsx("label", { htmlFor: event.id, className: "font-party cursor-pointer flex-1", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: event.icon }), _jsx("span", { children: event.name })] }), _jsx("span", { className: "text-xs bg-neutral-200 px-2 py-1 rounded", children: event.difficulty })] }) })] }, event.id))) }), errors.attendingEvents && _jsx("p", { className: "text-red-500 text-sm", children: errors.attendingEvents })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "shirtSize", className: "font-party text-sm font-medium", children: "T-Shirt Size" }), _jsxs("select", { id: "shirtSize", className: "input-beer w-full", value: formData.shirtSize, onChange: (e) => updateFormData('shirtSize', e.target.value), children: [_jsx("option", { value: "xs", children: "XS" }), _jsx("option", { value: "s", children: "S" }), _jsx("option", { value: "m", children: "M" }), _jsx("option", { value: "l", children: "L" }), _jsx("option", { value: "xl", children: "XL" }), _jsx("option", { value: "xxl", children: "XXL" })] })] })] })), currentStep === 3 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-party/10 p-4 rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Star, { className: "h-5 w-5 text-party-yellow" }), _jsx("h3", { className: "font-party text-lg", children: "Make It Personal!" })] }), _jsx("p", { className: "text-sm opacity-75", children: "These fun questions help us create a more personalized experience (all optional!)" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "favoriteGame", className: "font-party text-sm font-medium", children: "Favorite Game" }), _jsxs("select", { id: "favoriteGame", className: "input-party w-full", value: formData.favoriteGame, onChange: (e) => updateFormData('favoriteGame', e.target.value), children: [_jsx("option", { value: "", children: "What's your specialty?" }), _jsx("option", { value: "beer-pong", children: "\uD83C\uDFD3 Beer Pong" }), _jsx("option", { value: "flip-cup", children: "\uD83E\uDD64 Flip Cup" }), _jsx("option", { value: "cornhole", children: "\uD83C\uDFAF Cornhole" }), _jsx("option", { value: "quarters", children: "\uD83E\uDE99 Quarters" }), _jsx("option", { value: "all", children: "\uD83C\uDFC6 I'm good at everything!" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "victoryDance", className: "font-party text-sm font-medium", children: "Victory Dance" }), _jsx(Input, { id: "victoryDance", className: "input-party", placeholder: "The Floss, The Dab, Custom moves?", value: formData.victoryDance, onChange: (e) => updateFormData('victoryDance', e.target.value) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "specialTalent", className: "font-party text-sm font-medium", children: "Special Talent" }), _jsx(Input, { id: "specialTalent", className: "input-party", placeholder: "What makes you unique? \uD83C\uDF1F", value: formData.specialTalent, onChange: (e) => updateFormData('specialTalent', e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "motivationalQuote", className: "font-party text-sm font-medium", children: "Battle Cry / Motivational Quote" }), _jsx("textarea", { id: "motivationalQuote", className: "input-party w-full resize-none", placeholder: "What gets you pumped up? \uD83D\uDE80", rows: 3, value: formData.motivationalQuote, onChange: (e) => updateFormData('motivationalQuote', e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "dietaryRestrictions", className: "font-party text-sm font-medium", children: "Dietary Restrictions / Food Preferences" }), _jsx("textarea", { id: "dietaryRestrictions", className: "input-party w-full resize-none", placeholder: "Vegetarian, allergies, pizza preferences? \uD83C\uDF55", rows: 2, value: formData.dietaryRestrictions, onChange: (e) => updateFormData('dietaryRestrictions', e.target.value) })] }), _jsxs("div", { className: "bg-gradient-party/10 p-4 rounded-2xl", children: [_jsxs("h3", { className: "font-party text-lg mb-3 flex items-center gap-2", children: [_jsx(Camera, { className: "w-5 h-5" }), "Social Features"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { htmlFor: "photos", className: "font-party text-sm", children: "Allow event photos" }), _jsx("input", { type: "checkbox", id: "photos", checked: formData.agreeToPhotos, onChange: (e) => handleCheckboxChange('agreeToPhotos', e.target.checked), className: "rounded" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { htmlFor: "volunteer", className: "font-party text-sm", children: "Willing to volunteer" }), _jsx("input", { type: "checkbox", id: "volunteer", checked: formData.willingToVolunteer, onChange: (e) => handleCheckboxChange('willingToVolunteer', e.target.checked), className: "rounded" })] })] })] })] })), currentStep === 4 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-party/10 p-4 rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-party-orange" }), _jsx("h3", { className: "font-party text-lg", children: "Safety First!" })] }), _jsx("p", { className: "text-sm opacity-75", children: "We need this info to ensure everyone has a safe and fun experience!" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "emergencyContact", className: "font-party text-sm font-medium", children: "Emergency Contact Name *" }), _jsx(Input, { id: "emergencyContact", className: "input-party", placeholder: "Someone who cares about you", value: formData.emergencyContact, onChange: (e) => updateFormData('emergencyContact', e.target.value) }), errors.emergencyContact && _jsx("p", { className: "text-red-500 text-sm", children: errors.emergencyContact })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "emergencyPhone", className: "font-party text-sm font-medium", children: "Emergency Contact Phone *" }), _jsx(Input, { id: "emergencyPhone", type: "tel", className: "input-party", placeholder: "(555) 123-4567", value: formData.emergencyPhone, onChange: (e) => updateFormData('emergencyPhone', e.target.value) }), errors.emergencyPhone && _jsx("p", { className: "text-red-500 text-sm", children: errors.emergencyPhone })] })] }), _jsxs("div", { className: "bg-gradient-ocean/10 p-4 rounded-2xl", children: [_jsxs("h3", { className: "font-party text-lg mb-3 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-5 h-5" }), "Transportation & Logistics"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { htmlFor: "needsRide", className: "font-party text-sm", children: "Need a ride to the event?" }), _jsx("input", { type: "checkbox", id: "needsRide", checked: formData.needsTransportation, onChange: (e) => handleCheckboxChange('needsTransportation', e.target.checked), className: "rounded" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { htmlFor: "canDrive", className: "font-party text-sm", children: "Can offer rides to others?" }), _jsx("input", { type: "checkbox", id: "canDrive", checked: formData.canOfferRide, onChange: (e) => handleCheckboxChange('canOfferRide', e.target.checked), className: "rounded" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { htmlFor: "guests", className: "font-party text-sm", children: "Bringing guests?" }), _jsx("input", { type: "checkbox", id: "guests", checked: formData.bringingGuests, onChange: (e) => handleCheckboxChange('bringingGuests', e.target.checked), className: "rounded" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "additionalRequests", className: "font-party text-sm font-medium", children: "Additional Requests or Notes" }), _jsx("textarea", { id: "additionalRequests", className: "input-party w-full resize-none", placeholder: "Anything else we should know? \uD83D\uDCDD", rows: 3, value: formData.additionalRequests, onChange: (e) => updateFormData('additionalRequests', e.target.value) })] })] })), currentStep === 5 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-party/10 p-4 rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Trophy, { className: "h-5 w-5 text-party-green" }), _jsx("h3", { className: "font-party text-lg", children: "Almost There!" })] }), _jsx("p", { className: "text-sm opacity-75", children: "Review your information and confirm your RSVP to join the Beer Olympics!" })] }), _jsxs("div", { className: "bg-gradient-party/10 p-6 rounded-2xl", children: [_jsx("h3", { className: "font-party text-xl mb-4", children: "Your Registration Summary" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Name:" }), " ", formData.fullName] }), _jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", formData.email] }), _jsxs("p", { children: [_jsx("strong", { children: "Team:" }), " ", formData.teamName] }), _jsxs("p", { children: [_jsx("strong", { children: "Partner:" }), " ", formData.preferredPartner || 'Solo Champion'] }), _jsxs("p", { children: [_jsx("strong", { children: "Skill Level:" }), " ", formData.skillLevel] })] }), _jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Events:" }), " ", formData.attendingEvents.length, " selected"] }), _jsxs("p", { children: [_jsx("strong", { children: "T-Shirt:" }), " ", formData.shirtSize.toUpperCase()] }), _jsxs("p", { children: [_jsx("strong", { children: "Transportation:" }), " ", formData.needsTransportation ? 'Needs ride' : 'Has transport'] }), _jsxs("p", { children: [_jsx("strong", { children: "Volunteers:" }), " ", formData.willingToVolunteer ? 'Yes' : 'No'] }), _jsxs("p", { children: [_jsx("strong", { children: "Emergency Contact:" }), " ", formData.emergencyContact] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "terms", checked: formData.agreeToTerms, onChange: (e) => handleCheckboxChange('agreeToTerms', e.target.checked), className: "rounded" }), _jsx("label", { htmlFor: "terms", className: "font-party cursor-pointer text-sm", children: "I agree to the tournament rules and code of conduct *" })] }), errors.agreeToTerms && _jsx("p", { className: "text-red-500 text-sm", children: errors.agreeToTerms }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "updates", checked: formData.wantUpdates, onChange: (e) => handleCheckboxChange('wantUpdates', e.target.checked), className: "rounded" }), _jsx("label", { htmlFor: "updates", className: "font-party cursor-pointer text-sm", children: "Send me updates about the tournament" })] })] }), _jsxs("div", { className: "bg-gradient-victory/20 p-4 rounded-2xl text-center", children: [_jsx("p", { className: "font-party text-lg mb-2", children: "Ready to become a Beer Olympics legend? \uD83C\uDFC6" }), _jsx("p", { className: "text-sm opacity-75", children: "By submitting, you'll receive a confirmation email with all the details!" })] })] }))] })] }), _jsx(Card, { className: "card-party", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Button, { variant: "outline", onClick: handlePrevious, disabled: currentStep === 1, className: "font-party", children: "Previous" }), _jsx("div", { className: "flex space-x-2", children: [1, 2, 3, 4, 5].map((step) => (_jsx("div", { className: `w-3 h-3 rounded-full transition-colors ${step === currentStep
                                            ? 'bg-gradient-party'
                                            : step < currentStep
                                                ? 'bg-party-green'
                                                : 'bg-neutral-300'}` }, step))) }), currentStep < totalSteps ? (_jsx(Button, { onClick: handleNext, className: "btn-party font-party", children: "Next Step" })) : (_jsx(Button, { onClick: handleSubmit, disabled: isSubmitting, className: "btn-victory font-party", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Trophy, { className: "w-4 h-4 mr-2" }), "Confirm RSVP!"] })) }))] }) }) })] }) }));
}
