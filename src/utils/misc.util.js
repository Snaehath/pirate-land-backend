// packages
const { uniqueNamesGenerator, adjectives, colors, animals, starWars } = require('unique-names-generator');

const getRandomUserName = () => {
    const randomName = uniqueNamesGenerator({
        dictionaries: [Math.random() > 0.5 ? adjectives : colors, animals],
        separator: ' ',
        style: 'capital',
    });
    return randomName;
};

module.exports = {
    getRandomUserName
};
