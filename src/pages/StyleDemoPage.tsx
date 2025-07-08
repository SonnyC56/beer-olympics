import { useState } from 'react';

export default function StyleDemoPage() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="font-beer text-6xl md:text-8xl text-glow animate-bounce-in">
          🍺 BEER OLYMPICS 🏆
        </h1>
        <p className="font-party text-2xl text-shadow-party animate-party-float">
          Where legends are made and beers are won! 🎉
        </p>
      </div>

      {/* Button Showcase */}
      <div className="card-party space-y-4">
        <h2 className="font-heading text-3xl text-center text-shadow">
          🚀 Spectacular Buttons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="btn-party animate-wiggle"
            onClick={() => setClicked(!clicked)}
          >
            Party Button! 🎉
          </button>
          <button className="btn-beer animate-beer-foam">
            Beer Button! 🍺
          </button>
          <button className="btn-victory">
            Victory Button! 🏆
          </button>
        </div>
      </div>

      {/* Card Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-party animate-bounce-in">
          <h3 className="font-party text-xl mb-3 text-party-pink">
            🎪 Party Card
          </h3>
          <p className="text-neutral-900">
            This card has party vibes with glow effects and smooth animations!
          </p>
          <div className="mt-4">
            <div className="h-2 bg-gradient-party rounded-full"></div>
          </div>
        </div>

        <div className="card-beer animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-beer text-xl mb-3 text-beer-dark">
            🍺 Beer Card
          </h3>
          <p className="text-beer-dark">
            Golden like beer foam with amber accents and beer-themed styling!
          </p>
          <div className="mt-4">
            <div className="h-2 bg-gradient-beer rounded-full"></div>
          </div>
        </div>

        <div className="card-victory animate-bounce-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-party text-xl mb-3 text-party-green">
            🏆 Victory Card
          </h3>
          <p className="text-neutral-900">
            Victory green with success vibes for winners and champions!
          </p>
          <div className="mt-4">
            <div className="h-2 bg-gradient-victory rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Input Showcase */}
      <div className="card-party space-y-4">
        <h2 className="font-heading text-3xl text-center text-shadow">
          ✨ Magical Inputs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="input-party"
            placeholder="Party input with glow effects! 🎉"
          />
          <input 
            className="input-beer"
            placeholder="Beer-themed input! 🍺"
          />
        </div>
      </div>

      {/* Animation Showcase */}
      <div className="card-party space-y-6">
        <h2 className="font-heading text-3xl text-center text-shadow">
          🎭 Amazing Animations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gradient-party rounded-2xl animate-wiggle">
            <div className="text-4xl mb-2">🎪</div>
            <div className="font-party text-white">Wiggle</div>
          </div>
          <div className="p-4 bg-gradient-beer rounded-2xl animate-party-float">
            <div className="text-4xl mb-2">🍺</div>
            <div className="font-party text-beer-dark">Float</div>
          </div>
          <div className="p-4 bg-gradient-victory rounded-2xl animate-beer-foam">
            <div className="text-4xl mb-2">🏆</div>
            <div className="font-party text-white">Foam</div>
          </div>
          <div className="p-4 bg-gradient-ocean rounded-2xl animate-pulse-glow">
            <div className="text-4xl mb-2">✨</div>
            <div className="font-party text-white">Glow</div>
          </div>
        </div>
      </div>

      {/* Typography Showcase */}
      <div className="card-party space-y-4">
        <h2 className="font-heading text-3xl text-center text-shadow">
          📝 Beautiful Typography
        </h2>
        <div className="space-y-3">
          <p className="font-beer text-2xl text-beer-dark text-center">
            BUNGEE FONT FOR BEER OLYMPICS! 🍺
          </p>
          <p className="font-party text-xl text-party-pink text-center">
            Fredoka font for party vibes! 🎉
          </p>
          <p className="font-sans text-lg text-neutral-900 text-center">
            Nunito font for readable content and body text.
          </p>
          <p className="text-glow text-xl text-center font-party">
            Glowing text effects! ✨
          </p>
        </div>
      </div>

      {/* Special Effects */}
      <div className="card-party space-y-6">
        <h2 className="font-heading text-3xl text-center text-shadow">
          🌟 Special Effects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-effect p-6 rounded-3xl">
            <h3 className="font-party text-xl mb-3 text-white">
              🔮 Glass Effect
            </h3>
            <p className="text-white/90">
              Glassmorphism with backdrop blur and transparency!
            </p>
          </div>
          <div className="party-border p-1 rounded-3xl">
            <div className="bg-neutral-0 p-5 rounded-3xl">
              <h3 className="font-party text-xl mb-3 text-party-pink">
                🌈 Animated Border
              </h3>
              <p className="text-neutral-900">
                Rainbow gradient border that shifts colors!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="card-party text-center space-y-4">
        <h2 className="font-heading text-3xl text-shadow">
          🎮 Interactive Demo
        </h2>
        <div 
          className={`
            p-8 rounded-3xl transition-all duration-500 cursor-pointer
            ${clicked 
              ? 'bg-gradient-victory shadow-victory animate-confetti' 
              : 'bg-gradient-party shadow-party'
            }
          `}
          onClick={() => setClicked(!clicked)}
        >
          <div className="text-6xl mb-4">
            {clicked ? '🏆' : '🎉'}
          </div>
          <p className="font-party text-2xl text-white text-shadow">
            {clicked ? 'VICTORY ACHIEVED!' : 'Click for victory!'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center space-y-2">
        <p className="font-party text-lg text-shadow-party">
          Made with 💖 and lots of ☕ for the ultimate Beer Olympics experience!
        </p>
        <div className="flex justify-center space-x-4 text-2xl animate-party-float">
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