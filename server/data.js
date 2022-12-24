const data = [
  {
    category: "South of Boston",
    clues: [
      {
        text: "This state forest on the South Shore is the second largest state forest in the State.",
        answer: "Myles Standish State Forrest",
      },
      {
        text: "This south of Boston town with a population of 3,000 is the home of the Dennett Elementary School.",
        answer: "Plympton",
      },
      {
        text: "This south of Boston town was once known as Bare Cove when it was first settled by Pilgrims in 1633.",
        answer: "Hingham",
        isDailyDouble: true,
      },
      {
        text: "The south shore town 13 miles east of Randolph where the actress Jennifer Coolidge grew up",
        answer: "Norwell",
      },
      {
        text: "If you drew a perfectly straight horizontal line on a map starting from Duxbury Beach east to Europe, what would be the first European country you'd hit?",
        answer: "Spain",
      },
    ],
  },
  {
    category: "Song and Artist",
    clues: [
      {
        text: "I put my hands up they're playing my song - 2009",
        answer: "Party in the U.S.A - Miley Cyrus",
      },
      {
        text: "I just met you and this is crazy so here's my number - 2012.",
        answer: "Call Me Maybe - Carly Rae Jepsen",
      },
      {
        text: "Not a trace of doubt in my mind - 1967.",
        answer: "I'm a believer - The Monkees",
      },
      {
        text: "Say after me, it's no better to be safe than sorry - 1985",
        answer: "Take on Me - A-ha",
      },
      {
        text: "Teenage wasteland, it's only teenage wasteland - 1971.",
        answer: "Baba O'Riley - The Who",
      },
    ],
  },
  {
    category: "2000s",
    clues: [
      {
        text: "This social media platform allowed users to choose their Top 8 friends. ",
        answer: "MySpace",
      },
      {
        text: "In which year was the first Saw film released",
        answer: "2004",
      },
      {
        text: "This is what the 'TY' tag on a Beanie Baby stands for",
        answer: "Ty Warner",
      },
      {
        text: "The movie with this quote: “Exercise Gives You Endorphins. Endorphins Make You Happy. Happy People Just Don’t Shoot Their Husbands. They Just Don’t”",
        answer: "Legally Blonde",
      },
      {
        text: "Who was the biggest selling artist of the 2000s?",
        answer: "Eminem",
      },
    ],
  },
  {
    category: "Name That Movie",
    clues: [
      {
        text: "Well, that esclated quickly",
        answer: "Anchorman",
      },
      {
        text: "My mama always said life was like a box of chocolates",
        answer: "Forrest Gump",
      },
      {
        text: "I'm gonna make him an offer he can't refuse",
        answer: "The Godfather",
      },
      {
        text: "Do you prefer 'fashion victim' or 'ensemble-y challenged?",
        answer: "Clueless",
      },
      {
        text: "You know, I've always wanted a child. And now I think I'll have one on toast!",
        answer: "Hocus Pocus",
        isDailyDouble: true,
      },
    ],
  },
  {
    category: "Older Celebrities",
    clues: [
      {
        text: "This actress played the Mom in Mrs. Doubtfire",
        answer: "Sally Field",
      },
      {
        text: "This actor voiced the character of Darth Vader in Star Wars",
        answer: "James Earl Jones",
      },
      {
        text: "On the big screen in 2004, this actor stole the Declaration of Independence",
        answer: "Nicholas Cage",
      },
      {
        text: "The actress that plays the mom in Home Alone",
        answer: "Catherine O'Hara",
      },
      {
        text: "The character Arthur Herbert Fonzarelli in the show Happy Days is played by this actor",
        answer: "Henry Winkler",
      },
    ],
  },
  {
    category: "Sports",
    clues: [
      {
        text: "Gisele Bundchen's ex-husband'",
        answer: "Thomas Brady",
      },
      {
        text: "The New England Patriots were trailing the Atlanta Falcons by up to this amount before winning Superbowl 51",
        answer: "25",
      },
      {
        text: "What is the only team in the NFL to neither host nor play in the Super Bowl?",
        answer: "Cleveland Browns",
      },
      {
        text: "The national sport of Canada",
        answer: "Lacrosee",
      },
      {
        text: "The boxer that beat Muhammad Ali",
        answer: "Joe Frazier",
      },
    ],
  },
];

