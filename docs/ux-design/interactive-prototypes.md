# Beer Olympics - Interactive Prototype Specifications

## Prototype Overview

This document provides specifications for creating interactive prototypes using tools like Figma, Framer, or ProtoPie. Each prototype demonstrates key user flows with realistic interactions and animations.

## 1. Tournament Join Flow Prototype

### Screens & Interactions

#### Screen 1: QR Code Scan
```
Interaction: Camera view with QR overlay
Trigger: Auto-detect QR code
Animation: Success pulse + haptic feedback
Transition: Slide up to tournament preview
```

#### Screen 2: Tournament Preview
```
Components:
- Hero image with parallax scroll
- Tournament stats cards (animated counters)
- Team previews (horizontal scroll)
- Sticky CTA button

Interactions:
- Pull to refresh
- Tap team card for details
- Swipe between sections
```

#### Screen 3: Team Creation
```
Step 1: Name Entry
- Keyboard slides up
- Real-time character count
- Availability check animation

Step 2: Color Selection
- Color swatches with ripple effect
- Preview updates in real-time
- Recent colors section

Step 3: Avatar/Flag
- Grid with bounce animations
- Search/filter functionality
- Custom upload option

Transition: Confetti animation on completion
```

### Micro-interactions
- Loading states: Skeleton screens
- Success states: Green checkmarks with spring animation  
- Error states: Red shake animation
- Progress indicator: Stepped dots with fill animation

## 2. Live Match Experience Prototype

### Real-time Score Entry
```
Prototype Flow:
1. Match card expands on tap
2. Score steppers appear with haptic feedback
3. Numbers roll up/down smoothly
4. "Submit" button pulses when scores change
5. Confirmation animation (checkmark morph)
6. Card collapses with updated score
```

### Interactive Elements
- **Score Steppers**: Hold for rapid increment
- **Undo Button**: Swipe left reveals undo
- **Photo Proof**: Camera integration mockup
- **Timer**: Live countdown with urgency states

### Animation Specifications
```javascript
// Score increment animation
{
  duration: 300ms,
  easing: "spring(1, 80, 10, 0)",
  scale: [1, 1.2, 1],
  opacity: [0.7, 1, 1]
}

// Submit button states
idle: { scale: 1, shadow: "0 2px 4px rgba(0,0,0,0.1)" }
hover: { scale: 1.05, shadow: "0 4px 8px rgba(0,0,0,0.2)" }
pressed: { scale: 0.95, shadow: "0 1px 2px rgba(0,0,0,0.1)" }
loading: { rotate: 360, repeat: "infinite", duration: 1000 }
```

## 3. Achievement Unlock Prototype

### Unlock Sequence
```
1. Trigger: Action completed
2. Screen dim (0.7 opacity overlay)
3. Achievement badge scales in from 0
4. Particle burst animation
5. Badge details fade in
6. Progress bar fills
7. Share options slide up
8. Auto-dismiss after 3s or tap
```

### Interactive Achievement Gallery
- 3D card flip on tap
- Progress rings animate on view
- Category filters with smooth transitions
- Locked achievements show requirements on hover

## 4. Team Communication Prototype

### Chat Interface
```
Features to Prototype:
- Message bubbles with tail animations
- Typing indicators (3 dots pulse)
- Read receipts (checkmark transitions)
- Voice message waveform animation
- Photo preview with pinch to zoom
- Emoji picker with categories
- @mention autocomplete
```

### Interactive Elements
- **Pull to load history**: Elastic bounce
- **Swipe to reply**: Message slides right
- **Long press menu**: Context options
- **Voice recording**: Waveform visualization

## 5. Spectator Mode Prototype

### Live Match View
```
Layout:
┌─────────────────────────┐
│ [Live video placeholder]│
│ ┌─────────┬───────────┐ │
│ │ Team A  │  Team B   │ │
│ │   12    │    8      │ │
│ └─────────┴───────────┘ │
│ [Reaction bar]          │
│ [Comment stream]        │
└─────────────────────────┘

Interactions:
- Tap to show/hide UI
- Swipe up for full comments
- Double tap to react
- Pinch to zoom on action
```

