const honeyILoveYou = new URL('../Honey, I Love You.mp3', import.meta.url).href
const iseoluwa = new URL('../iseoluwa.mp3', import.meta.url).href
const wa = new URL('../Wa.mp3', import.meta.url).href

export const keepsake = {
  name: 'Iseoluwa',
  age: 25,
  from: 'Pelumi',
  portrait: {
    src: 'https://iili.io/nYkeyKv.md.jpg',
    alt: 'Portrait of Iseoluwa smiling',
  },
  songs: [
    { title: 'Honey, I Love You', artist: 'AEO', length: '3:59', src: honeyILoveYou },
    { title: 'Iseoluwa', artist: 'Fireboy DML', length: '3:18', src: iseoluwa },
    { title: 'Wa', artist: 'Asake', length: '2:27', src: wa },
  ],
  photos: [
    { src: 'https://iili.io/nYkeVMG.md.jpg', alt: 'Friends laughing together outdoors', caption: 'the two of you' },
    { src: 'https://iili.io/nYkekN9.md.jpg', alt: 'Family gathered together and smiling', caption: 'home, always' },
    { src: 'https://iili.io/nYkeeA7.md.jpg', alt: 'Friends celebrating together', caption: 'smallie mi' },
    { src: 'https://iili.io/nYkeWPf.md.jpg', alt: 'Friends walking together in warm sunlight', caption: 'forever my baby' },
    { src: 'https://iili.io/nYk6jln.md.jpg', alt: 'Friends gathered closely and smiling', caption: 'always and forever' },
  ],
  letter: [
    "Heyyyy babyyy miiiii, I don't think I've ever written you a letter before, but I need to tell you how much you mean to me. Happy Happy Birthday my love, I'm so grateful to have you as a sister mehn, nobody fight pass us for that house but na us still join pass. I love you so so much that words would fail me if I tried to express it. You're always there for me, and I hope you know that I'm always here for you too. I pray that this year brings you all the happiness and success you deserve, and that we continue to make amazing memories together. I love you to the moon and back",
    "I've grown so much just by watching you and learning from you. Your strength, resilience, and kindness inspire me every day. I hope this birthday is just the beginning of a year filled with happiness, laughter, and unforgettable moments. May all your dreams come true, and may you continue to shine brightly in everything you do.",
    "You're such a beautiful human beinggg, I'd legit do ANYTHING for you.You always support me mehn and anytime I call I know you'd surely surely pick up the call. Thank you for your patience, your laugh, and your prayers for me when I didn't ask. May this year be gentle with you and full of good surprises.I can't wait for the world to see you in full forceee, and I can't wait to see all the amazing things you will accomplish. I love you so much, and I'm so grateful to have you in my life. Happy Birthday, my love!",
  ],
}
