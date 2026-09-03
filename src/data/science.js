export const scienceTopics = [
  {
    id: 'plants',
    title: 'Plants',
    emoji: '🌱',
    color: 'from-emerald-200 to-lime-100',
    facts: [
      'Plants need sunlight to grow strong and green.',
      'Water helps the roots drink, like a straw.',
      'Most plants grow in soil, which holds them up.',
    ],
    quiz: [
      {
        question: 'What do plants need to grow?',
        choices: ['Sunlight', 'Toys', 'Cars'],
        answer: 'Sunlight',
      },
      {
        question: 'What do roots drink?',
        choices: ['Juice', 'Water', 'Milk'],
        answer: 'Water',
      },
      {
        question: 'Where do most plants grow?',
        choices: ['In soil', 'In the sky', 'In a shoe'],
        answer: 'In soil',
      },
    ],
  },
  {
    id: 'animals',
    title: 'Animals',
    emoji: '🐾',
    color: 'from-amber-200 to-orange-100',
    facts: [
      'Animals can walk, swim, fly, or hop.',
      'Dogs and cats have fur. Birds have feathers.',
      'Animals need food, water, and a safe home.',
    ],
    quiz: [
      {
        question: 'What do birds have?',
        choices: ['Feathers', 'Wheels', 'Leaves'],
        answer: 'Feathers',
      },
      {
        question: 'What do dogs and cats have?',
        choices: ['Fur', 'Scales', 'Petals'],
        answer: 'Fur',
      },
      {
        question: 'What do animals need?',
        choices: ['Food and water', 'Homework', 'Keys'],
        answer: 'Food and water',
      },
    ],
  },
  {
    id: 'weather',
    title: 'Weather',
    emoji: '🌤️',
    color: 'from-sky-200 to-indigo-100',
    facts: [
      'The sun makes the day bright and warm.',
      'Rain helps plants drink and puddles appear.',
      'Wind is air that moves. Clouds can hide the sun.',
    ],
    quiz: [
      {
        question: 'What makes the day bright?',
        choices: ['The sun', 'A lamp in space', 'The moon only'],
        answer: 'The sun',
      },
      {
        question: 'What does rain help?',
        choices: ['Plants', 'Rocks to sleep', 'Stars to twinkle'],
        answer: 'Plants',
      },
      {
        question: 'What is wind?',
        choices: ['Moving air', 'Moving water', 'Moving sand only'],
        answer: 'Moving air',
      },
    ],
  },
]

export function getScienceTopic(id) {
  return scienceTopics.find((topic) => topic.id === id)
}
