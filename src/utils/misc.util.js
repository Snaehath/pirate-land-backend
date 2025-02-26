// packages
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

// custom
const client = require('./astra-database.util');

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

const updateLeaderBoard = async (userId, didWin) => {
    // fetch win and total played
    const QUERY = `
        SELECT wins, total_played FROM leaderboard
        WHERE pk = ? AND player_id = ? ALLOW FILTERING;
    `;
    const VALUES = [1, userId];
    const {rows} = await client.execute(QUERY, VALUES, {prepare: true});
    const wins = rows[0]?.wins ?? 0;
    const total_played = rows[0]?.total_played ?? 0;

    // delete that score
    const QUERY1 = `
        DELETE FROM leaderboard
        WHERE pk = ? AND wins = ? AND player_id = ?;
    `;
    const VALUES1 = [1, wins, userId];
    await client.execute(QUERY1, VALUES1, {prepare: true});

    // insert the new updated score
    const QUERY2 = `
        INSERT INTO leaderboard (pk, wins, player_id, total_played)
        VALUES (?, ?, ?, ?);
    `;
    const VALUES2 = [1, didWin ? wins + 1 : wins, userId, total_played + 1];
    await client.execute(QUERY2, VALUES2, {prepare: true});
};

module.exports = {
    getRandomUserName,
    getRandomRoomName,
    sleep,
    updateLeaderBoard,
};
