# Beer Olympics - Component Specifications

## Component Library

### 1. Tournament Card Component

#### Visual Design
```
┌─────────────────────────────────────┐
│ [Image/Gradient Background]         │
│                                     │
│ 🏆 Tournament Name                  │
│ 📅 July 4, 2024 · 2:00 PM         │
│ 📍 Backyard Stadium                 │
│ 👥 8/16 Teams                      │
│                                     │
│ ┌─────────────┬─────────────┐      │
│ │ [Join Now]  │ [View Info] │      │
│ └─────────────┴─────────────┘      │
└─────────────────────────────────────┘
```

#### Props
- `tournament`: Tournament object
- `variant`: 'full' | 'compact' | 'minimal'
- `onJoin`: Function
- `onView`: Function

#### States
- Default
- Hover (desktop)
- Pressed
- Disabled (full)
- Loading

### 2. Match Score Component

#### Visual Design
```
┌─────────────────────────────────────┐
│ Beer Pong · Round 3 · Court 2       │
├─────────────────────────────────────┤
│   🦅 Eagles          Sharks 🦈      │
│   ┌─────┐            ┌─────┐        │
│   │  12 │    VS      │  8  │        │
│   └─────┘            └─────┘        │
│                                     │
│   [−] [+]            [−] [+]        │
├─────────────────────────────────────┤
│ 🔴 Live · Updated 30s ago           │
└─────────────────────────────────────┘
```

#### Interactive States
- Editable (organizer/player)
- Read-only (spectator)
- Disputed (yellow border)
- Confirmed (green check)

### 3. Team Badge Component

#### Variants
```
Compact:            Full:                 Mini:
┌─────────┐        ┌─────────────────┐   ┌───┐
│ 🦅 │ 3W │        │ 🦅 Eagles       │   │ 🦅 │
└─────────┘        │ 3W - 1L · 45pts │   └───┘
                   └─────────────────┘
```

#### Props
- `team`: Team object  
- `size`: 'mini' | 'compact' | 'full'
- `showStats`: boolean
- `interactive`: boolean

### 4. Achievement Badge

#### Visual Structure
```
┌─────────────┐
│    🏆       │
│ First Blood │
│ ⭐⭐⭐⭐⭐    │
└─────────────┘
```

#### Animation States
- Locked (grayscale)
- Unlocking (glow animation)
- Unlocked (full color)
- Featured (pulse effect)

### 5. Quick Action Button (FAB)

#### States & Context
```
Default:        Match Soon:      In Game:        Post Game:
┌────┐         ┌────┐          ┌────┐          ┌────┐
│ 📝 │         │ ✓  │          │ 📊 │          │ 🎉 │
└────┘         └────┘          └────┘          └────┘
Submit         Check In        Score           Share
```

#### Behaviors
- Position: Bottom right, 16px margin
- Animation: Scale in/out
- Ripple effect on tap
- Context-aware icon/action

### 6. Live Feed Item

#### Structure
```
┌─────────────────────────────────────┐
│ [Avatar] Team Eagles · 2 min ago    │
├─────────────────────────────────────┤
│ 🏆 Just won Beer Pong vs Sharks!    │
│ Final Score: 12-8                   │
│                                     │
│ [Photo/Video Thumbnail]             │
├─────────────────────────────────────┤
│ 👍 12  💬 3  🔥 5     [Share]      │
└─────────────────────────────────────┘
```

### 7. Progress Indicators

#### Tournament Progress
```
Round Progress:
[===========|-----] 3/5 Rounds

Points to Lead:
You: 45 ▓▓▓▓▓▓▓░░░ 
1st: 62 ▓▓▓▓▓▓▓▓▓▓

Match Completion:
┌───┬───┬───┬───┬───┐
│ ✓ │ ✓ │ 🎮 │   │   │
└───┴───┴───┴───┴───┘
```

### 8. Notification Components

#### In-App Notification
```
┌─────────────────────────────────────┐
│ 🔔 Your match starts in 5 minutes!  │
│ Beer Pong vs Sharks · Court 2       │
│ [Dismiss] [Check In]                │
└─────────────────────────────────────┘
```

#### Toast Notifications
- Success: Green with checkmark
- Warning: Yellow with alert icon
- Error: Red with X icon
- Info: Blue with info icon

### 9. Modal Overlays

#### Score Dispute Modal
```
┌─────────────────────────────────────┐
│ ❌                    Dispute Score │
├─────────────────────────────────────┤
│ Reported Score: Eagles 12 - 8 Sharks│
│                                     │
│ What's the issue?                   │
│ ○ Incorrect score                   │
│ ○ Rule violation                    │
│ ○ Other                            │
│                                     │
│ Evidence:                           │
│ [📸 Add Photo] [🎥 Add Video]      │
│                                     │
│ Additional Info:                    │
│ [___________________________]      │
│                                     │
│ [Cancel]          [Submit Dispute]  │
└─────────────────────────────────────┘
```

### 10. Navigation Components

#### Bottom Navigation Bar
```
┌─────────────────────────────────────┐
│     🏠        🏆        📊        👤 │
│    Home    Matches    Stats   Profile│
│     ●                                │
└─────────────────────────────────────┘
```

States:
- Active: Filled icon + dot indicator
- Inactive: Outline icon
- Badge: Red notification count

### 11. Data Input Components

#### Team Color Picker
```
┌─────────────────────────────────────┐
│ Select Team Color                   │
├─────────────────────────────────────┤
│ ⚪ ⚫ 🔴 🟠 🟡 🟢 🔵 🟣         │
│ Recent: 🔴 🔵 🟢                   │
│                                     │
│ Custom: [#______] 🎨               │
└─────────────────────────────────────┘
```

#### Score Stepper
```
┌─────────────────────────────────────┐
│        Team Score: 12               │
│   ┌───┐  ┌─────┐  ┌───┐           │
│   │ − │  │  12  │  │ + │           │
│   └───┘  └─────┘  └───┘           │
│         Min: 0  Max: 21            │
└─────────────────────────────────────┘
```

## Animation Specifications

### Micro-Interactions
1. **Button Press**: Scale to 0.95, return to 1.0
2. **Card Hover**: Elevate 4px, subtle shadow
3. **Score Update**: Number rolls up/down
4. **Achievement Unlock**: Burst particle effect

### Page Transitions
1. **Push**: Slide in from right
2. **Modal**: Fade in with scale
3. **Tab Switch**: Slide horizontally
4. **Refresh**: Pull down with bounce

### Loading States
```
Skeleton Screen:
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                     │
│ ▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓                  │
│                                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Breakpoint Adjustments
- **Mobile (<768px)**: Stack all elements vertically
- **Tablet (768-1024px)**: 2-column layouts where appropriate
- **Desktop (>1024px)**: Multi-column, hover states enabled

### Touch vs Mouse
- Touch: Larger tap targets, swipe gestures
- Mouse: Hover states, right-click menus
- Both: Keyboard navigation support

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Color contrast ratios: 4.5:1 minimum
- Focus indicators: 3px outline
- Screen reader labels: All interactive elements
- Keyboard navigation: Tab order logical

### Motion Preferences
- Respect `prefers-reduced-motion`
- Alternative to animations
- Option to disable auto-play media

## Performance Targets

### Loading Times
- Initial render: <1s
- Interaction response: <100ms  
- Animation FPS: 60fps
- Image loading: Progressive

### Bundle Sizes
- Core components: <50KB
- Full library: <200KB
- Lazy load non-critical
- Tree-shaking enabled