const data = [
  {
    category: "South of Boston",
    clues: [
      {
        text: "Steve Carrell owns this establishment in Marshfield.",
        answer: "Marshfield Hills General Store",
      },
      {
        text: "This state forest on the South Shore is the second largest state forest in the State.",
        answer: "Myles Standish State Forrest",
      },
      {
        text: "This south of Boston town, home of the Dennett Elementary School, had a population of 2,930 in 2020.",
        answer: "Plympton",
      },
      {
        text: "This south of Boston town was once known as Bare Cove when it was first settled by some murderous Pilgrims in 1633.",
        answer: "Hingham",
        isDailyDouble: true,
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
        text: "So you can take that cookie and stick it up your, YEAH! - 1999.",
        answer: "Nookie - Limp Bizkit",
      },
      {
        text: "They see me rollin', they hatin' - 2005.",
        answer: "Ridin' - Chamillionaire",
      },
      {
        text: "I put my hands up they're playing my song - 2009",
        answer: "Party in the U.S.A - Miley Cyrus",
      },
      {
        text: "Somewhere between the sacred silence and sleep - 2001",
        answer: "Toxicity - System of a Down",
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
        text: "This kiss between these songstresses rocked the MTV Music Awards in 2003",
        answer: "Madonna and Britney Spears",
      },
      {
        text: "This is what the 'ty' tag on a Beanie Baby stood for",
        answer: "Ty Warner",
      },
      {
        text: "Which movie had the highest box office collections in the 2000s?",
        answer: "Avatar",
      },
      {
        text: "This repetitively-named 2000s rock band is led by the singer, songwriter, and guitarist Karen O",
        answer: "Yeah Yeah Yeahs",
      },
    ],
  },
  {
    category: "Classical Memery",
    clues: [
      {
        text: "This meme depicts a Shiba Inu with a quizzical face",
        answer: "Doge",
      },
      {
        text: "This man with braces is not known for his good fortune",
        answer: "Bad Luck Brian",
      },
      {
        text: "The classic facepalm meme depicts Patrick Stewart playing this character in Star Trek",
        answer: "Jean-Luc Picard",
      },
      {
        text: "This backwards hat wearing fool is the antithesis of Good Guy Greg",
        answer: "Scumbag Steve",
      },
      {
        text: "This thought-provoking dinosaur that asks all the right questions",
        answer: "Philosoraptor",
      },
    ],
  },
  {
    category: "Name That Boomer",
    clues: [
      {
        text: "This actress played the Mom in the movie Mrs. Doubtfire",
        answer: "Sally Field",
      },
      {
        text: "This Boomer politician looks like a turtle. That's it. That's the clue.",
        answer: "Mitch McConnell",
      },
      {
        text: "This Snakes on a Plane actor is known for his potty mouth.",
        answer: "Samuel L. Jackson",
      },
      {
        text: "On the big screen in 2004, this Boomer stole the Declaration of Independence",
        answer: "Nicholas Cage",
      },
      {
        text: "This buxom country icon once lost a lookalike contest for herself.",
        answer: "Dolly Parton",
      },
    ],
  },
  {
    category: "Sportsball",
    clues: [
      {
        text: "Gisele Bundchen's ex-husband'",
        answer: "Thomas Brady",
      },
      {
        text: "The New England Patriots were trailing the Atlanta Falcons by this amount before winning Superbowl 51",
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
        text: "This boxer beat Muhammad Ali",
        answer: "Joe Frazier",
      },
    ],
  },
];

const dataRoundTwo = [
  {
    category: "History 2",
    clues: [
      { text: "History 1", answer: "Answer" },
      { text: "History 2", answer: "Answer" },
      { text: "History 3", answer: "Answer" },
      { text: "History 4", answer: "Answer" },
      { text: "History 5", answer: "Answer" },
    ],
  },
  {
    category: "Geography 2",
    clues: [
      { text: "Geography 1", answer: "Answer" },
      { text: "Geography 2", answer: "Answer" },
      { text: "Geography 3", answer: "Answer" },
      { text: "Geography 4", answer: "Answer" },
      { text: "Geography 5", answer: "Answer" },
    ],
  },
  {
    category: "Science 2",
    clues: [
      { text: "Science 1", answer: "Answer!" },
      { text: "Science 2", answer: "Answer!" },
      { text: "Science 3", answer: "Answer!" },
      { text: "Science 4", answer: "Answer!" },
      { text: "Science 5", answer: "Answer!" },
    ],
  },
  {
    category: "Astronomy 2",
    clues: [
      { text: "Astronomy 1", answer: "Answer!" },
      { text: "Astronomy 2", answer: "Answer!" },
      { text: "Astronomy 3", answer: "Answer!" },
      { text: "Astronomy 4", answer: "Answer!" },
      { text: "Astronomy 5", answer: "Answer!" },
    ],
  },
  {
    category: "Celebrities 2",
    clues: [
      { text: "Celebrities 1", answer: "Answer!" },
      { text: "Celebrities 2", answer: "Answer!" },
      { text: "Celebrities 3", answer: "Answer!" },
      { text: "Celebrities 4", answer: "Answer!" },
      { text: "Celebrities 5", answer: "Answer!" },
    ],
  },
  {
    category: "Dennett-ology 2",
    clues: [
      { text: "Dennett-ology 1", answer: "Answer!" },
      { text: "Dennett-ology 2", answer: "Answer!" },
      { text: "Dennett-ology 3", answer: "Answer!" },
      { text: "Dennett-ology 4", answer: "Answer!" },
      { text: "Dennett-ology 5", answer: "Answer!" },
    ],
  },
];

module.exports = { data, dataRoundTwo };
