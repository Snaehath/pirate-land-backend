CREATE TABLE IF NOT EXISTS tokens (
    id TEXT,
    tkn TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT,
    name TEXT,
    avatar INT,
    current_game TIMEUUID,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS islands (
    id TEXT,
    creator TEXT,
    invitee TEXT,
    creator_payed BOOLEAN,
    invitee_payed BOOLEAN,
    chance TEXT,
    status TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS boards (
    island_id TEXT,
    player_id TEXT,
    positions TEXT,
    PRIMARY KEY (island_id, player_id)
);

CREATE TABLE IF NOT EXISTS scorecards (
    island_id TEXT,
    creator_score INT,
    invitee_score INT,
    PRIMARY KEY (island_id)
);

CREATE TABLE IF NOT EXISTS history (
    player_id TEXT,
    id TIMEUUID,
    island_id TEXT,
    status TEXT,
    opponent TEXT,
    PRIMARY KEY (player_id, id)
) WITH CLUSTERING ORDER BY (id DESC);

CREATE TABLE IF NOT EXISTS messages (
    island_id TEXT,
    id TIMEUUID,
    sender TEXT,
    receiver TEXT,
    message TEXT,
    PRIMARY KEY (island_id, id)
) WITH CLUSTERING ORDER BY (id DESC);

CREATE TABLE IF NOT EXISTS leaderboard (
    pk INT,
    player_id TEXT,  
    wins INT,
    total_played INT,
    PRIMARY KEY (pk, wins, player_id)
) WITH CLUSTERING ORDER BY (wins DESC);
