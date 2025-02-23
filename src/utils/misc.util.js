// packages
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const getRandomUserName = () => {
    const randomName = uniqueNamesGenerator({
        dictionaries: [Math.random() > 0.5 ? adjectives : colors, animals],
        separator: '',
        style: 'capital',
    });
    return randomName;
};

const getRandomRoomName = () => {
    const randomNo = Math.floor(10 + Math.random() * 90);
    const randomName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
        style: 'lowerCase',
    });
    return `${randomName}-${randomNo}`;
};

const sleep = (timeInMs) => new Promise(
    (resolve) => setTimeout(resolve, timeInMs)
);

module.exports = {
    getRandomUserName,
    getRandomRoomName,
    sleep,
};
