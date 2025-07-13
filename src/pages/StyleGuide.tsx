import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Beer, 
  PartyPopper, 
  Sparkles,
  Users,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  User,
  Heart,
  Star,
  Zap,
  Flame,
  Music,
  Camera,
  Gamepad2,
  Medal,
  Crown
} from 'lucide-react';

export default function StyleGuide() {
  const [activeTab, setActiveTab] = useState("colors");
  const [checkboxValue, setCheckboxValue] = useState(false);

  const colorPalette = {
    primary: [
      { name: "Party Pink", class: "bg-party-pink", hex: "#FF6B6B" },
      { name: "Party Cyan", class: "bg-party-cyan", hex: "#4ECDC4" },
      { name: "Party Yellow", class: "bg-party-yellow", hex: "#F9D71C" },
      { name: "Party Orange", class: "bg-party-orange", hex: "#FFA07A" },
      { name: "Victory Green", class: "bg-party-green", hex: "#A8E6CF" }
    ],
    beer: [
      { name: "Beer Amber", class: "bg-beer-amber", hex: "#F59E0B" },
      { name: "Beer Gold", class: "bg-beer-gold", hex: "#EAB308" },
      { name: "Beer Foam", class: "bg-beer-foam", hex: "#FEF3C7" },
      { name: "Beer Dark", class: "bg-beer-dark", hex: "#92400E" }
    ],
    gradients: [
      { name: "Party Gradient", class: "bg-gradient-party" },
      { name: "Sunset Gradient", class: "bg-gradient-sunset" },
      { name: "Beer Gradient", class: "bg-gradient-beer" },
      { name: "Victory Gradient", class: "bg-gradient-victory" },
      { name: "Ocean Gradient", class: "bg-gradient-ocean" }
    ]
  };

  const animations = [
    { name: "Bounce In", class: "animate-bounce-in", icon: <Zap /> },
    { name: "Wiggle", class: "animate-wiggle", icon: <Sparkles /> },
    { name: "Party Float", class: "animate-party-float", icon: <PartyPopper /> },
    { name: "Beer Foam", class: "animate-beer-foam", icon: <Beer /> },
    { name: "Pulse Glow", class: "animate-pulse-glow", icon: <Star /> },
    { name: "Confetti", class: "animate-confetti", icon: <Trophy /> }
  ];

  const icons = [
    Trophy, Beer, PartyPopper, Sparkles, Users, Calendar, Clock, 
    MapPin, Mail, Phone, User, Heart, Star, Zap, Flame, Music, 
    Camera, Gamepad2, Medal, Crown
  ];

  const tabs = [
    { id: "colors", name: "Colors", icon: "🎨" },
    { id: "typography", name: "Typography", icon: "📝" },
    { id: "components", name: "Components", icon: "📦" },
    { id: "forms", name: "Forms", icon: "📋" },
    { id: "animations", name: "Animations", icon: "🎭" },
    { id: "icons", name: "Icons", icon: "⭐" }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <h1 className="font-beer text-5xl md:text-7xl lg:text-8xl text-glow animate-bounce-in">
          🍺 BEER OLYMPICS STYLE GUIDE 🏆
        </h1>
        <p className="font-party text-xl md:text-2xl text-shadow-lg animate-party-float">
          The ultimate design system for legendary tournaments! 🎉
        </p>
      </div>

      {/* Navigation Tabs */}
      <Card className="card-party">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-xl font-party text-sm transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-party text-white shadow-glow' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <Card className="card-party">
          <CardHeader>
            <CardTitle className="font-beer text-3xl">🎨 COLOR PALETTE</CardTitle>
            <CardDescription className="font-party">Our vibrant and playful color system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Primary Colors */}
            <div>
              <h3 className="font-party text-xl mb-4 text-party-pink">Primary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {colorPalette.primary.map((color) => (
                  <div key={color.name} className="text-center space-y-2">
                    <div className={`${color.class} h-24 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer`} />
                    <p className="font-party text-sm">{color.name}</p>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{color.hex}</code>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-neutral-300" />

            {/* Beer Colors */}
            <div>
              <h3 className="font-party text-xl mb-4 text-beer-amber">Beer Theme Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {colorPalette.beer.map((color) => (
                  <div key={color.name} className="text-center space-y-2">
                    <div className={`${color.class} h-24 rounded-2xl shadow-beer hover:scale-105 transition-transform cursor-pointer`} />
                    <p className="font-party text-sm">{color.name}</p>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{color.hex}</code>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-neutral-300" />

            {/* Gradients */}
            <div>
              <h3 className="font-party text-xl mb-4 text-party-cyan">Gradient Collection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colorPalette.gradients.map((gradient) => (
                  <div key={gradient.name} className="text-center space-y-2">
                    <div className={`${gradient.class} h-32 rounded-2xl shadow-glow hover:scale-105 transition-transform cursor-pointer`} />
                    <p className="font-party text-sm text-shadow">{gradient.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Typography Tab */}
      {activeTab === "typography" && (
        <Card className="card-party">
          <CardHeader>
            <CardTitle className="font-beer text-3xl">📝 TYPOGRAPHY</CardTitle>
            <CardDescription className="font-party">Font families and text styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Font Families */}
            <div className="space-y-6">
              <div>
                <h3 className="font-party text-xl mb-4 text-party-pink">Font Families</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-party/10 rounded-2xl">
                    <p className="font-beer text-3xl mb-2">BUNGEE - BEER OLYMPICS CHAMPION FONT!</p>
                    <p className="font-party text-sm opacity-75">Used for bold headers and beer-themed elements</p>
                  </div>
                  <div className="p-4 bg-gradient-sunset/10 rounded-2xl">
                    <p className="font-party text-3xl mb-2">Fredoka - Party Time Font! 🎉</p>
                    <p className="font-party text-sm opacity-75">Perfect for headings and fun UI elements</p>
                  </div>
                  <div className="p-4 bg-gradient-ocean/10 rounded-2xl">
                    <p className="font-sans text-3xl mb-2">Nunito - Clean & Readable</p>
                    <p className="font-party text-sm opacity-75">Ideal for body text and content</p>
                  </div>
                </div>
              </div>

              <hr className="border-neutral-300" />

              {/* Text Sizes */}
              <div>
                <h3 className="font-party text-xl mb-4 text-party-cyan">Text Sizes</h3>
                <div className="space-y-3">
                  <p className="text-6xl font-beer">6XL - MEGA HEADER</p>
                  <p className="text-5xl font-party">5XL - Large Header</p>
                  <p className="text-4xl font-party">4XL - Big Title</p>
                  <p className="text-3xl font-party">3XL - Section Title</p>
                  <p className="text-2xl font-party">2XL - Subsection</p>
                  <p className="text-xl font-party">XL - Large Text</p>
                  <p className="text-lg">LG - Body Large</p>
                  <p className="text-base">Base - Regular Body</p>
                  <p className="text-sm">SM - Small Text</p>
                  <p className="text-xs">XS - Tiny Text</p>
                </div>
              </div>

              <hr className="border-neutral-300" />

              {/* Text Effects */}
              <div>
                <h3 className="font-party text-xl mb-4 text-party-yellow">Text Effects</h3>
                <div className="space-y-4">
                  <p className="text-3xl font-party text-shadow">Shadow Effect</p>
                  <p className="text-3xl font-party text-shadow-lg">Party Shadow</p>
                  <p className="text-3xl font-party text-glow">Glowing Text ✨</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Components Tab */}
      {activeTab === "components" && (
        <div className="space-y-8">
          {/* Buttons */}
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-2xl">🚀 BUTTONS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="btn-party">
                  <PartyPopper className="inline mr-2" size={20} />
                  Party Button! 🎉
                </button>
                <button className="btn-beer">
                  <Beer className="inline mr-2" size={20} />
                  Beer Button! 🍺
                </button>
                <button className="btn-victory">
                  <Trophy className="inline mr-2" size={20} />
                  Victory Button! 🏆
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-gradient-party hover:opacity-90">
                  <Sparkles className="mr-2" size={16} />
                  Gradient Party
                </Button>
                <Button variant="outline" className="border-party-pink border-2 text-party-pink hover:bg-party-pink/10">
                  <Heart className="mr-2" size={16} />
                  Outline Style
                </Button>
                <Button variant="ghost" className="text-party-cyan hover:bg-party-cyan/10">
                  <Star className="mr-2" size={16} />
                  Ghost Button
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-2xl">📦 CARDS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-party">
                  <h3 className="font-party text-xl mb-3 text-party-pink">🎪 Party Card</h3>
                  <p>Glowing effects and smooth animations for maximum party vibes!</p>
                  <div className="mt-4">
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-gradient-party h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="card-beer">
                  <h3 className="font-beer text-xl mb-3 text-beer-dark">🍺 Beer Card</h3>
                  <p className="text-beer-dark">Golden styling perfect for beer-themed content!</p>
                  <div className="mt-4">
                    <div className="w-full bg-beer-foam rounded-full h-2">
                      <div className="bg-beer-amber h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="card-victory">
                  <h3 className="font-party text-xl mb-3 text-party-green">🏆 Victory Card</h3>
                  <p>Celebrate wins with this triumphant card style!</p>
                  <div className="mt-4">
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-party-green h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-2xl">🏷️ BADGES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gradient-party text-white border-0 px-3 py-1 rounded-full text-sm font-party">Party Mode</span>
                <span className="bg-gradient-beer text-beer-dark border-0 px-3 py-1 rounded-full text-sm font-party">Beer Master</span>
                <span className="bg-gradient-victory text-white border-0 px-3 py-1 rounded-full text-sm font-party">Champion</span>
                <span className="border-party-pink text-party-pink border-2 px-3 py-1 rounded-full text-sm font-party">New</span>
                <span className="border-party-cyan text-party-cyan border-2 px-3 py-1 rounded-full text-sm font-party">Popular</span>
                <span className="border-party-yellow text-party-yellow border-2 px-3 py-1 rounded-full text-sm font-party">Hot</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forms Tab */}
      {activeTab === "forms" && (
        <Card className="card-party">
          <CardHeader>
            <CardTitle className="font-beer text-3xl">📋 FORM ELEMENTS</CardTitle>
            <CardDescription className="font-party">Interactive form components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Text Inputs */}
            <div>
              <h3 className="font-party text-xl mb-4 text-party-pink">Text Inputs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="party-input" className="font-party text-sm font-medium">Party Input</label>
                  <input 
                    id="party-input"
                    className="input-party w-full"
                    placeholder="Enter your team name! 🎉"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="beer-input" className="font-party text-sm font-medium">Beer Input</label>
                  <input 
                    id="beer-input"
                    className="input-beer w-full"
                    placeholder="Favorite beer? 🍺"
                  />
                </div>
              </div>
            </div>

            <hr className="border-neutral-300" />

            {/* Select & Textarea */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="event-select" className="font-party text-sm font-medium">Select Event</label>
                <select className="input-party w-full">
                  <option>Choose an event</option>
                  <option>🏓 Beer Pong</option>
                  <option>🥤 Flip Cup</option>
                  <option>🎯 Cornhole</option>
                  <option>🪙 Quarters</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="font-party text-sm font-medium">Team Message</label>
                <textarea 
                  id="message"
                  placeholder="Your victory speech... 🏆"
                  className="input-party w-full resize-none"
                  rows={3}
                />
              </div>
            </div>

            <hr className="border-neutral-300" />

            {/* Checkboxes & Radio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="font-party text-lg">Team Options</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={checkboxValue}
                      onChange={(e) => setCheckboxValue(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="terms" className="font-party cursor-pointer">
                      Ready to party! 🎉
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="rules" className="rounded" />
                    <label htmlFor="rules" className="font-party cursor-pointer">
                      Accept tournament rules
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="font-party text-lg">Team Size</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" name="teamSize" id="r1" />
                    <label htmlFor="r1" className="font-party cursor-pointer">Solo Champion 🏆</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" name="teamSize" id="r2" />
                    <label htmlFor="r2" className="font-party cursor-pointer">Dynamic Duo 👯</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" name="teamSize" id="r3" />
                    <label htmlFor="r3" className="font-party cursor-pointer">Party Squad 🎉</label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animations Tab */}
      {activeTab === "animations" && (
        <Card className="card-party">
          <CardHeader>
            <CardTitle className="font-beer text-3xl">🎭 ANIMATIONS</CardTitle>
            <CardDescription className="font-party">Bring your UI to life!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {animations.map((anim) => (
                <div key={anim.name} className="text-center space-y-4">
                  <div className={`w-24 h-24 mx-auto bg-gradient-party rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg ${anim.class}`}>
                    {anim.icon}
                  </div>
                  <p className="font-party text-lg">{anim.name}</p>
                  <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{anim.class}</code>
                </div>
              ))}
            </div>

            <hr className="border-neutral-300 my-8" />

            {/* Special Effects */}
            <div>
              <h3 className="font-beer text-2xl mb-6">✨ SPECIAL EFFECTS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-effect p-6 rounded-3xl text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-white" />
                  <h3 className="font-party text-xl mb-2 text-white">Glass Effect</h3>
                  <p className="text-white/90">Glassmorphism magic!</p>
                </div>
                <div className="party-border p-1 rounded-3xl">
                  <div className="bg-neutral-0 p-6 rounded-3xl text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-party-pink" />
                    <h3 className="font-party text-xl mb-2">Animated Border</h3>
                    <p className="text-neutral-900">Rainbow gradient shifts!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Icons Tab */}
      {activeTab === "icons" && (
        <Card className="card-party">
          <CardHeader>
            <CardTitle className="font-beer text-3xl">🎨 ICON COLLECTION</CardTitle>
            <CardDescription className="font-party">Essential icons for Beer Olympics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {icons.map((Icon, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 p-4 rounded-2xl hover:bg-gradient-party/10 transition-colors cursor-pointer group">
                  <Icon className="w-8 h-8 text-party-pink group-hover:text-party-cyan transition-colors" />
                  <span className="text-xs font-party opacity-0 group-hover:opacity-100 transition-opacity">
                    {Icon.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center space-y-4 pb-8">
        <p className="font-party text-xl text-shadow-lg">
          Ready to create legendary beer olympics experiences! 🍺🏆🎉
        </p>
        <div className="flex justify-center space-x-4 text-3xl animate-party-float">
          <span>🍺</span>
          <span>🎉</span>
          <span>🏆</span>
          <span>🎪</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  );
}