const dataRoundTwo = [
  {
    category: "Geography",
    clues: [
      {
        text: "The longest river in the world at 4,132 miles long",
        answer: "The Nile River",
      },
      {
        text: "Mount Everest exists in this mountain range in Nepal",
        answer: "The Himalayas",
      },
      {
        text: "What is the only continent that exists in all four hempispheres (North, East, South, and West)",
        answer: "Africa",
        isDailyDouble: true,
      },
      {
        text: "This specific body of water separates Southern England from Northern France",
        answer: "The English Channel",
      },
      {
        text: "The country of Greenland is technically part of the Kingdom of this small European country",
        answer: "Denmark",
      },
    ],
  },
  {
    category: "Booze",
    clues: [
      {
        text: "This cocktail named after a boroguh of New York is comprised of spicy rye and sweet vermouth",
        answer: "Manhattan",
      },
      {
        text: "This cocktail is made from gin, lemon juice, sugar, and carbonated water",
        answer: "Tom Collins",
      },
      {
        text: "This brewing company is named after a mountain range that runs through California and part of a neighboring state",
        answer: "Sierra Nevada",
      },
      {
        text: "James Bond's drink of choice",
        answer: "Vodka (Vesper) Martini",
      },
      {
        text: "This drink is a mix of Goslings rum and ginger beer",
        answer: "Dark 'n' Stormy",
      },
    ],
  },
  {
    category: "Also Known As",
    clues: [
      { text: "Norma Jeane Mortenson", answer: "Marilyn Monroe" },
      { text: "Stefani Germanotta ", answer: "Lady Gaga" },
      { text: "Carlos Esteves", answer: "Charlie Sheen" },
      { text: "Mark Sinclair", answer: "Vin Diesel" },
      { text: "Aubrey Graham", answer: "Drake" },
    ],
  },
  {
    category: "Dead, Canadian, Both, or Neither",
    clues: [
      { text: "Paul Walker", answer: "Dead" },
      { text: "Sarah McLachlan", answer: "Canadian" },
      { text: "Norm Macdonald", answer: "Both" },
      { text: "Keanu Reeves", answer: "Canadian", isDailyDouble: true },
      { text: "Robin Williams", answer: "Dead" },
    ],
  },
  {
    category: "Fill in the lyric",
    clues: [
      {
        text: "Just a city boy, born and raised in ______ ______",
        answer: "South Detroit",
      },
      {
        text: "Cause this is thriller, thriller night, and no one’s gonna save you from the ______ about to strike",
        answer: "Beast",
      },
      {
        text: "This hit, that ice cold, Michelle Pfeiffer, that ______ ______",
        answer: "White Gold",
      },
      {
        text: "Oh my God, look at that face, you look like my next ______",
        answer: "Mistake",
      },
      {
        text: "I’m through with standin’ in lines to clubs I’ll never get in, it’s like the bottom of the ninth and I’m _____ _____ _____",
        answer: "Never gonna win",
      },
    ],
  },
  {
    category: "Random",
    clues: [
      { text: "Name the band: 🚫👂🐆", answer: "Def Leppard" },
      {
        text: "What color outfit was Jacqueline Kennedy wearing in public on Nov 22, 1963",
        answer: "Pink",
      },
      {
        text: "The name of a country which ends with the letter L",
        answer: "Brazil, Portugal, Senegal, Israel or Nepal",
      },
      {
        text: "The westernmost city of the following cities: Las Vegas, Reno, San Diego, Los Angeles",
        answer: "Reno",
      },
      {
        text: "The number you get when you multiply all the numbers on a roulette wheel",
        answer: "0",
      },
    ],
  },
];

module.exports = { data, dataRoundTwo };
