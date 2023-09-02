const data = [
  {
    category: "Song Mashups",
    clues: [
      {
        text: "01_hot_in_here.mp3",
        answer: "Nelly - Hot in Here + Bee gee's - Stayin' Alive",
      },
      {
        text: "02_all_my_life.mp3",
        answer: "Lion King - Circle of Life + Foo Fighters - All My Life",
      },
      {
        text: "03_all_star.mp3",
        answer: "The Chainsmokers - Closer + Smashmouth - All Star",
        isDailyDouble: true,
      },
      {
        text: "04_britney.mp3",
        answer: "Billy Joel - We Didn't Start The Fire + Any Way You Want It",
      },
      {
        text: "05_nirvana.mp3",
        answer:
          "Nirvana - Smells Like Teen Spirit + Rick Astley - Never Gonna Give You Up",
      },
    ],
  },
  {
    category: "Song Mashups 2",
    clues: [
      {
        text: "07_californiacation.mp3",
        answer:
          "EAGLES - HOTEL CALIFORNIA + Red Hot Chilli Peppers - CALIFORNICATION",
      },
      {
        text: "08_whitney.mp3",
        answer:
          "WHITNEY HOUSTON – HOW WILL I KNOW + JOURNEY – DON’T STOP BELIEVING",
      },
      {
        text: "06_mumford.mp3",
        answer:
          "MUMFORD AND SONS - LITTLE LION MAN + MILEY CYRUS - WRECKING BALL",
      },
      {
        text: "09_taylor.mp3",
        answer: "MARSHMELLOW BASTILLE - HAPPIER + TAYLOR SWIFT - BLANK SPACE",
      },
      {
        text: "10_mgmt.mp3",
        answer: "MGMT - KIDS VS EARTH WIND AND FIRE - SEPTEMBER",
      },
    ],
  },
  {
    category: "2000s",
    clues: [
      {
        text: "This social media platform allowed users to choose their Top 8 friends.",
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
        text: "The biggest selling artist of the 2000s",
        answer: "Eminem",
      },
    ],
  },
  {
    category: "Movie Quotes",
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
        text: "Tthe only team in the NFL to neither host nor play in the Super Bowl",
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
]

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
        text: "The only continent that exists in all four hempispheres (North, East, South, and West)",
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
    category: "Movie GIFs",
    clues: [
      {
        text: "napoleon.gif",
        answer: "Napoleon Dynamite",
      },
      {
        text: "braveheart.gif",
        answer: "Braveheart",
      },
      {
        text: "wizardofoz.gif",
        answer: "Charlie and the Chocolate Factory",
      },
      {
        text: "indianajones.gif",
        answer: "Indiana Jones: Raiders of the Lost Ark",
      },
      {
        text: "the_outsiders.gif",
        answer: "The Outsiders",
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
        text: "Oh my God, look at that face, you look like my ______ ______",
        answer: "Next Mistake",
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
        text: "This color outfit that Jacqueline Kennedy wearing in public on Nov 22, 1963",
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
]

module.exports = { data, dataRoundTwo }
