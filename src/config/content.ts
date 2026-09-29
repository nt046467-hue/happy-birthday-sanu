export interface MemoryItem {
  id: string;
  title: string;
  text: string;
  mediaType: 'video' | 'gif' | 'image';
  src: string;
  fallbackSrc?: string;
  poster?: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
}

export interface ContentConfig {
  recipient: {
    name: string;
    displayName: string;
    greeting: string;
  };
  from: {
    name: string;
    signature: string;
    foreverSignature: string;
  };
  gate: {
    title: string;
    subtitle: string;
    cta: string;
  };
  giftBox: {
    badge: string;
    title: string;
    subtitle: string;
    hint: string;
  };
  tease: {
    title: string;
    lines: string[];
    buttonText: string;
  };
  nameReveal: {
    title: string;
    subtitle: string;
    letters: string[];
    words: string[];
    completedText: string;
  };
  cake: {
    candleCount: number;
    plaqueText: string;
    title: string;
    singLine: string;
    subtitles: {
      idle: string;
      blowing: string;
      wish: string;
      relitBlow: string;
    };
    blownMessage: string;
    blownSub: string;
    continueButtonText: string;
  };
  cut: {
    instruction: string;
    hint: string;
    sliceMessage: string;
    buttonText: string;
  };
  partyOverlay: {
    title: string;
    subtitle: string;
  };
  unwrap: {
    wishes: string[];
  };
  memories: MemoryItem[];
  photos: {
    url: string;
    caption?: string;
  }[];
  letter: {
    badge: string;
    title: string;
    paragraphs: {
      text: string;
      highlight?: string;
      italic?: string;
      emphasis?: boolean;
    }[];
    signature: string;
    tagline: string;
  };
  finale: {
    bigLove: string;
    body: string;
    signature: string;
    replayCta: string;
  };
  theme: {
    pink: string;
    purple: string;
    gold: string;
    sky: string;
    mint: string;
    deep: string;
  };
}

export const content: ContentConfig = {
  recipient: {
    name: "Karu",
    displayName: "Karu",
    greeting: "Hey Karu ❤️💋",
  },
  from: {
    name: "Nabin",
    signature: "— Nabin, always 💌",
    foreverSignature: "— Forever yours, Nabin 💌",
  },
  gate: {
    title: "Happy Birthday Karu",
    subtitle: "A personal universe built just for you",
    cta: "Tap to begin 💖",
  },
  giftBox: {
    badge: "✨ Just For You, Karu",
    title: "Hey Karu ❤️💋",
    subtitle: "Something wrapped in roses, stardust, and all the love I carry for you — just for you, today.\n\nAre you ready to feel it? 🌸",
    hint: "👇 tap the gift above 👇",
  },
  tease: {
    title: "My Karu 🌸",
    lines: [
      "I spent all day building this — just for you.",
      "Every pixel made with love, every line written from the heart.",
      "You deserve the whole universe, Karu. Today, I give you this. 🌟💖",
    ],
    buttonText: "Take me there 💕",
  },
  nameReveal: {
    title: "Spell our magic 💍",
    subtitle: "Tap each heart and watch the magic bloom...",
    letters: ["K", "A", "R", "U"],
    words: [
      "K — my heart knows only you",
      "A — always, in every lifetime",
      "R — rare, radiant, irreplaceable",
      "U — you are my greatest love",
    ],
    completedText: "That's you, Karu 💖 — my whole world!",
  },
  cake: {
    candleCount: 5,
    plaqueText: "Karu",
    title: "🎂 Blow the candles out, Karu! 🎂",
    singLine: "Make it count, Karu 🎶",
    subtitles: {
      idle: "Hold the button, Karu, and blow into your mic 💨",
      blowing: "🔥 Keep blowing!! 💨",
      wish: "✨ Make a wish, Karu…",
      relitBlow: "Hold the button & blow — make your wish come true! 💫",
    },
    blownMessage: "Make a wish, my love ✨💖",
    blownSub: "Every flame is gone — just like you light up every corner of my heart, forever 🌸",
    continueButtonText: "Now cut the cake together! 🔪✨",
  },
  cut: {
    instruction: "🔪 Slide to cut the cake, Karu!",
    hint: "👆 Touch & drag across the cake to cut it!",
    sliceMessage: "Happy Birthday, my dearest Karu! 🎂💖",
    buttonText: "Continue, love 💌",
  },
  partyOverlay: {
    title: "🎉 Happy Birthday Karu! 🎂",
    subtitle: "You are so deeply, endlessly loved ✨💖",
  },
  unwrap: {
    wishes: [
      "Opening your special gift... 🎁",
      "Wrapping with love... 💖",
      "Adding magical sparkles... ✨",
      "Almost ready for you, Karu... 🌸",
      "Here it comes! 💝",
    ],
  },
  memories: [
    {
      id: "stage5",
      title: "Happy Birthday Karu 🎂😘",
      text: "The most beautiful, the most precious, the most loved person in my world — that's you, Karu. Every single day. 🌸💖",
      mediaType: "gif",
      src: "https://media.tenor.com/_R8NbYgMmz8AAAAi/bubu-dudu-sseeyall.gif",
      fallbackSrc: "/media/bubu-dudu-sseeyall.gif",
      poster: "/media/poster-1.webp",
      primaryButtonText: "There's more for you 💌",
    },
    {
      id: "stage6",
      title: "That's us, always 🐻🐷",
      text: "Soft, silly, completely crazy in love with each other. I wouldn't trade one single second with you for anything in this world. You are my person. 💓",
      mediaType: "gif",
      src: "https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif",
      fallbackSrc: "/media/bear-kiss.gif",
      poster: "/media/poster-2.webp",
      primaryButtonText: "Show me my real gift 🎁",
      secondaryButtonText: "You're too cute 😘",
    },
  ],
  photos: [],
  letter: {
    badge: "🎁",
    title: "To My Karu, With All My Heart 💍",
    paragraphs: [
      { text: "My dearest Karu 💖" },
      {
        text: "The real gift I give you today is me — every breath, every heartbeat, every version of me, now and forever.",
        highlight: "me",
      },
      {
        text: "My arms are your home. My heart is your safe place. Every single day I wake up and I choose you — always you.",
        italic: "always you.",
      },
      {
        text: "You make ordinary moments feel like magic. You make me feel like the luckiest person alive.",
      },
      {
        text: "On this birthday and every birthday to come — I promise to love you deeper, hold you tighter, and make you smile the widest. 🌸",
      },
      {
        text: "Happy Birthday, my love. 🎂✨",
        emphasis: true,
      },
    ],
    signature: "— Forever yours, Nabin 💌",
    tagline: "You are my favourite everything 🌸",
  },
  finale: {
    bigLove: "Karu, you're not just my favourite —\nyou're my whole entire world. 🌍💖",
    body: "On your birthday and every single day after this — you are deeply, endlessly, unconditionally, and forever loved by me. 🎂🌸✨",
    signature: "— Nabin, always 💌",
    replayCta: "Replay ✨",
  },
  theme: {
    pink: "#f472b6",
    purple: "#c084fc",
    gold: "#fbbf24",
    sky: "#38bdf8",
    mint: "#34d399",
    deep: "#0d0010",
  },
};
