const data = [
  {
    category: "Pop Culture",
    clues: [
      {
        text: `Finish this quote from The Office: “I’m not superstitious, but I am a _____ _____."`,
        answer: "little stitious",
      },
      {
        text: "What day do Star Wars fans celebrate “National Star Wars Day”?",
        answer: "May 4th",
      },
      {
        text: "Which ‘Real Housewives’ star was sentenced to serve six and a half years in prison for defrauding the elderly?",
        answer: "Jen Shah of The Real Housewives of Salt Lake City.",
        isDailyDouble: true,
      },
      {
        text: "In 2011, Kim Kardashian attempted to become a singer. This is the name of her first and only musical release",
        answer: "Jam (Turn It Up)",
      },
      {
        text: "What is the name of Jennifer Coolidge’s character on White Lotus?",
        answer: "Tanya McQuoid",
      },
    ],
  },
  {
    category: "Pop Culture 2",
    clues: [
      {
        text: "Tom Brady has won this many superbowls",
        answer: "6",
      },
      {
        text: "On what gameshow was Meghan Markle once cast as a “briefcase girl”?",
        answer: "Deal or No Deal",
      },
      {
        text: "Who wrote the script for the 2004 teen comedy, Mean Girls?",
        answer: "Tina Fey",
      },
      {
        text: "This is the name of the coffee shop in the sitcom Friends",
        answer: "Central Perk",
      },
      {
        text: `The Word “Simba” is derived from what language, which translates to "Lion"?`,
        answer: "Swahili",
      },
    ],
  },
  {
    category: "Celebrities' Real Names",
    clues: [
      {
        text: "Peter Gene Hernandez",
        answer: "Bruno Mars",
      },
      {
        text: "Katheryn Hudson",
        answer: "Katy Perry",
      },
      {
        text: "Olivia Cockburn",
        answer: "Olivia Wilde",
      },
      {
        text: "Neta-Lee Hershlag",
        answer: "Natalie Portman",
      },
      {
        text: "Eric Marlon Bishop",
        answer: "Jamie Foxx",
      },
    ],
  },
  {
    category: "State Capitals",
    clues: [
      {
        text: "California",
        answer: "Sacramento",
      },
      {
        text: "Louisiana",
        answer: "Forrest Gump",
      },
      {
        text: "New Hampshire",
        answer: "Concord",
      },
      {
        text: "Maryland",
        answer: "Annapoilis",
      },
      {
        text: "Pennsylvania",
        answer: "Harrisburg",
        isDailyDouble: true,
      },
    ],
  },
  {
    category: "First lines from a book",
    clues: [
      {
        text: "Once there were four children whose names were Peter, Susan, Edmund, and Lucy. This story is about something that happened to them when they were sent away from London during the war because of the air-raids.",
        answer: "The Lion, The Witch and The Wardrobe",
      },
      {
        text: "It was a pleasure to burn.",
        answer: "Fahrenheit 451",
      },
      {
        text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.",
        answer: "The Great Gatsby",
      },
      {
        text: "It was a bright cold day in April, and the clocks were striking thirteen",
        answer: "1984",
      },
      {
        text: "You better not never tell nobody but God. It’d kill your mammy.",
        answer: "The Color Purple",
      },
    ],
  },
  {
    category: "Sports",
    clues: [
      {
        text: "How long is a mile?",
        answer: "26.2",
      },
      {
        text: "This is what the rings in the Olympics represent",
        answer: "The continents of the world",
      },
      {
        text: "Which NFL team has a lightning bolt on the players’ helmet",
        answer: "Los Angeles Chargers",
      },
      {
        text: "Which American Football team won the first two Super Bowls (in 1967 and 1968)?",
        answer: "Green Bay Packers",
      },
      {
        text: "What NHL team emerges onto the ice from the giant jaws of a sea beast at home games?",
        answer: "San Jose Sharks",
      },
    ],
  },
];

const dataRoundTwo = [
  {
    category: "Name That Flower",
    clues: [
      {
        text: "hosta.jpg",
        answer: "Hosta",
      },
      {
        text: "peonies.jpg",
        answer: "Peonies",
      },
      {
        text: "hydrangea.jpg",
        answer: "Hydrangea",
      },
      {
        text: "orchid.jpg",
        answer: "Orchid",
      },
      {
        text: "salvias.jpeg",
        answer: "Salvias (Sage)",
      },
    ],
  },
  {
    category: "Facebook Status Authors",
    clues: [
      {
        text: "Fuck yeah, Obamacare!! (June 2012)",
        answer: "Nicole Morell",
      },
      {
        text: "Excited for the butcher shop tonight 🙂 (February 2010)",
        answer: "Sarah",
        // isDailyDouble: true,
      },
      {
        text: "NYC! This place serves warm nuts! (January 2015)",
        answer: "Jeff",
      },
      {
        text: "Brian and I have a dirty little secret...it's called egg salad",
        answer: "Sam",
      },
      {
        text: "Where's Count Chocula??? I'm seriously pissed about this. (October 2009)",
        answer: "Mandy",
      },
    ],
  },
  {
    category: "Before & After",
    clues: [
      {
        text: "A landmark Louisiana area featuring Bourbon Street and a classic burger from McDonald's",
        answer: "French Quarter Pounder",
      },
      {
        text: "Luxury auto from the Ford Motor Company that also served as Washington's fighting force",
        answer: "Lincoln Continental Army",
      },
      {
        text: "Bridesmaids & SNL star who guided Santa's Sleigh",
        answer: "Maya Rudolph The Red-Nosed Reindeer",
      },
      {
        text: "I'll have a vodka & tomato juice drink with a Julie Andrews movie chaser",
        answer: "Bloody Mary Poppins",
        isDailyDouble: true,
      },
      {
        text: "Black Rock Nevada annual festival that's used as a football strategy where one player matches up with another",
        answer: "Burning Man-To-Man",
      },
    ],
  },
  {
    category: "Disney Movies in Emojis",
    clues: [
      { text: "🔍🐟", answer: "Finding Nemo" },
      { text: "👸🏻🌹👹", answer: "Beauty and the Beast" },
      { text: "🐒🪔🧞‍♂️", answer: "Aladdin" },
      { text: "👩🏻🐉🗡", answer: "Mulan", isDailyDouble: true },
      { text: "🧸📖", answer: "Toy Story" },
    ],
  },
  {
    category: "Synonym Movie",
    clues: [
      {
        text: "Awe Lady",
        answer: "Wonder Woman",
      },
      {
        text: "Unkind Women",
        answer: "Mean Girls",
      },
      {
        text: "Assignment Unmanageable",
        answer: "Mission Impossible",
      },
      {
        text: "Speedy And Enraged",
        answer: "Fast & Furious",
      },
      {
        text: "Oil",
        answer: "Grease",
      },
    ],
  },
  {
    category: "Guess That Song",
    clues: [
      { text: "hero.mp3", answer: "Hero - Mariah Carey" },
      {
        text: "sunday-bloody-sunday.mp3",
        answer: "Sunday Bloody Sunday - U2",
      },
      {
        text: "tubthumping.mp3",
        answer: "Tubthumping - Chumbawamba",
      },
      {
        text: "waterfalls.mp3",
        answer: "Waterfalls - TLC",
      },
      {
        text: "you-make-my-dreams.mp3",
        answer: "You Make My Dreams - Hall & Oates",
      },
    ],
  },
];

module.exports = { data, dataRoundTwo };
