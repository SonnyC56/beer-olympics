import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [selectValue, setSelectValue] = useState("");

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

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <h1 className="font-beer text-5xl md:text-7xl lg:text-8xl text-glow animate-bounce-in">
          🍺 BEER OLYMPICS STYLE GUIDE 🏆
        </h1>
        <p className="font-party text-xl md:text-2xl text-shadow-party animate-party-float">
          The ultimate design system for legendary tournaments! 🎉
        </p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2 h-auto p-2 bg-white/80 backdrop-blur-md">
          <TabsTrigger value="colors" className="font-party data-[state=active]:bg-gradient-party data-[state=active]:text-white">Colors</TabsTrigger>
          <TabsTrigger value="typography" className="font-party data-[state=active]:bg-gradient-party data-[state=active]:text-white">Typography</TabsTrigger>
          <TabsTrigger value="components" className="font-party data-[state=active]:bg-gradient-party data-[state=active]:text-white">Components</TabsTrigger>
          <TabsTrigger value="forms" className="font-party data-[state=active]:bg-gradient-party data-[state=active]:text-white">Forms</TabsTrigger>
          <TabsTrigger value="animations" className="font-party data-[state=active]:bg-gradient-party data-[state=active]:text-white">Animations</TabsTrigger>
          <TabsTrigger value="icons" className="font-party data-[state=active]:bg-gradient-party data-[state=active]:text-white">Icons</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-8 mt-8">
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
                      <div className={`${color.class} h-24 rounded-2xl shadow-party hover:scale-105 transition-transform cursor-pointer`} />
                      <p className="font-party text-sm">{color.name}</p>
                      <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{color.hex}</code>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

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

              <Separator />

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
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-8 mt-8">
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

                <Separator />

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

                <Separator />

                {/* Text Effects */}
                <div>
                  <h3 className="font-party text-xl mb-4 text-party-yellow">Text Effects</h3>
                  <div className="space-y-4">
                    <p className="text-3xl font-party text-shadow">Shadow Effect</p>
                    <p className="text-3xl font-party text-shadow-party">Party Shadow</p>
                    <p className="text-3xl font-party text-glow">Glowing Text ✨</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-8 mt-8">
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
                <Button variant="default" className="bg-gradient-party hover:opacity-90">
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
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
                <div className="card-beer">
                  <h3 className="font-beer text-xl mb-3 text-beer-dark">🍺 Beer Card</h3>
                  <p className="text-beer-dark">Golden styling perfect for beer-themed content!</p>
                  <div className="mt-4">
                    <Progress value={50} className="h-2 bg-beer-foam" />
                  </div>
                </div>
                <div className="card-victory">
                  <h3 className="font-party text-xl mb-3 text-party-green">🏆 Victory Card</h3>
                  <p>Celebrate wins with this triumphant card style!</p>
                  <div className="mt-4">
                    <Progress value={100} className="h-2" />
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
                <Badge className="bg-gradient-party text-white border-0">Party Mode</Badge>
                <Badge className="bg-gradient-beer text-beer-dark border-0">Beer Master</Badge>
                <Badge className="bg-gradient-victory text-white border-0">Champion</Badge>
                <Badge variant="outline" className="border-party-pink text-party-pink">New</Badge>
                <Badge variant="outline" className="border-party-cyan text-party-cyan">Popular</Badge>
                <Badge variant="outline" className="border-party-yellow text-party-yellow">Hot</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-2xl">📢 ALERTS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-party-pink bg-party-pink/10">
                <PartyPopper className="h-4 w-4" />
                <AlertTitle className="font-party">Party Alert!</AlertTitle>
                <AlertDescription>The tournament is about to begin! Get ready! 🎉</AlertDescription>
              </Alert>
              <Alert className="border-beer-amber bg-beer-foam">
                <Beer className="h-4 w-4" />
                <AlertTitle className="font-beer">BEER ALERT!</AlertTitle>
                <AlertDescription className="text-beer-dark">Time for the next round! 🍺</AlertDescription>
              </Alert>
              <Alert className="border-party-green bg-party-green/10">
                <Trophy className="h-4 w-4" />
                <AlertTitle className="font-party">Victory!</AlertTitle>
                <AlertDescription>Congratulations! You've won! 🏆</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-8 mt-8">
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
                    <Label htmlFor="party-input" className="font-party">Party Input</Label>
                    <input 
                      id="party-input"
                      className="input-party w-full"
                      placeholder="Enter your team name! 🎉"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beer-input" className="font-party">Beer Input</Label>
                    <input 
                      id="beer-input"
                      className="input-beer w-full"
                      placeholder="Favorite beer? 🍺"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Select & Textarea */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="event-select" className="font-party">Select Event</Label>
                  <Select value={selectValue} onValueChange={setSelectValue}>
                    <SelectTrigger className="w-full border-2 border-party-cyan focus:ring-party-cyan">
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beer-pong">🏓 Beer Pong</SelectItem>
                      <SelectItem value="flip-cup">🥤 Flip Cup</SelectItem>
                      <SelectItem value="cornhole">🎯 Cornhole</SelectItem>
                      <SelectItem value="quarters">🪙 Quarters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="font-party">Team Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Your victory speech... 🏆"
                    className="border-2 border-party-pink focus:ring-party-pink resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Checkboxes & Radio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="font-party text-lg">Team Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={checkboxValue}
                        onCheckedChange={setCheckboxValue}
                        className="border-party-pink data-[state=checked]:bg-party-pink"
                      />
                      <Label htmlFor="terms" className="font-party cursor-pointer">
                        Ready to party! 🎉
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rules" 
                        className="border-party-cyan data-[state=checked]:bg-party-cyan"
                      />
                      <Label htmlFor="rules" className="font-party cursor-pointer">
                        Accept tournament rules
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-party text-lg">Team Size</Label>
                  <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="r1" className="border-party-pink text-party-pink" />
                      <Label htmlFor="r1" className="font-party cursor-pointer">Solo Champion 🏆</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="r2" className="border-party-cyan text-party-cyan" />
                      <Label htmlFor="r2" className="font-party cursor-pointer">Dynamic Duo 👯</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option3" id="r3" className="border-party-yellow text-party-yellow" />
                      <Label htmlFor="r3" className="font-party cursor-pointer">Party Squad 🎉</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              {/* Switch & Slider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="party-mode" className="font-party text-lg">Party Mode</Label>
                    <Switch
                      id="party-mode"
                      checked={switchValue}
                      onCheckedChange={setSwitchValue}
                      className="data-[state=checked]:bg-gradient-party"
                    />
                  </div>
                  <p className="text-sm text-neutral-600">
                    {switchValue ? "🎉 Party mode activated!" : "Enable for maximum fun!"}
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="excitement" className="font-party text-lg">
                    Excitement Level: {sliderValue[0]}%
                  </Label>
                  <Slider
                    id="excitement"
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span>Chill 😎</span>
                    <span>HYPED! 🚀</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-8 mt-8">
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-3xl">🎭 ANIMATIONS</CardTitle>
              <CardDescription className="font-party">Bring your UI to life!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {animations.map((anim) => (
                  <div key={anim.name} className="text-center space-y-4">
                    <div className={`w-24 h-24 mx-auto bg-gradient-party rounded-2xl flex items-center justify-center text-white text-4xl shadow-party ${anim.class}`}>
                      {anim.icon}
                    </div>
                    <p className="font-party text-lg">{anim.name}</p>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{anim.class}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Effects */}
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-2xl">✨ SPECIAL EFFECTS</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Icons Tab */}
        <TabsContent value="icons" className="space-y-8 mt-8">
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
        </TabsContent>
      </Tabs>

      {/* Usage Examples */}
      <Card className="card-party">
        <CardHeader>
          <CardTitle className="font-beer text-3xl">💡 USAGE TIPS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Alert className="border-party-pink bg-party-pink/10">
              <Sparkles className="h-4 w-4" />
              <AlertTitle className="font-party">Mobile First!</AlertTitle>
              <AlertDescription>All components are optimized for mobile devices</AlertDescription>
            </Alert>
            <Alert className="border-party-cyan bg-party-cyan/10">
              <Zap className="h-4 w-4" />
              <AlertTitle className="font-party">Performance</AlertTitle>
              <AlertDescription>Animations use GPU acceleration for smooth 60fps</AlertDescription>
            </Alert>
            <Alert className="border-party-yellow bg-party-yellow/10">
              <Heart className="h-4 w-4" />
              <AlertTitle className="font-party">Accessibility</AlertTitle>
              <AlertDescription>High contrast ratios and keyboard navigation</AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center space-y-4 pb-8">
        <p className="font-party text-xl text-shadow-party">
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