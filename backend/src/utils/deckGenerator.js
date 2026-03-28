const { randomUUID } = require('crypto');

const makeCard = (color, value) => ({
    id: randomUUID(),
    color,
    value
});

const generateDeck = () => {
    const colors = ['red', 'yellow', 'green', 'blue'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw_two'];
    const deck = [];

    colors.forEach(color => {
        values.forEach(value => {
            // One '0' per color, two of the rest
            deck.push(makeCard(color, value));
            if (value !== '0') {
                deck.push(makeCard(color, value));
            }
        });
    });

    // 4 Wilds and 4 Wild Draw Fours
    for (let i = 0; i < 4; i++) {
        deck.push(makeCard('wild', 'wild'));
        deck.push(makeCard('wild', 'wild_draw_four'));
    }

    return deck;
};

module.exports = generateDeck;