### Animation Timeline
```
0ms: User joins stream
100ms: UI elements fade in
200ms: Score counters animate to current
300ms: First comments slide in
Continuous: New comments push up
Continuous: Reactions float up and fade
```

## 6. Tournament Creation Wizard

### Multi-step Form
```
Step Transitions:
- Forward: Slide left with parallax
- Backward: Slide right with bounce
- Progress bar: Smooth fill animation
- Step numbers: Scale and color change
```

### Interactive Preview
- **Bracket Visualization**: Builds as options selected
- **Team Slots**: Animate in as max teams changes
- **Date Picker**: Calendar with availability heat map
- **Format Preview**: Mini tournament simulation

## 7. Gamification Elements

### XP Gain Animation
```javascript
// XP counter animation
{
  from: currentXP,
  to: currentXP + earned,
  duration: 1500,
  easing: "easeOutExpo",
  onUpdate: (value) => {
    // Update displayed number
    // Add subtle shake at milestones
    // Trigger level up if threshold passed
  }
}
```

### Level Up Sequence
1. Screen flash (white, 0.2 opacity)
2. Current badge shrinks
3. New badge materializes with particles
4. Rank text morphs to new level
5. Reward preview slides in
6. Confetti cannon effect

## 8. Mobile Gestures Prototype

### Swipe Actions Demo
- **Match Cards**: Right = check in, Left = details
- **Score Entry**: Up/down = increment/decrement
- **Team List**: Right = quick actions menu
- **Photos**: Pinch = zoom, Double tap = like

### Pull Interactions
- **Pull to Refresh**: Custom tournament logo stretch
- **Pull to Load More**: Infinite scroll with loader
- **Pull to Reveal**: Hidden options in headers

## 9. Responsive Behavior Demo

### Breakpoint Transitions
Show smooth transitions between:
- Mobile portrait (360px)
- Mobile landscape (667px)
- Tablet (768px)
- Desktop (1024px+)

Key behaviors:
- Navigation morphs from bottom tabs to sidebar
- Cards reflow from stack to grid
- Touch targets adjust size
- Hover states enable/disable

## 10. Accessibility Features

### Prototype Considerations
- **Focus indicators**: Visible tab navigation
- **Screen reader hints**: Label animations
- **High contrast mode**: Toggle demonstration
- **Reduced motion**: Alternative animations
- **Large text support**: Responsive scaling

## Technical Prototype Specs

### Performance Targets
- 60 FPS for all animations
- <100ms interaction response
- Smooth scrolling (no jank)
- Hardware acceleration where possible

### Device Testing Matrix
- iPhone 12/13/14 (standard & Pro)
- Samsung Galaxy S21/S22
- iPad Air/Pro
- Various Android tablets
- Desktop browsers

### Export Requirements
- Figma: Use Smart Animate
- Framer: Export as React components
- ProtoPie: Include sensor inputs
- After Effects: Lottie file exports

## Prototype Deliverables

### Core Flows (Priority 1)
1. Complete tournament join flow
2. Live score submission
3. Achievement unlock
4. Team chat basics

### Enhanced Flows (Priority 2)
1. Tournament creation wizard
2. Spectator mode
3. Social sharing
4. Dispute resolution

### Polish (Priority 3)
1. Micro-interactions library
2. Loading states collection
3. Error states collection
4. Empty states collection

## Handoff Specifications

### Design Tokens
```json
{
  "animation": {
    "duration": {
      "instant": "100ms",
      "fast": "200ms", 
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "spring": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      "bounce": "cubic-bezier(0.87, -0.41, 0.19, 1.44)"
    }
  }
}
```

### Component States
Document all states for each component:
- Default/Idle
- Hover (desktop only)
- Active/Pressed
- Disabled
- Loading
- Success
- Error

### Interaction Patterns
- Tap: Immediate response
- Long press: 500ms threshold
- Swipe: 50px threshold
- Pinch: 10% scale threshold
- Pull: 80px threshold