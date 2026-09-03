export const poems = [
  {
    id: 'twinkle',
    title: 'Twinkle, Twinkle, Little Star',
    emoji: '⭐',
    level: 'Easy',
    lines: [
      'Twinkle, twinkle, little star,',
      'How I wonder what you are!',
      'Up above the world so high,',
      'Like a diamond in the sky.',
      'Twinkle, twinkle, little star,',
      'How I wonder what you are!',
    ],
  },
  {
    id: 'humpty',
    title: 'Humpty Dumpty',
    emoji: '🥚',
    level: 'Easy',
    lines: [
      'Humpty Dumpty sat on a wall,',
      'Humpty Dumpty had a great fall.',
      'All the king’s horses and all the king’s men',
      'Couldn’t put Humpty together again.',
    ],
  },
  {
    id: 'jack-and-jill',
    title: 'Jack and Jill',
    emoji: '🪣',
    level: 'Easy',
    lines: [
      'Jack and Jill went up the hill',
      'To fetch a pail of water.',
      'Jack fell down and broke his crown,',
      'And Jill came tumbling after.',
    ],
  },
  {
    id: 'baa-baa',
    title: 'Baa, Baa, Black Sheep',
    emoji: '🐑',
    level: 'Easy',
    lines: [
      'Baa, baa, black sheep, have you any wool?',
      'Yes sir, yes sir, three bags full.',
      'One for the master, one for the dame,',
      'And one for the little boy who lives down the lane.',
    ],
  },
  {
    id: 'spider',
    title: 'The Itsy Bitsy Spider',
    emoji: '🕷️',
    level: 'Easy',
    lines: [
      'The itsy bitsy spider climbed up the waterspout.',
      'Down came the rain and washed the spider out.',
      'Out came the sun and dried up all the rain,',
      'And the itsy bitsy spider climbed up the spout again.',
    ],
  },
]

export function getPoem(id) {
  return poems.find((poem) => poem.id === id)
}
